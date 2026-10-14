import { StudentProfile, StudyPlan, SkillGap, ApiStatus } from '../types';
import { SAMPLE_STUDY_PLAN, SAMPLE_SKILL_GAPS } from '../data/sampleData';

export interface GenerationResult<T> {
  success: boolean;
  data: T;
  isFallback: boolean;
  model: string;
  error?: string;
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
  } catch (e) {
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
    data: {
      ...SAMPLE_STUDY_PLAN,
      id: `plan-local-${Date.now()}`,
      goal: profile.goal,
      summary: `Adaptive 7-day schedule calibrated for ${profile.dailyMinutes} mins/day prioritizing weaker subjects.`,
      generatedBy: 'offline-engine',
    },
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
      if (json.success && Array.isArray(json.data)) {
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

  // Local fallback calculation based on student self-ratings
  const gaps: SkillGap[] = profile.subjects.map(sub => {
    let status: 'critical' | 'moderate' | 'strong' = 'moderate';
    let badge = 'Needs Reinforcement';
    let urgency = 'Moderate priority: steady weekly practice will strengthen performance.';
    let hours = 3.0;

    if (sub.proficiency <= 2) {
      status = 'critical';
      badge = 'Critical Gap';
      urgency = 'Immediate attention required: highest potential for score drops without prompt intervention.';
      hours = 4.5;
    } else if (sub.proficiency >= 4) {
      status = 'strong';
      badge = 'Strong Foundation';
      urgency = 'Low priority: preserve high retention with periodic mock questions.';
      hours = 1.5;
    }

    return {
      id: `gap-${sub.id}`,
      subject: sub.name,
      proficiency: sub.proficiency,
      status,
      badge,
      explanation: `Self-rated ${sub.proficiency}/5. ${
        status === 'critical'
          ? 'High error frequency in fundamentals and numerical calculations.'
          : status === 'moderate'
          ? 'Core concepts clear, but application speed and consistency need improvement.'
          : 'Demonstrates solid mastery of core syllabus concepts.'
      }`,
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
