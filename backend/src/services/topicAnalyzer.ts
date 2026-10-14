import { GoogleGenAI } from '@google/genai';
import { ExtractedTopic } from '../types';

export interface TopicAnalysisResult {
  title: string;
  summary: string;
  topics: ExtractedTopic[];
  isFallback: boolean;
}

/**
 * Analyzes document text to extract structured topics, definitions, formulas, and examples.
 */
export async function analyzeDocumentTopics(
  text: string,
  fileName: string,
  subject: string,
  apiKey?: string
): Promise<TopicAnalysisResult> {
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are EduBridge AI, an expert academic curriculum analyzer.
Analyze the following student study material text extracted from '${fileName}' (Subject: ${subject}).
Extract the document title, an overall summary, and an organized topic outline with chapters, topics, subtopics, key concepts, definitions, formulas, and examples.

MATERIAL TEXT EXCERPT (first 8000 characters):
${text.slice(0, 8000)}

Output raw JSON strictly matching this schema (no markdown backticks, no markdown formatting outside JSON):
{
  "title": "Document Title",
  "summary": "1-2 sentence overall summary of this study material",
  "topics": [
    {
      "id": "topic-1",
      "title": "Topic Name",
      "chapterTitle": "Chapter or Unit Name",
      "summary": "Clear summary of this topic from the notes",
      "subtopics": ["Subtopic 1", "Subtopic 2"],
      "keyConcepts": ["Concept A", "Concept B"],
      "definitions": [
        { "term": "Term Name", "definition": "Direct definition from notes" }
      ],
      "formulas": [
        { "name": "Formula Name", "formula": "E = -dPhi/dt", "explanation": "Brief explanation" }
      ],
      "examples": ["Example 1 from notes"],
      "status": "not-started",
      "sourceSection": "Section 1"
    }
  ]
}`;

      const interaction = await ai.interactions.create({
        model: 'gemini-3.8-flash',
        input: prompt,
      });

      const responseText = interaction.output_text?.trim() || '';
      const cleanJson = responseText
        .replace(/^```json/i, '')
        .replace(/^```/i, '')
        .replace(/```$/i, '')
        .trim();
      const parsed = JSON.parse(cleanJson);

      return {
        title: parsed.title || fileName.replace(/\.[^/.]+$/, ''),
        summary: parsed.summary || `Extracted study topics for ${subject}`,
        topics: (parsed.topics || []).map((t: any, idx: number) => ({
          ...t,
          id: t.id || `topic-${Date.now()}-${idx + 1}`,
          status: 'not-started',
          definitions: t.definitions || [],
          formulas: t.formulas || [],
          examples: t.examples || [],
        })),
        isFallback: false,
      };
    } catch (err: any) {
      console.warn('Gemini topic analysis error, using deterministic analyzer:', err.message);
      return generateDeterministicTopicAnalysis(text, fileName, subject);
    }
  }

  return generateDeterministicTopicAnalysis(text, fileName, subject);
}

/**
 * Deterministic offline topic analyzer when Gemini API is offline or without API key.
 */
export function generateDeterministicTopicAnalysis(
  text: string,
  fileName: string,
  subject: string
): TopicAnalysisResult {
  const cleanTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Group text into rough sections based on headers, slides, or paragraphs
  const rawSections: Array<{ heading: string; lines: string[] }> = [];
  let currentHeading = 'Core Foundations';
  let currentLines: string[] = [];

  for (const line of lines) {
    if (
      line.startsWith('[Slide') ||
      line.startsWith('Chapter') ||
      line.startsWith('Unit') ||
      line.startsWith('Section') ||
      (line.length < 50 && line.endsWith(':'))
    ) {
      if (currentLines.length > 0) {
        rawSections.push({ heading: currentHeading, lines: currentLines });
        currentLines = [];
      }
      currentHeading = line.replace(/[:[\]]/g, '').trim();
    } else {
      currentLines.push(line);
    }
  }
  if (currentLines.length > 0) {
    rawSections.push({ heading: currentHeading, lines: currentLines });
  }

  // If fewer than 2 sections, split by paragraphs
  if (rawSections.length <= 1) {
    const defaultTopics = [
      {
        heading: `${cleanTitle}: Fundamental Principles`,
        lines: lines.slice(0, Math.floor(lines.length / 2)),
      },
      {
        heading: `${cleanTitle}: Mathematical Formulations & Applications`,
        lines: lines.slice(Math.floor(lines.length / 2)),
      },
    ];
    rawSections.length = 0;
    rawSections.push(...defaultTopics);
  }

  const topics: ExtractedTopic[] = rawSections.slice(0, 5).map((sec, idx) => {
    const secText = sec.lines.join(' ');

    // Extract formulas (look for =, ->, \mathcal, d/dt)
    const formulaCandidates = sec.lines.filter(l =>
      l.includes('=') || l.includes('∝') || l.includes('->') || l.includes('Δ')
    );
    const formulas = formulaCandidates.slice(0, 2).map((fc, fIdx) => ({
      name: `Formula ${fIdx + 1}`,
      formula: fc,
      explanation: 'Extracted mathematical relationship from study material',
    }));

    // Extract definitions (look for "is defined as", "means", "refers to", ":")
    const defCandidates = sec.lines.filter(l =>
      /is defined as|refers to|is the measure of|signifies|:/i.test(l)
    );
    const definitions = defCandidates.slice(0, 2).map(dc => {
      const parts = dc.split(/:| is defined as | refers to /i);
      return {
        term: parts[0]?.trim() || 'Key Term',
        definition: parts[1]?.trim() || dc,
      };
    });

    return {
      id: `topic-${idx + 1}`,
      title: sec.heading,
      chapterTitle: `${subject} • Module ${idx + 1}`,
      summary:
        secText.slice(0, 180) + (secText.length > 180 ? '...' : '') ||
        `Core principles and problem-solving concepts covered in this section of ${cleanTitle}.`,
      subtopics: [
        `${sec.heading} Conceptual Overview`,
        `${sec.heading} Analytical Derivation`,
        `${sec.heading} Problem Practice`,
      ],
      keyConcepts: [
        'Fundamental Law & Theoretical Boundary',
        'Physical Interpretation & Units',
        'Common Exam Pitfalls & Solution Technique',
      ],
      definitions:
        definitions.length > 0
          ? definitions
          : [
              {
                term: sec.heading.split(' ')[0] || 'Core Term',
                definition: 'Essential theoretical construct detailed in the provided notes.',
              },
            ],
      formulas:
        formulas.length > 0
          ? formulas
          : [
              {
                name: 'Governing Equation',
                formula: 'E = -dΦ/dt',
                explanation: 'Time rate of flux change relates to induced electromotive force.',
              },
            ],
      examples: [
        'Standard numerical application on past exam combination problems.',
        'Conceptual verification question using directional rules.',
      ],
      status: 'not-started',
      sourceSection: `Section ${idx + 1}`,
    };
  });

  return {
    title: cleanTitle,
    summary: `Structured academic breakdown for '${fileName}' under subject ${subject}. Extracted ${topics.length} key topic modules with definitions, formulas, and practice objectives.`,
    topics,
    isFallback: true,
  };
}
