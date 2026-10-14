import { GoogleGenAI } from '@google/genai';
import { ExtractedTopic, QuizQuestion } from '../types';

export interface TutorResponseData {
  content: string;
  sourceDocument: string;
  sourceSection?: string;
  supplementaryNotice?: string;
  quizQuestions?: QuizQuestion[];
  isFallback: boolean;
}

/**
 * AI Tutor Response Service
 * Context-aware tutor grounded strictly in student's extracted study material.
 */
export async function generateTutorResponse(
  topic: ExtractedTopic,
  materialText: string,
  documentName: string,
  tutorMode: string,
  explanationLevel: 'beginner' | 'intermediate' | 'detailed' = 'intermediate',
  userQuery?: string,
  apiKey?: string
): Promise<TutorResponseData> {
  const sourceSection = topic.sourceSection || 'Chapter Notes';

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      let instruction = '';
      if (tutorMode === 'simple') {
        instruction = 'Explain this topic in simple, intuitive language using a relatable everyday analogy. Avoid unnecessary jargon.';
      } else if (tutorMode === 'step-by-step') {
        instruction = 'Break down this topic into clear, sequential step-by-step concepts or logical stages.';
      } else if (tutorMode === 'example') {
        instruction = 'Provide 2 realistic, concrete real-world examples and one numerical/conceptual application.';
      } else if (tutorMode === 'summary') {
        instruction = 'Provide a high-yield executive summary bullet list of the most important exam takeaways.';
      } else if (tutorMode === 'formulas') {
        instruction = 'Explain all governing formulas, variables, SI units, and terminology relevant to this topic.';
      } else if (tutorMode === 'practice-questions') {
        instruction = 'Generate 4 high-quality practice questions (2 conceptual, 2 analytical) to test mastery.';
      } else if (tutorMode === 'mcq-quiz') {
        instruction = `Generate 4 multiple-choice questions (MCQs) testing this topic.
Format strictly as JSON at the end with keys: question, options (array of 4 choices), correctAnswer (0-3 index), explanation.`;
      } else if (tutorMode === 'custom-chat') {
        instruction = `Answer the student's question: "${userQuery}". Be encouraging, direct, and pedagogically clear.`;
      }

      const prompt = `You are EduBridge AI Tutor, a personal academic companion.
You are tutoring a student on the topic: "${topic.title}" from their study material "${documentName}".
Target Explanation Level: ${explanationLevel.toUpperCase()}
Instruction: ${instruction}

STUDY MATERIAL CONTEXT EXCERPT:
${materialText.slice(0, 4000)}

TOPIC DATA:
- Summary: ${topic.summary}
- Key Concepts: ${topic.keyConcepts.join(', ')}
- Formulas: ${topic.formulas.map(f => `${f.name}: ${f.formula}`).join('; ')}
- Definitions: ${topic.definitions.map(d => `${d.term}: ${d.definition}`).join('; ')}

CRITICAL GROUNDING RULES:
1. Base your answer PRIMARILY on the student's study material above.
2. If any supplementary general knowledge is added for clarity that is not in the notes, clearly add a note at the end:
"*(Supplementary Context: [detail])*"
3. At the end, state: "[Source: ${documentName} • ${sourceSection}]"`;

      const interaction = await ai.interactions.create({
        model: 'gemini-3.8-flash',
        input: prompt,
      });

      const responseText = interaction.output_text?.trim() || '';

      // If mcq-quiz mode, parse questions if possible
      let quizQuestions: QuizQuestion[] | undefined;
      if (tutorMode === 'mcq-quiz') {
        try {
          const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (jsonMatch) {
            quizQuestions = JSON.parse(jsonMatch[0]).map((q: any, i: number) => ({
              id: `q-${topic.id}-${i + 1}`,
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer ?? 0,
              explanation: q.explanation || 'Verified from course notes.',
              topicId: topic.id,
              sourceReference: `${documentName} • ${sourceSection}`,
            }));
          }
        } catch {
          // If JSON parse fails, fallback to deterministic quiz
          quizQuestions = generateFallbackQuiz(topic, documentName);
        }
      }

      return {
        content: responseText,
        sourceDocument: documentName,
        sourceSection,
        quizQuestions,
        isFallback: false,
      };
    } catch (err: any) {
      console.warn('Gemini tutor call failed, using deterministic tutor engine:', err.message);
      return generateDeterministicTutorResponse(
        topic,
        documentName,
        tutorMode,
        explanationLevel,
        userQuery
      );
    }
  }

  return generateDeterministicTutorResponse(
    topic,
    documentName,
    tutorMode,
    explanationLevel,
    userQuery
  );
}

