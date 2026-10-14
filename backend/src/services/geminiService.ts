import { GoogleGenAI } from '@google/genai';
import {
  GenerationRequest,
  GenerationResponse,
  SkillGap,
  StudyPlan,
  SubjectRating,
  StudyMaterial,
} from '../types';
import { SAMPLE_SKILL_GAPS, SAMPLE_STUDY_PLAN } from '../data/fallbackData';
import { extractDocumentText } from './documentExtractor';
import { analyzeDocumentTopics, generateDeterministicTopicAnalysis } from './topicAnalyzer';
import { generateTutorResponse, generateDeterministicTutorResponse, generateFallbackQuiz } from './tutorService';

/**
 * Execute Generation through Gemini 3.8 Flash SDK or Deterministic Engine
 */
export async function executeGeneration(
  body: GenerationRequest,
  apiKey?: string
): Promise<GenerationResponse> {
  // If no API key is supplied, immediately use offline intelligence engine
  if (!apiKey) {
    return generateDeterministicFallback(body);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // 1. Health Check
    if (body.type === 'health-check') {
      const interaction = await ai.interactions.create({
        model: 'gemini-3.8-flash',
        input: 'Ping. Reply with "pong".',
      });
      return {
        status: 200,
        data: {
          success: true,
          data: { connected: true, response: interaction.output_text?.trim() },
          isFallback: false,
          model: 'gemini-3.8-flash',
        },
      };
    }

    // 2. Material Scanner Extraction & Topic Analysis
    if (body.type === 'material-extract') {
      try {
        const buffer = Buffer.from(body.fileBase64!, 'base64');
        const extraction = await extractDocumentText(buffer, body.fileName!, body.fileType);
        const analysis = await analyzeDocumentTopics(
          extraction.text,
          body.fileName!,
          body.subject || 'General Studies',
          apiKey
        );

        const material: StudyMaterial = {
          id: `mat-${Date.now()}`,
          fileName: body.fileName!,
          fileSize: buffer.length,
          fileType: (body.fileType || body.fileName!.split('.').pop() || 'txt').toLowerCase() as any,
          subject: body.subject || 'General Studies',
          uploadedAt: new Date().toISOString(),
          extractedText: extraction.text,
          wordCount: extraction.wordCount,
          pageCount: extraction.pageCount,
          title: analysis.title,
          summary: analysis.summary,
          topics: analysis.topics,
        };

        return {
          status: 200,
          data: {
            success: true,
            data: material,
            isFallback: analysis.isFallback,
            model: 'gemini-3.8-flash',
          },
        };
      } catch (extractErr: any) {
        return {
          status: 400,
          data: {
            success: false,
            error: extractErr.message || 'Failed to extract text from uploaded document.',
            isFallback: true,
            model: 'none',
          },
        };
      }
    }

    // 3. AI Tutor Explanations & Modes
    if (body.type === 'tutor-explain') {
      const topic = body.topic!;
      const materialText = body.materialText || topic.summary;
      const docName = body.documentName || 'Course Notes';
      const mode = body.tutorMode || 'simple';
      const level = body.explanationLevel || 'intermediate';

      const tutorResult = await generateTutorResponse(
        topic,
        materialText,
        docName,
        mode,
        level,
        body.userQuery,
        apiKey
      );

      return {
        status: 200,
        data: {
          success: true,
          data: tutorResult,
          isFallback: tutorResult.isFallback,
          model: 'gemini-3.8-flash',
        },
      };
    }

    // 4. Topic Quiz Generation
    if (body.type === 'generate-quiz') {
      const topic = body.topic!;
      const materialText = body.materialText || topic.summary;
      const docName = body.documentName || 'Course Notes';

      const quizResult = await generateTutorResponse(
        topic,
        materialText,
        docName,
        'mcq-quiz',
        'intermediate',
        undefined,
        apiKey
      );

      return {
        status: 200,
        data: {
          success: true,
          data: quizResult.quizQuestions || generateFallbackQuiz(topic, docName),
          isFallback: quizResult.isFallback,
          model: 'gemini-3.8-flash',
        },
      };
    }

    // 5. Coach Chat
    if (body.type === 'coach-chat') {
      const studentContext = body.profile
        ? `Student Name: ${body.profile.name}. Goal: ${body.profile.goal}. Weak subjects: ${
            body.profile.subjects
              .filter((s: SubjectRating) => s.proficiency <= 2)
              .map((s: SubjectRating) => s.name)
              .join(', ') || 'None'
          }.`
        : 'Student preparing for exams.';

      const prompt = `You are EduBridge AI, an empathetic, encouraging, and clear academic coach and tutor.
Context: ${studentContext}
Student Question: ${body.message}

Provide a well-structured, student-friendly answer. Use bullet points or bold text where appropriate to make concepts intuitive. Include a brief memory tip or practical problem-solving advice at the end.`;

      const interaction = await ai.interactions.create({
        model: 'gemini-3.8-flash',
        input: prompt,
      });

      const reply = interaction.output_text || 'I could not generate an answer right now. Please try again.';
      return {
        status: 200,
        data: {
          success: true,
          data: { reply },
          isFallback: false,
          model: 'gemini-3.8-flash',
        },
      };
    }

    // 6. Skill Gap Analysis
    if (body.type === 'skill-gap') {
      const profile = body.profile;
      if (!profile || !profile.subjects || profile.subjects.length === 0) {
        return generateDeterministicFallback(body);
      }

      const prompt = `Analyze this student's self-assessed subject proficiencies (1 to 5 scale, where 1 is struggling/novice and 5 is advanced/expert) and return a strictly valid JSON array of skill gap analyses.

Student Goal: ${profile.goal}
Daily Available Study Time: ${profile.dailyMinutes} minutes
Subjects & Ratings:
${profile.subjects.map((s: SubjectRating) => `- ${s.name}: ${s.proficiency}/5`).join('\n')}

Output JSON format strictly matching this structure (an array of objects, no markdown backticks, raw JSON):
[
  {
    "id": "gap-1",
    "subject": "Subject Name",
    "proficiency": 2,
    "status": "critical" | "moderate" | "strong",
    "badge": "Critical Gap" | "Needs Reinforcement" | "Strong Foundation",
    "explanation": "Clear diagnostic on why this rating indicates a bottleneck",
    "urgencyReason": "Why addressing this subject now is crucial for their goal",
    "recommendedWeeklyHours": 4.5,
    "suggestedTopics": ["Topic 1", "Topic 2", "Topic 3"]
  }
]`;

      const interaction = await ai.interactions.create({
        model: 'gemini-3.8-flash',
        input: prompt,
      });

      const text = interaction.output_text?.trim() || '';
      const cleanJson = text
        .replace(/^```json/i, '')
        .replace(/^```/i, '')
        .replace(/```$/i, '')
        .trim();
      const parsedGaps: SkillGap[] = JSON.parse(cleanJson);

      return {
        status: 200,
        data: {
          success: true,
          data: parsedGaps,
          isFallback: false,
          model: 'gemini-3.8-flash',
        },
      };
    }

    // 7. Study Plan Generation
    if (body.type === 'study-plan') {
      const profile = body.profile;
      if (!profile) {
        return generateDeterministicFallback(body);
      }

      const prompt = `Create a realistic, high-impact 7-Day study plan for a student.
Goal: ${profile.goal}
Available daily study time: ${profile.dailyMinutes} minutes
Subjects and self-rated proficiency (1-5 scale):
${profile.subjects.map((s: SubjectRating) => `- ${s.name}: ${s.proficiency}/5`).join('\n')}

CRITICAL INSTRUCTIONS:
- Allocate roughly 60-70% of study time to weaker subjects (proficiency 1 or 2).
- Distribute tasks across Day 1 to Day 7.
- For each day, include 2 to 3 tasks that sum to approximately ${profile.dailyMinutes} minutes.
- Each task MUST have a concrete, actionable learning activity (e.g., "Solve 10 numerical problems on induced EMF and sketch graphs", "Complete 5 timed SQL practice queries").
- Return strictly raw JSON matching this structure:
{
  "summary": "Brief 1-2 sentence executive summary of this 7-day strategy",
  "tasks": [
    {
      "id": "task-d1-1",
      "dayNumber": 1,
      "dayLabel": "Day 1 (Mon)",
      "subject": "Subject Name",
      "topic": "Specific Topic",
      "durationMinutes": 45,
      "priority": "High" | "Medium" | "Low",
      "activity": "Concrete activity instruction"
    }
  ]
}`;

      const interaction = await ai.interactions.create({
        model: 'gemini-3.8-flash',
        input: prompt,
      });

      const text = interaction.output_text?.trim() || '';
      const cleanJson = text
        .replace(/^```json/i, '')
        .replace(/^```/i, '')
        .replace(/```$/i, '')
        .trim();
      const parsed = JSON.parse(cleanJson);

      const generatedPlan: StudyPlan = {
        id: `plan-${Date.now()}`,
        createdAt: new Date().toISOString(),
        goal: profile.goal,
        summary: parsed.summary || `Personalized 7-day adaptive plan targeting ${profile.goal}`,
        generatedBy: 'gemini-3.8-flash',
        tasks: parsed.tasks.map((t: any, idx: number) => ({
          ...t,
          id: t.id || `task-${Date.now()}-${idx}`,
          completed: false,
        })),
      };

      return {
        status: 200,
        data: {
          success: true,
          data: generatedPlan,
          isFallback: false,
          model: 'gemini-3.8-flash',
        },
      };
    }

    return generateDeterministicFallback(body);
  } catch (error: any) {
    console.warn('Gemini API call failed, falling back to offline diagnostic engine:', error.message);
    return generateDeterministicFallback(body, error.message);
  }
}

