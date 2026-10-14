import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  ArrowUpRight,
  Target
} from 'lucide-react';
import { StudentProfile, SkillGap, ApiStatus } from '../types';
import { requestSkillGaps } from '../services/apiClient';

interface SkillGapAnalysisProps {
  profile: StudentProfile;
  gaps: SkillGap[];
  setGaps: (gaps: SkillGap[]) => void;
  apiStatus: ApiStatus;
  onOpenProfile: () => void;
  onNavigate: (tab: string) => void;
}

export const SkillGapAnalysis: React.FC<SkillGapAnalysisProps> = ({
  profile,
  gaps,
  setGaps,
  apiStatus,
  onOpenProfile,
  onNavigate,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'moderate' | 'strong'>('all');

  const handleReanalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await requestSkillGaps(profile);
      if (result.success && result.data) {
        setGaps(result.data);
      }
    } catch (err) {
      console.error('Failed to re-analyze gaps', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredGaps = gaps.filter(gap => {
    if (activeFilter === 'all') return true;
    return gap.status === activeFilter;
  });

  const criticalCount = gaps.filter(g => g.status === 'critical').length;
  const moderateCount = gaps.filter(g => g.status === 'moderate').length;
  const strongCount = gaps.filter(g => g.status === 'strong').length;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="card-warm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 tracking-tight">
              Skill Gap & Diagnostics Analysis
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 font-semibold border border-sage-200">
              {gaps.length} Subjects Evaluated
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-cream-100 text-charcoal-600 font-medium border border-cream-200">
              Engine: {apiStatus.isConfigured ? 'Gemini 3.8 Flash' : 'Offline Intelligence'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-600">
            Identifies vulnerabilities based on your 1–5 self-assessments, explaining root causes and optimal time allocation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenProfile}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-charcoal-700 bg-cream-100 hover:bg-cream-200 border border-cream-200 transition-colors"
          >
            Adjust Ratings
          </button>
          <button
            onClick={handleReanalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sage-500 hover:bg-sage-600 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing with AI...' : 'Re-analyze with Gemini'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Summary stats */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-cream-100 p-1 rounded-xl border border-cream-200 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-charcoal-900 shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            All ({gaps.length})
          </button>
          <button
            onClick={() => setActiveFilter('critical')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeFilter === 'critical'
                ? 'bg-coral-500 text-white shadow-sm'
                : 'text-coral-700 hover:bg-coral-50'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Critical Gaps ({criticalCount})
          </button>
          <button
            onClick={() => setActiveFilter('moderate')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeFilter === 'moderate'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            Moderate ({moderateCount})
          </button>
          <button
            onClick={() => setActiveFilter('strong')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeFilter === 'strong'
                ? 'bg-sage-500 text-white shadow-sm'
                : 'text-sage-800 hover:bg-sage-50'
            }`}
          >
            Strong ({strongCount})
          </button>
        </div>

        <div className="text-xs text-charcoal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sage-600" />
          <span>Priority weights adapt directly into your 7-Day Study Plan</span>
        </div>
      </div>

      {/* Gap Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGaps.map(gap => {
          const isCritical = gap.status === 'critical';
          const isModerate = gap.status === 'moderate';

          return (
            <div
              key={gap.id}
              className={`card-warm p-6 space-y-4 border transition-all ${
                isCritical
                  ? 'border-coral-300 hover:border-coral-400 bg-white'
                  : isModerate
                  ? 'border-amber-200 hover:border-amber-300 bg-white'
                  : 'border-sage-200 hover:border-sage-300 bg-white'
              }`}
            >
              {/* Card top */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-charcoal-900">{gap.subject}</h2>
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                        isCritical
                          ? 'bg-coral-50 text-coral-700 border-coral-200'
                          : isModerate
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-sage-50 text-sage-800 border-sage-200'
                      }`}
                    >
                      {gap.badge}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-charcoal-500">
                    <span>Proficiency Rating:</span>
                    <span className="font-bold text-charcoal-900">{gap.proficiency} / 5</span>
                    <div className="flex ml-1.5 gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          className={`w-2 h-2 rounded-full ${
                            star <= gap.proficiency
                              ? isCritical
                                ? 'bg-coral-500'
                                : isModerate
                                ? 'bg-amber-400'
                                : 'bg-sage-500'
                              : 'bg-charcoal-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs font-bold text-charcoal-900">
                    <Clock className="w-3.5 h-3.5 text-sage-600" />
                    <span>{gap.recommendedWeeklyHours} hrs/wk</span>
                  </div>
                  <span className="text-[10px] text-charcoal-500">Suggested Focus</span>
                </div>
              </div>

              {/* Diagnostic explanation */}
              <div className="p-3.5 rounded-xl bg-cream-50/90 border border-cream-200 space-y-1.5 text-xs">
                <div className="font-semibold text-charcoal-800 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-sage-600" />
                  <span>Why This Needs Attention:</span>
                </div>
                <p className="text-charcoal-700 leading-relaxed">{gap.explanation}</p>
                <p className="text-coral-700 font-medium pt-1 text-[11px]">
                  <strong>Strategic Urgency:</strong> {gap.urgencyReason}
                </p>
              </div>

              {/* High yield recommended topics */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                  Target High-Yield Concepts:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {gap.suggestedTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-lg bg-cream-100 text-charcoal-700 border border-cream-200/90"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card action */}
              <div className="pt-2 border-t border-cream-200 flex items-center justify-between text-xs">
                <button
                  onClick={() => onNavigate('planner')}
                  className="font-semibold text-sage-700 hover:text-sage-800 flex items-center gap-1"
                >
                  <span>Review Study Sessions</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('resources')}
                  className="text-charcoal-500 hover:text-charcoal-800"
                >
                  Find Practice Resources →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
