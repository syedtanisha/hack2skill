import { 
  CheckCircle2, 
  Clock, 
  Flame, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  Calendar, 
  Target,
  BookOpen
} from 'lucide-react';
import { StudentProfile, StudyPlan, SkillGap } from '../types';
import confetti from 'canvas-confetti';

interface DashboardOverviewProps {
  profile: StudentProfile;
  plan: StudyPlan;
  gaps: SkillGap[];
  onToggleTask: (taskId: string) => void;
  onNavigate: (tab: string) => void;
  onOpenProfile: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  profile,
  plan,
  gaps,
  onToggleTask,
  onNavigate,
  onOpenProfile,
}) => {
  // Get time of day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Calculate task stats
  const totalTasks = plan.tasks.length;
  const completedTasks = plan.tasks.filter(t => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Today's tasks (Day 1 or first pending tasks)
  const todaysTasks = plan.tasks.filter(t => t.dayNumber === 1);
  const criticalGaps = gaps.filter(g => g.status === 'critical');

  // Days until target exam date
  const targetDateObj = new Date(profile.targetDate);
  const diffTime = targetDateObj.getTime() - new Date().getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const handleTaskCheck = (taskId: string, isChecked: boolean) => {
    onToggleTask(taskId);
    if (!isChecked) {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#4A7C59', '#E07A5F', '#9CBFA7'],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sage-50 via-white to-coral-50 border border-cream-200 rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-sage-200 text-xs font-semibold text-sage-800 shadow-subtle">
              <Sparkles className="w-3.5 h-3.5 text-sage-600" />
              <span>Personalized AI Study Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
              {greeting}, {profile.name}! 👋
            </h1>
            <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">
              Targeting <span className="font-semibold text-charcoal-900">{profile.goal}</span>. 
              {daysRemaining > 0 ? (
                <> <span className="text-coral-600 font-bold">{daysRemaining} days</span> until target milestone.</>
              ) : (
                ' Today is your milestone day!'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('planner')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sage-500 text-white font-semibold text-xs sm:text-sm hover:bg-sage-600 transition-all shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>View 7-Day Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('coach')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-charcoal-700 font-semibold text-xs sm:text-sm hover:bg-cream-100 border border-cream-200 transition-all"
            >
              <Sparkles className="w-4 h-4 text-coral-500" />
              <span>Ask AI Coach</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-sage-100/50 pointer-events-none blur-2xl" />
      </div>

      {/* 4 Metric Pulse Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Study Target */}
        <div className="card-warm p-5 hover:border-sage-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Daily Target</span>
            <div className="w-8 h-8 rounded-lg bg-sage-50 text-sage-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-charcoal-900">{profile.dailyMinutes}</span>
            <span className="text-xs text-charcoal-500 font-medium">mins/day ({(profile.dailyMinutes / 60).toFixed(1)} hrs)</span>
          </div>
          <p className="mt-1 text-xs text-charcoal-500">Structured into high-focus blocks</p>
        </div>

        {/* Completed Tasks Progress */}
        <div className="card-warm p-5 hover:border-sage-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Plan Progress</span>
            <div className="w-8 h-8 rounded-lg bg-coral-50 text-coral-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-charcoal-900">{progressPercent}%</span>
              <span className="text-xs text-charcoal-500 font-medium">({completedTasks}/{totalTasks} tasks)</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-2.5 w-full bg-cream-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-sage-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Skill Gaps Identified */}
        <div className="card-warm p-5 hover:border-coral-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Critical Gaps</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-charcoal-900">{criticalGaps.length}</span>
            <span className="text-xs text-coral-700 font-semibold">Need Urgent Attention</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {criticalGaps.map(g => (
              <span key={g.id} className="text-[11px] px-2 py-0.5 rounded-md bg-coral-50 text-coral-800 font-semibold border border-coral-200">
                {g.subject} ({g.proficiency}/5)
              </span>
            ))}
          </div>
        </div>

        {/* Study Streak */}
        <div className="card-warm p-5 hover:border-sage-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Study Streak</span>
            <div className="w-8 h-8 rounded-lg bg-coral-50 text-coral-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-charcoal-900">4</span>
            <span className="text-xs text-charcoal-500 font-medium">Days In A Row</span>
          </div>
          <p className="mt-1 text-xs text-sage-700 font-semibold">Consistent effort beats cramming!</p>
        </div>
      </div>

      {/* Main Grid: Today's Tasks + Skill Gap Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Action Checklist */}
        <div className="lg:col-span-2 card-warm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cream-200">
            <div>
              <h2 className="text-lg font-bold text-charcoal-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-sage-600" />
                <span>Today's Focus Tasks (Day 1)</span>
              </h2>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Check off items as you complete them to update your adaptive study curve.
              </p>
            </div>
            <button
              onClick={() => onNavigate('planner')}
              className="text-xs font-semibold text-sage-700 hover:text-sage-800 flex items-center gap-1"
            >
              <span>Full 7-Day View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todaysTasks.map(task => (
              <div
                key={task.id}
                onClick={() => handleTaskCheck(task.id, task.completed)}
                className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3.5 ${
                  task.completed
                    ? 'bg-cream-50/80 border-cream-200 text-charcoal-500'
                    : 'bg-white border-cream-300 hover:border-sage-400 hover:shadow-subtle'
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {}}
                  className="mt-1 w-4 h-4 rounded text-sage-600 border-charcoal-300 focus:ring-sage-400 cursor-pointer"
                />

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-charcoal-900">
                      {task.subject}
                    </span>
                    <span className="text-xs text-charcoal-400">•</span>
                    <span className="text-xs text-charcoal-600 font-medium">{task.topic}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ml-auto ${
                        task.priority === 'High'
                          ? 'bg-coral-50 text-coral-700 border border-coral-200'
                          : task.priority === 'Medium'
                          ? 'bg-sage-50 text-sage-700 border border-sage-200'
                          : 'bg-cream-100 text-charcoal-600'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>

                  <p className={`text-xs ${task.completed ? 'line-through text-charcoal-400' : 'text-charcoal-700'}`}>
                    {task.activity}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-charcoal-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-charcoal-400" />
                      {task.durationMinutes} mins
                    </span>
                    {task.completed && (
                      <span className="text-sage-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-charcoal-500">
            <span>Adaptive 7-day schedule calibrated by EduBridge</span>
            <button
              onClick={() => onNavigate('planner')}
              className="text-sage-700 font-semibold hover:underline"
            >
              See all {plan.tasks.length} tasks
            </button>
          </div>
        </div>

        {/* Right 1 Col: Skill Gap Diagnostics Snapshot */}
        <div className="card-warm p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-cream-200">
            <div>
              <h2 className="text-base font-bold text-charcoal-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-coral-500" />
                <span>Proficiency Diagnostics</span>
              </h2>
              <p className="text-xs text-charcoal-500 mt-0.5">Based on your self-assessments</p>
            </div>
            <button
              onClick={onOpenProfile}
              className="text-xs font-semibold text-sage-700 hover:text-sage-800"
            >
              Edit
            </button>
          </div>

          <div className="space-y-4">
            {profile.subjects.map(sub => {
              const rating = sub.proficiency;
              const isWeak = rating <= 2;
              return (
                <div key={sub.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-charcoal-900">{sub.name}</span>
                    <div className="flex items-center gap-1">
                      <span className={`font-bold ${isWeak ? 'text-coral-600' : 'text-sage-700'}`}>
                        {rating} / 5
                      </span>
                      <span className="text-charcoal-400 text-[10px]">
                        ({isWeak ? 'Weak' : rating === 3 ? 'Average' : 'Strong'})
                      </span>
                    </div>
                  </div>

                  {/* Rating meter */}
                  <div className="w-full bg-cream-100 rounded-full h-2 flex overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        rating <= 2 ? 'bg-coral-500' : rating === 3 ? 'bg-amber-400' : 'bg-sage-500'
                      }`}
                      style={{ width: `${(rating / 5) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Diagnostic callout */}
          <div className="p-4 rounded-xl bg-sage-50/70 border border-sage-200/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sage-800">
              <Sparkles className="w-3.5 h-3.5 text-sage-600" />
              <span>AI Study Recommendation</span>
            </div>
            <p className="text-xs text-charcoal-700 leading-relaxed">
              We allocated <span className="font-semibold text-charcoal-900">65% of your study hours</span> to Physics & Chemistry to close fundamental comprehension bottlenecks before the target date.
            </p>
            <button
              onClick={() => onNavigate('gaps')}
              className="text-xs font-bold text-sage-800 hover:text-sage-900 flex items-center gap-1 pt-1"
            >
              <span>Explore Root-Cause Analysis</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
