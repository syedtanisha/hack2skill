export interface SubjectRating {
  id: string;
  name: string;
  proficiency: number; // 1 (Novice) to 5 (Expert)
}

export interface StudentProfile {
  name: string;
  goal: string;
  targetDate: string;
  dailyMinutes: number;
  subjects: SubjectRating[];
  lastUpdated?: string;
}

export interface SkillGap {
  id: string;
  subject: string;
  proficiency: number;
  status: 'critical' | 'moderate' | 'strong';
  badge: string;
  explanation: string;
  urgencyReason: string;
  recommendedWeeklyHours: number;
  suggestedTopics: string[];
}

export interface StudyTask {
  id: string;
  dayNumber: number; // 1 to 7
  dayLabel: string; // e.g. "Day 1 (Mon)"
  subject: string;
  topic: string;
  durationMinutes: number;
  priority: 'High' | 'Medium' | 'Low';
  activity: string;
  completed: boolean;
  completedAt?: string;
}

export interface StudyPlan {
  id: string;
  createdAt: string;
  goal: string;
  summary: string;
  generatedBy: 'gemini-3.8-flash' | 'offline-engine';
  tasks: StudyTask[];
}

export interface ResourceItem {
  id: string;
  subject: string;
  topic: string;
  type: 'Video Lecture' | 'Practice Problems' | 'Revision Notes' | 'Interactive Simulator' | 'Formula Sheet';
  platform: 'Khan Academy' | 'YouTube' | 'Google Search' | 'Coursera' | 'MIT OCW';
  description: string;
  searchUrl: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isFallback?: boolean;
}

export interface ApiStatus {
  isConfigured: boolean;
  model: string;
  latencyMs?: number;
  lastChecked?: string;
}
