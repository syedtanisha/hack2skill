import { StudentProfile, StudyPlan, SkillGap, ChatMessage, ResourceItem } from '../types';
import { SAMPLE_STUDENT, SAMPLE_STUDY_PLAN, SAMPLE_SKILL_GAPS, SAMPLE_RESOURCES } from '../data/sampleData';

const STORAGE_KEYS = {
  PROFILE: 'edubridge_student_profile',
  STUDY_PLAN: 'edubridge_study_plan',
  SKILL_GAPS: 'edubridge_skill_gaps',
  CHAT_MESSAGES: 'edubridge_chat_history',
  RESOURCES: 'edubridge_resources',
  IS_DEMO_MODE: 'edubridge_is_demo_mode',
};

export const storage = {
  getProfile(): StudentProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return stored ? JSON.parse(stored) : SAMPLE_STUDENT;
    } catch {
      return SAMPLE_STUDENT;
    }
  },

  saveProfile(profile: StudentProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  getStudyPlan(): StudyPlan {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDY_PLAN);
      return stored ? JSON.parse(stored) : SAMPLE_STUDY_PLAN;
    } catch {
      return SAMPLE_STUDY_PLAN;
    }
  },

  saveStudyPlan(plan: StudyPlan): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDY_PLAN, JSON.stringify(plan));
    } catch (e) {
      console.error('Failed to save study plan', e);
    }
  },

  getSkillGaps(): SkillGap[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SKILL_GAPS);
      return stored ? JSON.parse(stored) : SAMPLE_SKILL_GAPS;
    } catch {
      return SAMPLE_SKILL_GAPS;
    }
  },

  saveSkillGaps(gaps: SkillGap[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SKILL_GAPS, JSON.stringify(gaps));
    } catch (e) {
      console.error('Failed to save skill gaps', e);
    }
  },

  getResources(): ResourceItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RESOURCES);
      return stored ? JSON.parse(stored) : SAMPLE_RESOURCES;
    } catch {
      return SAMPLE_RESOURCES;
    }
  },

  saveResources(resources: ResourceItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
    } catch (e) {
      console.error('Failed to save resources', e);
    }
  },

  getChatMessages(): ChatMessage[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      if (stored) return JSON.parse(stored);
    } catch {}

    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `Hi ${SAMPLE_STUDENT.name}! 👋 I'm your **EduBridge AI Learning Coach**.

I'm aware of your goal: **${SAMPLE_STUDENT.goal}**, and that you're focusing on strengthening your weaker subjects.

Feel free to ask me to:
- Explain difficult concepts in simple analogies
- Break down a multi-step numerical formula
- Recommend effective study strategies (e.g. Pomodoro, active recall)
- Help you plan your daily study blocks!

What would you like to work on right now?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  },

  saveChatMessages(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat messages', e);
    }
  },

  resetToDemo(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(SAMPLE_STUDENT));
      localStorage.setItem(STORAGE_KEYS.STUDY_PLAN, JSON.stringify(SAMPLE_STUDY_PLAN));
      localStorage.setItem(STORAGE_KEYS.SKILL_GAPS, JSON.stringify(SAMPLE_SKILL_GAPS));
      localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(SAMPLE_RESOURCES));
      localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
    } catch (e) {
      console.error('Failed to reset demo data', e);
    }
  },
};
