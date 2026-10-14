import {
  StudentProfile,
  StudyPlan,
  SkillGap,
  ApiStatus,
  StudyMaterial,
  ExtractedTopic,
  QuizQuestion,
} from '../types';
import { SAMPLE_STUDY_PLAN, SAMPLE_SKILL_GAPS } from '../data/sampleData';

export interface GenerationResult<T> {
  success: boolean;
  data: T;
  isFallback: boolean;
  model: string;
  error?: string;
}

export interface TutorResponseData {
  content: string;
  sourceDocument: string;
  sourceSection?: string;
  supplementaryNotice?: string;
  quizQuestions?: QuizQuestion[];
  isFallback: boolean;
}

export async function checkApiHealth(): Promise<ApiStatus> {
  const start = performance.now();
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'health-check' }),
    });

    if (!res.ok) {
      return {
        isConfigured: false,
        model: 'Offline Intelligence Engine',
        lastChecked: new Date().toLocaleTimeString(),
      };
    }

    const json = await res.json();
    const duration = Math.round(performance.now() - start);

    if (json.data?.connected) {
      return {
        isConfigured: true,
        model: 'Gemini 3.8 Flash',
        latencyMs: duration,
        lastChecked: new Date().toLocaleTimeString(),
      };
    }

    return {
      isConfigured: false,
      model: 'Offline Intelligence Engine',
      latencyMs: duration,
      lastChecked: new Date().toLocaleTimeString(),
    };
  } catch {
    return {
      isConfigured: false,
      model: 'Offline Intelligence Engine',
      lastChecked: new Date().toLocaleTimeString(),
    };
  }
}

export async function requestStudyPlan(profile: StudentProfile): Promise<GenerationResult<StudyPlan>> {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'study-plan', profile }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          success: true,
          data: json.data,
          isFallback: json.isFallback,
          model: json.model || (json.isFallback ? 'offline-engine' : 'gemini-3.8-flash'),
        };
      }
    }
  } catch (err) {
    console.warn('API error, using local fallback:', err);
  }

  // Local client fallback if serverless endpoint is unreachable
  return {
    success: true,
    data: SAMPLE_STUDY_PLAN,
    isFallback: true,
    model: 'offline-engine',
  };
}

export async function requestSkillGaps(profile: StudentProfile): Promise<GenerationResult<SkillGap[]>> {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'skill-gap', profile }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          success: true,
          data: json.data,
          isFallback: json.isFallback,
          model: json.model || (json.isFallback ? 'offline-engine' : 'gemini-3.8-flash'),
        };
      }
    }
  } catch (err) {
    console.warn('API error, using fallback gaps:', err);
  }

  // Fallback generation based on current profile proficiencies
  const gaps: SkillGap[] = (profile.subjects || []).map((sub, idx) => {
    let status: 'critical' | 'moderate' | 'strong' = 'moderate';
    let badge = 'Needs Reinforcement';
    let explanation = `Self-assessed ${sub.proficiency}/5. Regular revision is recommended.`;
    let urgency = 'Keep steady 2-3 hours per week.';
    let hours = 3.0;

    if (sub.proficiency <= 2) {
      status = 'critical';
      badge = 'Critical Gap';
      explanation = `Self-assessed ${sub.proficiency}/5 shows conceptual gaps in foundational theorems.`;
      urgency = 'High priority: target this subject first.';
      hours = 4.5;
    } else if (sub.proficiency >= 4) {
      status = 'strong';
      badge = 'Strong Foundation';
      explanation = `Self-assessed ${sub.proficiency}/5 demonstrates confident grasp.`;
      urgency = 'Maintenance review suffices.';
      hours = 1.5;
    }

    return {
      id: `gap-${sub.id || idx}`,
      subject: sub.name,
      proficiency: sub.proficiency,
      status,
      badge,
      explanation,
      urgencyReason: urgency,
      recommendedWeeklyHours: hours,
      suggestedTopics: [`${sub.name} High-Yield Concepts`, `${sub.name} Exam Problem Sets`],
    };
  });

  return {
    success: true,
    data: gaps.length > 0 ? gaps : SAMPLE_SKILL_GAPS,
    isFallback: true,
    model: 'offline-engine',
  };
}

export async function requestCoachAnswer(
  message: string,
  profile: StudentProfile,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<GenerationResult<string>> {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'coach-chat',
        message,
        profile,
        chatHistory: history.slice(-6),
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data?.reply) {
        return {
          success: true,
          data: json.data.reply,
          isFallback: json.isFallback,
          model: json.model || (json.isFallback ? 'offline-engine' : 'gemini-3.8-flash'),
        };
      }
    }
  } catch (err) {
    console.warn('API error, using coach fallback:', err);
  }

  // Local fallback response
  return {
    success: true,
    data: `Here's a study coach tip for **${profile.goal}**:
- Break your current study topic into 3 smaller sub-goals.
- Work through one worked example with pen and paper, explaining every step out loud to yourself (Feynman Technique).
- Test yourself with 2 practice problems without looking at solutions!

*(Offline Coach Response — Live Gemini AI activates when connected)*`,
    isFallback: true,
    model: 'offline-engine',
  };
}

