export interface SubjectRating {
  id: string;
  name: string;
  proficiency: number; // 1 to 5
}

export interface StudentProfile {
  name: string;
  course?: string;
  branch?: string;
  year?: string;
  semester?: string;
  goal: string;
  targetDate: string;
  dailyMinutes: number;
  subjects: SubjectRating[];
  isCompleted?: boolean;
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
  dayLabel: string;
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

// Material Scanner & Topic Understanding Types
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

export interface GenerationRequest {
  type:
    | 'study-plan'
    | 'skill-gap'
    | 'coach-chat'
    | 'health-check'
    | 'material-extract'
    | 'material-analyze'
    | 'tutor-explain'
    | 'generate-quiz';
  profile?: StudentProfile;
  message?: string;
  chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  // Material Extraction
  fileBase64?: string;
  fileName?: string;
  fileType?: string;
  subject?: string;
  materialText?: string;
  // Tutor & Topic Context
  topic?: ExtractedTopic;
  documentName?: string;
  explanationLevel?: 'beginner' | 'intermediate' | 'detailed';
  tutorMode?:
    | 'simple'
    | 'step-by-step'
    | 'example'
    | 'summary'
    | 'formulas'
    | 'practice-questions'
    | 'mcq-quiz'
    | 'custom-chat';
  userQuery?: string;
}

export interface GenerationResponse {
  status: number;
  data: {
    success: boolean;
    data?: any;
    error?: string;
    isFallback: boolean;
    model: string;
  };
}