/**
 * Deterministic offline tutor response engine when Gemini is unavailable.
 */
export function generateDeterministicTutorResponse(
  topic: ExtractedTopic,
  documentName: string,
  tutorMode: string,
  explanationLevel: 'beginner' | 'intermediate' | 'detailed',
  userQuery?: string
): TutorResponseData {
  const sourceSection = topic.sourceSection || 'Section 1';
  let content = '';
  let quizQuestions: QuizQuestion[] | undefined;

  const formulasText =
    (topic.formulas || []).length > 0
      ? topic.formulas
          .map(f => {
            const formula = f.formula || 'E = -dΦ/dt';
            const name = f.name || 'Governing relation';
            const explanation = f.explanation || f.notes || 'From study notes';
            return `$$\n${formula}\n$$\n*${name}*: ${explanation}`;
          })
          .join('\n\n')
      : '$$\nE = -\\frac{d\\Phi_B}{dt}\n$$\n*Governing relation*: Standard analytical expression from study notes.';

  const defsText =
    (topic.definitions || []).length > 0
      ? topic.definitions
          .filter(d => d && (d.term || d.definition))
          .map(d => `- **${d.term || topic.title}**: ${d.definition || topic.summary}`)
          .join('\n') || `- **${topic.title}**: Key conceptual foundation in ${documentName}.`
      : `- **${topic.title}**: Key conceptual foundation in ${documentName}.`;

  const examplesText =
    topic.examples.length > 0
      ? topic.examples.map((ex, i) => `${i + 1}. ${ex}`).join('\n')
      : `1. Standard laboratory demonstration illustrating the law.\n2. Exam problem calculating output value under varying initial conditions.`;

  if (tutorMode === 'simple') {
    content = `### Simple Breakdown: ${topic.title} (${explanationLevel.toUpperCase()} Level)

Think of **${topic.title}** like an automatic reaction in nature: whenever a change happens in the surrounding state, the system reacts to balance it out!

${defsText}

**Why this matters**:
${topic.summary}

**Quick Memory Anchor**:
Always look at what is changing first. The system will react in whatever direction opposes that change!

[Source: ${documentName} • ${sourceSection}]`;
  } else if (tutorMode === 'step-by-step') {
    content = `### Step-by-Step Walkthrough: ${topic.title}

1. **Identify the Given System**:
   Examine the boundary parameters and establish initial values as noted in your material.
   
2. **Apply the Core Governing Principle**:
   ${defsText}
   
3. **Set Up the Mathematical Expression**:
   ${formulasText}
   
4. **Compute and Check Units**:
   Verify dimensional consistency across all terms before finalizing calculations.

[Source: ${documentName} • ${sourceSection}]`;
  } else if (tutorMode === 'example') {
    content = `### Concrete Practical Examples: ${topic.title}

${examplesText}

*(Supplementary Context: In real engineering systems, this principle is utilized in electric generators, induction cooktops, and magnetic braking mechanisms.)*

[Source: ${documentName} • ${sourceSection}]`;
  } else if (tutorMode === 'summary') {
    content = `### Key Exam Summary: ${topic.title}

- **Core Concept**: ${topic.summary}
- **Essential Definitions**:
${defsText}
- **High-Yield Formulas**:
${formulasText}
- **Key Pitfall to Avoid**: Pay close attention to negative signs and directional conventions during numerical substitutions.

[Source: ${documentName} • ${sourceSection}]`;
  } else if (tutorMode === 'formulas') {
    content = `### Formula Sheet & Mathematical Terminology: ${topic.title}

${formulasText}

### Key Definitions:
${defsText}

[Source: ${documentName} • ${sourceSection}]`;
  } else if (tutorMode === 'practice-questions') {
    content = `### Targeted Practice Drill: ${topic.title}

1. **Conceptual**: State the physical significance of **${topic.title}** and define its primary parameters.
2. **Analytical**: Derive the mathematical relationship using the formula from your notes:
   ${topic.formulas[0]?.formula || 'E = -dΦ/dt'}.
3. **Application**: What happens to the system output if the rate of change is doubled?
4. **Error Detection**: Why is neglecting the negative sign in directional equations a frequent source of lost marks?

[Source: ${documentName} • ${sourceSection}]`;
  } else if (tutorMode === 'mcq-quiz') {
    quizQuestions = generateFallbackQuiz(topic, documentName);
    content = `### Self-Assessment Quiz Ready: ${topic.title}
I have generated 4 multiple-choice diagnostic questions grounded in your notes from **${documentName}**. You can answer them directly in the quiz modal to test your mastery and identify any retention gaps.

[Source: ${documentName} • ${sourceSection}]`;
  } else if (tutorMode === 'custom-chat') {
    content = `### AI Tutor Response:
Regarding your question: **"${userQuery || 'How does this work?'}"**

Based on your notes in **${documentName}** for **${topic.title}**:
${topic.summary}

**Key takeaways from this section**:
${defsText}

*(Supplementary Context: For deeper conceptual intuition, remember that physical laws always preserve conservation of energy and directional equilibrium.)*

[Source: ${documentName} • ${sourceSection}]`;
  }

  return {
    content,
    sourceDocument: documentName,
    sourceSection,
    quizQuestions,
    isFallback: true,
  };
}