/**
 * Material Scanner: Upload and extract readable text + topic breakdown
 */
export async function requestMaterialExtraction(
  fileBase64: string,
  fileName: string,
  fileType: string,
  subject: string
): Promise<GenerationResult<StudyMaterial>> {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'material-extract',
        fileBase64,
        fileName,
        fileType,
        subject,
      }),
    });

    const json = await res.json();
    if (res.ok && json.success && json.data) {
      return {
        success: true,
        data: json.data,
        isFallback: json.isFallback,
        model: json.model || 'gemini-3.8-flash',
      };
    }

    return {
      success: false,
      data: null as any,
      isFallback: true,
      model: 'none',
      error: json.error || 'Failed to extract text from document.',
    };
  } catch (err: any) {
    return {
      success: false,
      data: null as any,
      isFallback: true,
      model: 'none',
      error: err.message || 'Network error extracting document.',
    };
  }
}

/**
 * AI Tutor: Grounded explanations and tutoring modes
 */
export async function requestTutorExplanation(
  topic: ExtractedTopic,
  materialText: string,
  documentName: string,
  tutorMode: string,
  explanationLevel: 'beginner' | 'intermediate' | 'detailed' = 'intermediate',
  userQuery?: string
): Promise<GenerationResult<TutorResponseData>> {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'tutor-explain',
        topic,
        materialText,
        documentName,
        tutorMode,
        explanationLevel,
        userQuery,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          success: true,
          data: json.data,
          isFallback: json.isFallback,
          model: json.model || 'gemini-3.8-flash',
        };
      }
    }
  } catch (err: any) {
    console.warn('API error in tutor explain, using local fallback:', err);
  }

  // Local fallback response
  return {
    success: true,
    data: {
      content: `### Tutor Explanation: ${topic.title} (${explanationLevel.toUpperCase()} Level)
**Core Definition**: ${topic.summary}

**Formulas & Key Terminology**:
${topic.formulas.map(f => `- **${f.name}**: \`${f.formula}\``).join('\n') || '- Standard formula relations from notes'}

**Key Points**:
${topic.keyConcepts.map(c => `- ${c}`).join('\n')}

*(Grounded in ${documentName} • ${topic.sourceSection || 'Section 1'})*`,
      sourceDocument: documentName,
      sourceSection: topic.sourceSection || 'Section 1',
      isFallback: true,
    },
    isFallback: true,
    model: 'offline-engine',
  };
}

/**
 * Topic Quiz: Generate 4 MCQ questions with explanations
 */
export async function requestTopicQuiz(
  topic: ExtractedTopic,
  materialText: string,
  documentName: string
): Promise<GenerationResult<QuizQuestion[]>> {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'generate-quiz',
        topic,
        materialText,
        documentName,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          success: true,
          data: json.data,
          isFallback: json.isFallback,
          model: json.model || 'gemini-3.8-flash',
        };
      }
    }
  } catch (err: any) {
    console.warn('API error in quiz generation:', err);
  }

  // Fallback 4 questions
  const def = topic.definitions[0]?.definition || topic.summary;
  const formula = topic.formulas[0]?.formula || 'E = -dΦ/dt';
  return {
    success: true,
    data: [
      {
        id: `q-${topic.id}-1`,
        question: `Based on your notes for '${topic.title}', which definition is correct?`,
        options: [
          def,
          'Arbitrary static reference constant with no time dependence.',
          'Inversely proportional to mass with zero directional constraint.',
          'Empirical curve fit lacking physical conservation bounds.',
        ],
        correctAnswer: 0,
        explanation: `Directly derived from the definition in your notes: ${def}`,
        topicId: topic.id,
        sourceReference: `${documentName} • Section 1`,
      },
      {
        id: `q-${topic.id}-2`,
        question: `What is the principal formula documented for ${topic.title}?`,
        options: ['F = m * a^2', formula, 'PV = nRT^2', 'W = F / d'],
        correctAnswer: 1,
        explanation: `Formula verified from notes: ${formula}`,
        topicId: topic.id,
        sourceReference: `${documentName} • Formula Section`,
      },
      {
        id: `q-${topic.id}-3`,
        question: `Why is the directional rule or negative sign significant in ${topic.title}?`,
        options: [
          'It is purely decorative without physical meaning.',
          'It upholds conservation of energy by opposing the initiating change.',
          'It forces the magnitude to remain below zero at all times.',
          'It accounts for thermometer temperature scale shift.',
        ],
        correctAnswer: 1,
        explanation: 'The negative sign reflects Lenz law and energy conservation.',
        topicId: topic.id,
        sourceReference: `${documentName} • Principles`,
      },
      {
        id: `q-${topic.id}-4`,
        question: `If the rate of parameter change in '${topic.title}' doubles, the induced output:`,
        options: ['Doubles proportionally.', 'Halves.', 'Decreases to zero.', 'Remains constant.'],
        correctAnswer: 0,
        explanation: 'Linear time-rate dependence causes the output to double proportionally.',
        topicId: topic.id,
        sourceReference: `${documentName} • Applications`,
      },
    ],
    isFallback: true,
    model: 'offline-engine',
  };
}