/**
 * Deterministic fallback generator.
 */
export async function generateDeterministicFallback(
  body: GenerationRequest,
  originalError?: string
): Promise<GenerationResponse> {
  if (body.type === 'health-check') {
    return {
      status: 200,
      data: {
        success: true,
        data: {
          connected: false,
          message: originalError
            ? `Gemini API error: ${originalError}. Running in deterministic mode.`
            : 'GEMINI_API_KEY not configured on server. Running in deterministic demo mode.',
        },
        isFallback: true,
        model: 'offline-engine',
      },
    };
  }

  // Material extraction in offline mode: parse document locally
  if (body.type === 'material-extract') {
    try {
      const buffer = Buffer.from(body.fileBase64!, 'base64');
      const extraction = await extractDocumentText(buffer, body.fileName!, body.fileType);
      const analysis = generateDeterministicTopicAnalysis(
        extraction.text,
        body.fileName!,
        body.subject || 'General Studies'
      );

      const material: StudyMaterial = {
        id: `mat-${Date.now()}`,
        fileName: body.fileName!,
        fileSize: buffer.length,
        fileType: (body.fileType || body.fileName!.split('.').pop() || 'txt').toLowerCase() as any,
        subject: body.subject || 'General Studies',
        uploadedAt: new Date().toISOString(),
        extractedText: extraction.text,
        wordCount: extraction.wordCount,
        pageCount: extraction.pageCount,
        title: analysis.title,
        summary: analysis.summary,
        topics: analysis.topics,
      };

      return {
        status: 200,
        data: {
          success: true,
          data: material,
          isFallback: true,
          model: 'offline-engine',
        },
      };
    } catch (err: any) {
      return {
        status: 400,
        data: {
          success: false,
          error: err.message || 'Failed to extract text from document in offline mode.',
          isFallback: true,
          model: 'offline-engine',
        },
      };
    }
  }

  // Tutor explanation in offline mode
  if (body.type === 'tutor-explain') {
    const topic = body.topic!;
    const docName = body.documentName || 'Course Notes';
    const mode = body.tutorMode || 'simple';
    const level = body.explanationLevel || 'intermediate';

    const tutorResult = generateDeterministicTutorResponse(
      topic,
      docName,
      mode,
      level,
      body.userQuery
    );

    return {
      status: 200,
      data: {
        success: true,
        data: tutorResult,
        isFallback: true,
        model: 'offline-engine',
      },
    };
  }

  // Quiz generation in offline mode
  if (body.type === 'generate-quiz') {
    const topic = body.topic!;
    const docName = body.documentName || 'Course Notes';
    const questions = generateFallbackQuiz(topic, docName);

    return {
      status: 200,
      data: {
        success: true,
        data: questions,
        isFallback: true,
        model: 'offline-engine',
      },
    };
  }

  if (body.type === 'coach-chat') {
    const q = (body.message || '').toLowerCase();
    let reply = `Here is a structured explanation to help with your study goal:

1. **Understand the Core Principle**: Focus on the fundamental definition before jumping into complex problem sets.
2. **Active Recall & Practice**: Don't just re-read notes. Try solving 3 variations of typical exam questions without peeking at the solutions.
3. **Time-Boxing**: Spend 25 minutes of unbroken focus followed by a 5-minute break (Pomodoro method).

*Note: EduBridge AI is currently operating in Offline Intelligence Mode (${
      originalError ? 'API offline' : 'Demo Mode'
    }). Live Gemini 3.8 Flash inference activates automatically once GEMINI_API_KEY is configured.*`;

    if (q.includes('physics') || q.includes('faraday') || q.includes('lens') || q.includes('circuit')) {
      reply = `### Physics Concept Coaching:
- **Key Formula**: Induced EMF $\\mathcal{E} = -\\frac{d\\Phi_B}{dt}$.
- **Lenz's Law Principle**: Nature opposes any change in magnetic flux. Think of it like inertia for magnetic fields.
- **Problem Strategy**:
  1. Determine the initial magnetic field direction.
  2. Ask: is flux increasing or decreasing?
  3. The induced current creates a field to oppose that change!

*Generated by EduBridge Offline Diagnostic Engine (Demo Mode).*`;
    } else if (q.includes('math') || q.includes('calculus') || q.includes('integral')) {
      reply = `### Calculus & Integration Tip:
- Remember the **ILATE rule** for Integration by Parts:
  - **I**: Inverse Trigonometric
  - **L**: Logarithmic
  - **A**: Algebraic
  - **T**: Trigonometric
  - **E**: Exponential
- Choose the function that comes first in ILATE as your **$u$**, and the other as **$dv$**!

*Generated by EduBridge Offline Diagnostic Engine (Demo Mode).*`;
    }

    return {
      status: 200,
      data: {
        success: true,
        data: { reply },
        isFallback: true,
        model: 'offline-engine',
      },
    };
  }

  if (body.type === 'skill-gap') {
    const profile = body.profile;
    const gaps: SkillGap[] = (profile?.subjects || []).map((sub: SubjectRating, idx: number) => {
      let status: 'critical' | 'moderate' | 'strong' = 'moderate';
      let badge = 'Needs Reinforcement';
      let explanation = `Self-rated ${sub.proficiency}/5. Requires consistent practice to stabilize high-score potential.`;
      let urgency = `Moderate priority: maintain 2-3 hours per week to stay ahead of the curve.`;
      let hours = 3.0;
      let topics = [`${sub.name} Core Principles`, `${sub.name} Problem Sets`, `${sub.name} Exam Revision`];

      if (sub.proficiency <= 2) {
        status = 'critical';
        badge = 'Critical Gap';
        explanation = `Self-rated ${sub.proficiency}/5 indicates conceptual vulnerabilities and slow problem-solving velocity.`;
        urgency = `Immediate priority: early intervention prevents lost marks in high-weightage sections.`;
        const mins = profile?.dailyMinutes || 120;
        hours = Math.round(((mins * 7 * 0.35) / 60) * 10) / 10;
        topics = [`${sub.name} Foundational Theorems`, `${sub.name} High-Yield Numericals`, `${sub.name} Error Analysis`];
      } else if (sub.proficiency >= 4) {
        status = 'strong';
        badge = 'Strong Foundation';
        explanation = `Self-rated ${sub.proficiency}/5 reflects solid mastery and high confidence.`;
        urgency = `Low risk: periodic speed drills will retain mastery without displacing weaker subjects.`;
        hours = 1.5;
        topics = [`${sub.name} Advanced Variations`, `${sub.name} Timed Mock Drills`];
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
        suggestedTopics: topics,
      };
    });

    return {
      status: 200,
      data: {
        success: true,
        data: gaps.length > 0 ? gaps : SAMPLE_SKILL_GAPS,
        isFallback: true,
        model: 'offline-engine',
      },
    };
  }

  // Fallback 7-Day Study Plan
  const profile = body.profile;
  const mins = profile?.dailyMinutes || 120;

  if (!profile || !profile.subjects || profile.subjects.length === 0) {
    return {
      status: 200,
      data: {
        success: true,
        data: SAMPLE_STUDY_PLAN,
        isFallback: true,
        model: 'offline-engine',
      },
    };
  }

  const dayNames = [
    { num: 1, label: 'Day 1 (Mon)' },
    { num: 2, label: 'Day 2 (Tue)' },
    { num: 3, label: 'Day 3 (Wed)' },
    { num: 4, label: 'Day 4 (Thu)' },
    { num: 5, label: 'Day 5 (Fri)' },
    { num: 6, label: 'Day 6 (Sat)' },
    { num: 7, label: 'Day 7 (Sun)' },
  ];

  const tasks: any[] = [];
  const subjects = profile.subjects;

  dayNames.forEach(day => {
    const sub1 = subjects[(day.num - 1) % subjects.length];
    const sub2 = subjects[day.num % subjects.length];

    tasks.push({
      id: `task-d${day.num}-1`,
      dayNumber: day.num,
      dayLabel: day.label,
      subject: sub1.name,
      topic: `${sub1.name} Targeted Focus & Problem Set`,
      durationMinutes: Math.round(mins * 0.5),
      priority: sub1.proficiency <= 2 ? 'High' : 'Medium',
      activity: `Solve 8 past-exam practice questions covering ${sub1.name} core theorems.`,
      completed: false,
    });

    tasks.push({
      id: `task-d${day.num}-2`,
      dayNumber: day.num,
      dayLabel: day.label,
      subject: sub2.name,
      topic: `${sub2.name} Conceptual Review & Speed Drill`,
      durationMinutes: Math.round(mins * 0.5),
      priority: sub2.proficiency <= 2 ? 'High' : 'Medium',
      activity: `Timed review of high-yield formulas and practice 5 conversion problems.`,
      completed: false,
    });
  });

  return {
    status: 200,
    data: {
      success: true,
      data: {
        id: `plan-${Date.now()}`,
        createdAt: new Date().toISOString(),
        goal: profile?.goal || 'Academic Milestones',
        summary: `Adaptive 7-day schedule allocating ${mins} mins/day targeting high-weightage topics and closing foundational bottlenecks.`,
        generatedBy: 'offline-engine',
        tasks,
      },
      isFallback: true,
      model: 'offline-engine',
    },
  };
}