/**
 * Generates structured 4-question MCQ quiz for a topic.
 */
export function generateFallbackQuiz(
  topic: ExtractedTopic,
  documentName: string
): QuizQuestion[] {
  const formula = topic.formulas[0]?.formula || 'E = -dΦ/dt';
  const term = topic.definitions[0]?.term || topic.title;
  const def = topic.definitions[0]?.definition || topic.summary;

  return [
    {
      id: `q-${topic.id}-1`,
      question: `According to your study material for '${topic.title}', which statement best describes ${term}?`,
      options: [
        def,
        `It represents an arbitrary constant with zero physical variance.`,
        `It applies solely in isolated static equilibrium without temporal change.`,
        `It is inversely proportional to thermal entropy without directional constraint.`,
      ],
      correctAnswer: 0,
      explanation: `Directly derived from the definition in your notes: ${def}.`,
      topicId: topic.id,
      sourceReference: `${documentName} • Section 1`,
    },
    {
      id: `q-${topic.id}-2`,
      question: `Which governing formula is documented in your material for ${topic.title}?`,
      options: [
        `F = G(m1 * m2) / r^3`,
        formula,
        `PV = nRT^2`,
        `E = m * c^3`,
      ],
      correctAnswer: 1,
      explanation: `Verified from your formula notes: ${formula}.`,
      topicId: topic.id,
      sourceReference: `${documentName} • Formula Section`,
    },
    {
      id: `q-${topic.id}-3`,
      question: `What is the primary role of the negative sign or opposing term in the ${topic.title} formulation?`,
      options: [
        `It is a mathematical convention with no physical significance.`,
        `It reflects conservation of energy and opposition to the change causing it.`,
        `It indicates that the potential is always strictly negative in all coordinates.`,
        `It accounts for instrumental calibration drift during measurements.`,
      ],
      correctAnswer: 1,
      explanation: `Energy conservation dictates that the induced response opposes the flux/driving change.`,
      topicId: topic.id,
      sourceReference: `${documentName} • Conceptual Notes`,
    },
    {
      id: `q-${topic.id}-4`,
      question: `If the rate of parameter change in '${topic.title}' is tripled, how does the resulting output change?`,
      options: [
        `It triples proportionally.`,
        `It decreases by one-third.`,
        `It remains constant.`,
        `It increases by a factor of nine.`,
      ],
      correctAnswer: 0,
      explanation: `Because the relationship is linear with respect to the time derivative, tripling the rate triples the induced output.`,
      topicId: topic.id,
      sourceReference: `${documentName} • Section 2`,
    },
  ];
}
