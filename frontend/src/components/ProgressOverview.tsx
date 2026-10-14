import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  FileText,
  Target,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import {
  StudentProfile,
  TodoTask,
  StudyPlan,
  WeakAreaItem,
  StudyMaterial,
  ResourceItem,
  ExtractedTopic
} from '../types';
import { ResourceRecommendations } from './ResourceRecommendations';

interface ProgressOverviewProps {
  profile: StudentProfile;
  tasks: TodoTask[];
  plan: StudyPlan;
  weakAreas: WeakAreaItem[];
  materials: StudyMaterial[];
  resources: ResourceItem[];
  onNavigate: (tab: string) => void;
  onSelectTopicForTutor: (material: StudyMaterial, topic: ExtractedTopic) => void;
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  profile,
  tasks,
  plan,
  weakAreas,
  materials,
  resources,
  onNavigate,
  onSelectTopicForTutor,
}) => {
  // Aggregate topic mastery across all materials
  const allTopics: { material: StudyMaterial; topic: ExtractedTopic }[] = [];
  materials.forEach(m => {
    (m.topics || []).forEach(t => {
      allTopics.push({ material: m, topic: t });
    });
  });

  const totalTopics = allTopics.length;
  const understoodTopics = allTopics.filter(item => item.topic.status === 'understood');
  const needsRevisionTopics = allTopics.filter(item => item.topic.status === 'needs-revision');
  const learningTopics = allTopics.filter(
    item => item.topic.status === 'learning' || item.topic.status === 'not-started'
  );

  const topicMasteryRate =
    totalTopics > 0 ? Math.round((understoodTopics.length / totalTopics) * 100) : 0;

  // Task metrics
  const completedTodoCount = tasks.filter(t => t.completed).length;
  const totalTodoCount = tasks.length;
  const todoPercent =
    totalTodoCount > 0 ? Math.round((completedTodoCount / totalTodoCount) * 100) : 0;

  const completedPlanCount = (plan.tasks || []).filter(t => t.completed).length;
  const totalPlanCount = (plan.tasks || []).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sage-100 text-sage-800 border border-sage-200">
              Academic Progress Hub
            </span>
            <span className="text-xs text-charcoal-500 font-medium">
              {profile.course} • Sem {profile.semester}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            Learning Progress & Mastery Analysis
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1 max-w-2xl leading-relaxed">
            Consolidated overview of your document topic mastery, to-do task completion, self-reported weak areas, and targeted resources.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('materials')}
            className="px-4 py-2.5 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Scan More Materials</span>
          </button>
          <button
            onClick={() => onNavigate('tasks')}
            className="px-4 py-2.5 rounded-2xl bg-cream-100 hover:bg-cream-200 text-charcoal-800 font-semibold text-xs sm:text-sm border border-cream-200 flex items-center gap-1.5 transition-all"
          >
            <Clock className="w-4 h-4 text-charcoal-500" />
            <span>View 7-Day Plan</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Topic Mastery */}
        <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-subtle">
          <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
            <span>Topic Mastery</span>
            <div className="w-8 h-8 rounded-xl bg-sage-50 text-sage-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-charcoal-900">
              {topicMasteryRate}%
            </span>
            <span className="text-xs text-charcoal-500">
              ({understoodTopics.length}/{totalTopics} topics)
            </span>
          </div>
          <div className="mt-3 w-full bg-cream-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-sage-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${topicMasteryRate}%` }}
            />
          </div>
        </div>

        {/* Metric 2: To-Do Tasks Completed */}
        <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-subtle">
          <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
            <span>Tasks Completed</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-charcoal-900">
              {completedTodoCount} / {totalTodoCount}
            </span>
            <span className="text-xs text-charcoal-500">({todoPercent}%)</span>
          </div>
          <div className="mt-3 w-full bg-cream-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${todoPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-charcoal-500 mt-2.5">
            + {completedPlanCount}/{totalPlanCount} 7-day plan sessions
          </p>
        </div>

        {/* Metric 3: Topics Needing Revision */}
        <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-subtle">
          <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
            <span>Needs Revision</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-700">
              {needsRevisionTopics.length}
            </span>
            <span className="text-xs text-charcoal-500">flagged by quiz</span>
          </div>
          <p className="text-[11px] text-charcoal-500 mt-3">
            {needsRevisionTopics.length > 0
              ? 'Focus next study session on flagged topics'
              : 'All evaluated topics above passing mark'}
          </p>
        </div>

        {/* Metric 4: Self-Reported Weak Areas */}
        <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-subtle">
          <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
            <span>Identified Weak Areas</span>
            <div className="w-8 h-8 rounded-xl bg-coral-50 text-coral-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-charcoal-900">
              {weakAreas.length}
            </span>
            <span className="text-xs text-charcoal-500">active items</span>
          </div>
          <p className="text-[11px] text-charcoal-500 mt-3">
            Across {(profile.subjects || []).length} registered subjects
          </p>
        </div>
      </div>

      {/* Topics Breakdown Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-charcoal-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sage-600" />
              <span>Extracted Topic Mastery Status</span>
            </h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Breakdown of individual topic comprehension across uploaded class materials.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-xl bg-sage-50 text-sage-800 border border-sage-200">
              ✓ {understoodTopics.length} Understood
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              ⚠️ {needsRevisionTopics.length} Needs Revision
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-cream-100 text-charcoal-700 border border-cream-200">
              ⏳ {learningTopics.length} In Progress
            </span>
          </div>
        </div>

        {allTopics.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-cream-300 rounded-2xl bg-cream-50/50">
            <FileText className="w-10 h-10 text-charcoal-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-charcoal-700">No study materials uploaded yet</p>
            <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto">
              Upload your lecture notes, textbook chapters, or question banks to track topic mastery.
            </p>
            <button
              onClick={() => onNavigate('materials')}
              className="mt-4 px-4 py-2 rounded-xl bg-sage-600 text-white font-semibold text-xs shadow-sm hover:bg-sage-700 transition-colors"
            >
              Upload Material Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allTopics.map(({ material, topic }) => {
              const isUnderstood = topic.status === 'understood';
              const isNeedsRevision = topic.status === 'needs-revision';

              return (
                <div
                  key={topic.id}
                  className={`p-4.5 rounded-2xl border transition-all ${
                    isUnderstood
                      ? 'bg-sage-50/40 border-sage-200'
                      : isNeedsRevision
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-cream-50/40 border-cream-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-charcoal-500 mb-1">
                        <FileText className="w-3 h-3 text-sage-600" />
                        <span>{material.fileName}</span>
                        <span>•</span>
                        <span className="font-semibold text-charcoal-700">{material.subject}</span>
                      </div>
                      <h4 className="font-extrabold text-charcoal-900 text-sm">{topic.title}</h4>
                      <p className="text-xs text-charcoal-600 mt-1 line-clamp-2 leading-relaxed">
                        {topic.summary}
                      </p>
                    </div>

                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-xl font-bold whitespace-nowrap shrink-0 border ${
                        isUnderstood
                          ? 'bg-sage-100 text-sage-800 border-sage-300'
                          : isNeedsRevision
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-white text-charcoal-600 border-cream-300'
                      }`}
                    >
                      {topic.status === 'understood' && '✓ Understood'}
                      {topic.status === 'needs-revision' && '⚠️ Needs Revision'}
                      {topic.status === 'learning' && '⏳ Learning'}
                      {topic.status === 'not-started' && 'Not Started'}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-cream-200/80 flex items-center justify-between">
                    <span className="text-[11px] text-charcoal-500 font-medium">
                      {topic.quizScore !== undefined ? (
                        <span>Last quiz score: <strong className={topic.quizScore >= 60 ? 'text-sage-700' : 'text-coral-600'}>{topic.quizScore}%</strong></span>
                      ) : (
                        <span>No quiz recorded yet</span>
                      )}
                    </span>

                    <button
                      onClick={() => onSelectTopicForTutor(material, topic)}
                      className="text-xs font-bold text-sage-700 hover:text-sage-800 flex items-center gap-1 transition-colors"
                    >
                      <span>Study in Tutor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* High-Yield Learning Resources Section */}
      <ResourceRecommendations resources={resources} profile={profile} />
    </div>
  );
};
