import {
  StudentProfile,
  StudyPlan,
  SkillGap,
  ChatMessage,
  ResourceItem,
  TodoTask,
  WeakAreaItem,
  StudyMaterial,
} from '../types';
import {
  SAMPLE_STUDENT,
  SAMPLE_STUDY_PLAN,
  SAMPLE_SKILL_GAPS,
  SAMPLE_RESOURCES,
  SAMPLE_TODO_TASKS,
  SAMPLE_WEAK_AREAS,
  SAMPLE_MATERIALS,
  BLANK_STUDENT,
} from '../data/sampleData';

const STORAGE_KEYS = {
  PROFILE: 'edubridge_student_profile',
  TASKS: 'edubridge_todo_tasks',
  WEAK_AREAS: 'edubridge_weak_areas',
  MATERIALS: 'edubridge_study_materials',
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

  getTasks(): TodoTask[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      return stored ? JSON.parse(stored) : SAMPLE_TODO_TASKS;
    } catch {
      return SAMPLE_TODO_TASKS;
    }
  },

  saveTasks(tasks: TodoTask[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  },

  getWeakAreas(): WeakAreaItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WEAK_AREAS);
      return stored ? JSON.parse(stored) : SAMPLE_WEAK_AREAS;
    } catch {
      return SAMPLE_WEAK_AREAS;
    }
  },

  saveWeakAreas(weakAreas: WeakAreaItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WEAK_AREAS, JSON.stringify(weakAreas));
    } catch (e) {
      console.error('Failed to save weak areas', e);
    }
  },

  getMaterials(): StudyMaterial[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      return stored ? JSON.parse(stored) : SAMPLE_MATERIALS;
    } catch {
      return SAMPLE_MATERIALS;
    }
  },

  saveMaterials(materials: StudyMaterial[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
    } catch (e) {
      console.error('Failed to save study materials', e);
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
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(SAMPLE_TODO_TASKS));
      localStorage.setItem(STORAGE_KEYS.WEAK_AREAS, JSON.stringify(SAMPLE_WEAK_AREAS));
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(SAMPLE_MATERIALS));
      localStorage.setItem(STORAGE_KEYS.STUDY_PLAN, JSON.stringify(SAMPLE_STUDY_PLAN));
      localStorage.setItem(STORAGE_KEYS.SKILL_GAPS, JSON.stringify(SAMPLE_SKILL_GAPS));
      localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(SAMPLE_RESOURCES));
      localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
    } catch (e) {
      console.error('Failed to reset demo data', e);
    }
  },

  resetToEmpty(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(BLANK_STUDENT));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.WEAK_AREAS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify([]));
      localStorage.setItem(
        STORAGE_KEYS.STUDY_PLAN,
        JSON.stringify({
          id: `plan-${Date.now()}`,
          createdAt: new Date().toISOString(),
          goal: '',
          summary: 'Your study plan will appear here once you set up your profile and tasks.',
          generatedBy: 'offline-engine',
          tasks: [],
        })
      );
      localStorage.setItem(STORAGE_KEYS.SKILL_GAPS, JSON.stringify([]));
      localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
    } catch (e) {
      console.error('Failed to reset empty student data', e);
    }
  },
};
