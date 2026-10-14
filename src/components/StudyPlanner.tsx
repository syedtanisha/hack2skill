import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  Plus, 
  X
} from 'lucide-react';
import { StudentProfile, StudyPlan, StudyTask, ApiStatus } from '../types';
import { requestStudyPlan } from '../services/apiClient';
import confetti from 'canvas-confetti';

interface StudyPlannerProps {
  profile: StudentProfile;
  plan: StudyPlan;
  setPlan: (plan: StudyPlan) => void;
  apiStatus: ApiStatus;
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<StudyTask, 'id' | 'completed'>) => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  profile,
  plan,
  setPlan,
  apiStatus,
  onToggleTask,
  onAddTask,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1); // 1 to 7 or 0 for All
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form state
  const [newSubject, setNewSubject] = useState(profile.subjects[0]?.name || 'Physics');
  const [newTopic, setNewTopic] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [newDuration, setNewDuration] = useState(45);
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newDay, setNewDay] = useState(1);

  const days = [
    { number: 1, label: 'Day 1 (Mon)' },
    { number: 2, label: 'Day 2 (Tue)' },
    { number: 3, label: 'Day 3 (Wed)' },
    { number: 4, label: 'Day 4 (Thu)' },
    { number: 5, label: 'Day 5 (Fri)' },
    { number: 6, label: 'Day 6 (Sat)' },
    { number: 7, label: 'Day 7 (Sun)' },
  ];

  const handleRegeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await requestStudyPlan(profile);
      if (res.success && res.data) {
        setPlan(res.data);
      }
    } catch (e) {
      console.error('Error generating plan:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTaskCheckbox = (taskId: string, currentCompleted: boolean) => {
    onToggleTask(taskId);
    if (!currentCompleted) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4A7C59', '#E07A5F', '#9CBFA7', '#E4EDE7'],
      });
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim() || !newActivity.trim()) return;

    onAddTask({
      dayNumber: newDay,
      dayLabel: days.find(d => d.number === newDay)?.label || `Day ${newDay}`,
      subject: newSubject,
      topic: newTopic.trim(),
      activity: newActivity.trim(),
      durationMinutes: Number(newDuration),
      priority: newPriority,
    });

    setNewTopic('');
    setNewActivity('');
    setShowAddModal(false);
  };

  // Filter tasks
  const filteredTasks = plan.tasks.filter(task => {
    if (selectedDay !== 0 && task.dayNumber !== selectedDay) return false;
    if (filterStatus === 'pending' && task.completed) return false;
    if (filterStatus === 'completed' && !task.completed) return false;
    return true;
  });

  const dayTasks = plan.tasks.filter(t => selectedDay === 0 || t.dayNumber === selectedDay);
  const dayCompleted = dayTasks.filter(t => t.completed).length;
  const dayTotal = dayTasks.length;
  const dayMinutes = dayTasks.reduce((sum, t) => sum + t.durationMinutes, 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Strategy Summary */}
      <div className="card-warm p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 tracking-tight">
                7-Day Adaptive AI Study Plan
              </h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-sage-100 text-sage-800 border border-sage-200">
                {plan.generatedBy === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Adaptive Intelligence'} ({apiStatus.isConfigured ? 'Live AI' : 'Offline Engine'})
              </span>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
              Calibrated for <span className="font-semibold">{profile.dailyMinutes} min/day</span> targeting {profile.goal}.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-charcoal-700 bg-cream-100 hover:bg-cream-200 border border-cream-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Task</span>
            </button>
            <button
              onClick={handleRegeneratePlan}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sage-500 hover:bg-sage-600 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Regenerating Plan...' : 'Regenerate Plan with AI'}</span>
            </button>
          </div>
        </div>

        {/* Executive summary banner */}
        <div className="p-4 rounded-xl bg-cream-50 border border-cream-200/90 text-xs text-charcoal-700 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-coral-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-charcoal-900">Study Strategy Summary: </span>
            <span>{plan.summary}</span>
          </div>
        </div>
      </div>

      {/* Day Selector Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedDay(0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedDay === 0
                ? 'bg-charcoal-900 text-white shadow-sm'
                : 'bg-white text-charcoal-600 border border-cream-200 hover:bg-cream-100'
            }`}
          >
            All Days ({plan.tasks.length})
          </button>
          {days.map(d => {
            const isSelected = selectedDay === d.number;
            const tasksForDay = plan.tasks.filter(t => t.dayNumber === d.number);
            const isDone = tasksForDay.length > 0 && tasksForDay.every(t => t.completed);

            return (
              <button
                key={d.number}
                onClick={() => setSelectedDay(d.number)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-sage-500 text-white border-sage-500 shadow-sm'
                    : isDone
                    ? 'bg-sage-50 text-sage-800 border-sage-200'
                    : 'bg-white text-charcoal-600 border-cream-200 hover:bg-cream-100'
                }`}
              >
                <span>{d.label}</span>
                {isDone && <CheckCircle2 className="w-3 h-3 text-sage-600" />}
              </button>
            );
          })}
        </div>

        {/* Task completion filter */}
        <div className="flex items-center gap-1 bg-cream-100 p-1 rounded-xl border border-cream-200 text-xs self-start sm:self-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold ${
              filterStatus === 'all' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-2.5 py-1 rounded-lg font-semibold ${
              filterStatus === 'pending' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-600'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-2.5 py-1 rounded-lg font-semibold ${
              filterStatus === 'completed' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-600'
            }`}
          >
            Done
          </button>
        </div>
      </div>

      {/* Day Progress Indicator */}
      <div className="flex items-center justify-between text-xs text-charcoal-600 px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-charcoal-900">
            {selectedDay === 0 ? 'Full Week Progress:' : `Day ${selectedDay} Progress:`}
          </span>
          <span>
            {dayCompleted} of {dayTotal} tasks completed ({dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0}%)
          </span>
        </div>
        <div className="flex items-center gap-1 text-charcoal-500">
          <Clock className="w-3.5 h-3.5" />
          <span>Total: {dayMinutes} mins scheduled</span>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="card-warm p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-sage-400 mx-auto" />
            <h3 className="text-base font-bold text-charcoal-900">No tasks in this filter</h3>
            <p className="text-xs text-charcoal-500">
              {filterStatus === 'completed'
                ? 'No tasks completed yet. Check off a task to track your momentum!'
                : 'Great job! All tasks for this view are completed.'}
            </p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              onClick={() => handleTaskCheckbox(task.id, task.completed)}
              className={`card-warm p-5 transition-all cursor-pointer select-none flex items-start gap-4 border ${
                task.completed
                  ? 'bg-cream-50/70 border-cream-200/90 text-charcoal-500'
                  : 'bg-white border-cream-200 hover:border-sage-400 hover:shadow-card'
              }`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => {}}
                className="mt-1 w-4 h-4 rounded text-sage-600 border-charcoal-300 focus:ring-sage-400 cursor-pointer"
              />

              {/* Task Details */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-sage-50 text-sage-800 border border-sage-200">
                    {task.subject}
                  </span>
                  <span className="text-xs font-bold text-charcoal-900">{task.topic}</span>
                  <span className="text-xs text-charcoal-400">•</span>
                  <span className="text-xs text-charcoal-500">{task.dayLabel}</span>

                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ml-auto ${
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

                {/* Concrete Learning Activity */}
                <p className={`text-xs leading-relaxed ${task.completed ? 'line-through text-charcoal-400' : 'text-charcoal-700'}`}>
                  <strong className="text-charcoal-900 font-semibold">Concrete Action: </strong>
                  {task.activity}
                </p>

                {/* Time & status meta */}
                <div className="flex items-center gap-4 text-xs text-charcoal-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-charcoal-400" />
                    <span>{task.durationMinutes} minutes</span>
                  </span>
                  {task.completed && (
                    <span className="text-sage-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Custom Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-elevated border border-cream-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <h2 className="text-lg font-bold text-charcoal-900">Add Custom Study Task</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Subject</label>
                <select
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400"
                >
                  {profile.subjects.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Topic Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lenz's Law & Faraday Numerical Sprint"
                  value={newTopic}
                  onChange={e => setNewTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">
                  Concrete Learning Activity (Be Specific)
                </label>
                <textarea
                  placeholder="e.g. Solve 8 exam problems and write 1-page formula summary without looking at notes."
                  value={newActivity}
                  onChange={e => setNewActivity(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Day</label>
                  <select
                    value={newDay}
                    onChange={e => setNewDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  >
                    {days.map(d => (
                      <option key={d.number} value={d.number}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Minutes</label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    step="5"
                    value={newDuration}
                    onChange={e => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-charcoal-600 hover:bg-cream-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sage-500 hover:bg-sage-600 text-white font-semibold shadow-sm"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
