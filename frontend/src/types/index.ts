export interface SubjectRating {
  id: string;
  name: string;
  proficiency: number; // 1 (Novice) to 5 (Expert)
}

export interface StudentProfile {
  name: string;
  course: string; // e.g. "B.Tech Computer Science" or "Class 12 CBSE"
  branch: string; // e.g. "Artificial Intelligence & Data Science" or "PCM"
  year: string; // e.g. "3rd Year" or "Class 12"
  semester: string; // e.g. "5th Semester" or "Term 2"
  goal: string;
  targetDate: string;
  dailyMinutes: number;
  subjects: SubjectRating[];
  isCompleted?: boolean;
  lastUpdated?: string;
}

export interface TodoTask {
  id: string;
  title: string;
  description?: string;
  subject: string;
  deadline: string; // YYYY-MM-DD
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string;
  topicId?: string; // Optional link to an extracted topic
}

export interface WeakAreaItem {
  id: string;
  subject: string;
  topic: string;
  source: 'assessment' | 'self-reported' | 'quiz-gap';
  severity: 'critical' | 'moderate';
  notes?: string;
  dateAdded: string;
  quizScore?: number;
}

export interface TodayPlannedSession {
  id: string;
  taskId: string;
  taskTitle: string;
  subject: string;
  durationMinutes: number;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  reason: string;
  isBreakdown?: boolean;
  sessionNumber?: number;
  totalSessions?: number;
  completed: boolean;
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

// Material Scanner & AI Tutor Types
export interface TopicDefinition {
  term: string;
  definition: string;
}

export interface TopicFormula {
  name: string;
  formula: string;
  explanation?: string;
  notes?: string;
}

export interface ExtractedTopic {
  id: string;
  title: string;
  chapterTitle?: string;
  summary: string;
  subtopics: string[];
  keyConcepts: string[];
  definitions: TopicDefinition[];
  formulas: TopicFormula[];
  examples: string[];
  status: 'not-started' | 'learning' | 'needs-revision' | 'understood';
  sourceSection?: string;
  quizScore?: number;
  lastQuizScore?: number;
  lastQuizDate?: string;
}

export interface StudyMaterial {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: 'pdf' | 'docx' | 'pptx' | 'txt';
  subject: string;
  uploadedAt: string;
  extractedText: string;
  rawText?: string;
  wordCount: number;
  pageCount?: number;
  title: string;
  summary: string;
  topics: ExtractedTopic[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topicId: string;
  sourceReference?: string;
}

export interface TopicQuiz {
  id: string;
  topicId: string;
  topicTitle: string;
  subject: string;
  questions: QuizQuestion[];
  score?: number;
  totalQuestions: number;
  completedAt?: string;
  passed?: boolean;
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  explanationLevel?: 'beginner' | 'intermediate' | 'detailed';
  sourceDocument?: string;
  sourceSection?: string;
  supplementaryNotice?: string;
  isFallback?: boolean;
}
