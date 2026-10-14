import React, { useState } from 'react';
import { X, Plus, Trash2, Check, BookOpen, AlertCircle } from 'lucide-react';
import { StudentProfile, SubjectRating } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSave: (updatedProfile: StudentProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [name, setName] = useState(profile.name);
  const [goal, setGoal] = useState(profile.goal);
  const [targetDate, setTargetDate] = useState(profile.targetDate);
  const [dailyMinutes, setDailyMinutes] = useState(profile.dailyMinutes);
  const [subjects, setSubjects] = useState<SubjectRating[]>(profile.subjects);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleRatingChange = (id: string, newProficiency: number) => {
    setSubjects(prev =>
      prev.map(sub => (sub.id === id ? { ...sub, proficiency: newProficiency } : sub))
    );
  };

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    const exists = subjects.some(s => s.name.toLowerCase() === newSubjectName.trim().toLowerCase());
    if (exists) {
      setErrorMsg('Subject already exists');
      return;
    }

    const newSub: SubjectRating = {
      id: `sub-${Date.now()}`,
      name: newSubjectName.trim(),
      proficiency: 3,
    };

    setSubjects(prev => [...prev, newSub]);
    setNewSubjectName('');
    setErrorMsg('');
  };

  const handleRemoveSubject = (id: string) => {
    if (subjects.length <= 1) {
      setErrorMsg('You must have at least one subject');
      return;
    }
    setSubjects(prev => prev.filter(s => s.id !== id));
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Student name is required');
      return;
    }
    if (!goal.trim()) {
      setErrorMsg('Goal is required');
      return;
    }
    if (subjects.length === 0) {
      setErrorMsg('Please add at least one subject');
      return;
    }

    onSave({
      name: name.trim(),
      goal: goal.trim(),
      targetDate,
      dailyMinutes: Number(dailyMinutes),
      subjects,
      lastUpdated: new Date().toISOString(),
    });

    onClose();
  };

  const getProficiencyLabel = (val: number) => {
    switch (val) {
      case 1:
        return '1 - Struggling / Novice';
      case 2:
        return '2 - Needs Attention / Basic';
      case 3:
        return '3 - Intermediate / Average';
      case 4:
        return '4 - Proficient / Confident';
      case 5:
        return '5 - Advanced / Mastery';
      default:
        return `${val} / 5`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-elevated border border-cream-200 space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cream-200">
          <div>
            <h2 className="text-xl font-extrabold text-charcoal-900">Student Profile & Goal Settings</h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Customize your learning target, daily capacity, and self-assessed proficiencies.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-coral-50 border border-coral-200 text-coral-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Name & Daily Minutes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Student Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Daily Available Minutes ({dailyMinutes} mins = {(dailyMinutes / 60).toFixed(1)} hrs)
              </label>
              <input
                type="range"
                min="30"
                max="240"
                step="15"
                value={dailyMinutes}
                onChange={e => setDailyMinutes(Number(e.target.value))}
                className="w-full accent-sage-500 cursor-pointer mt-2"
              />
              <div className="flex justify-between text-[10px] text-charcoal-400 mt-1">
                <span>30 mins</span>
                <span>120 mins (2h)</span>
                <span>240 mins (4h)</span>
              </div>
            </div>
          </div>

          {/* Goal & Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Exam / Learning Goal</label>
              <input
                type="text"
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="e.g. Class 12 STEM Finals, JEE, SAT, DSA Prep"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Target Exam Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400"
                required
              />
            </div>
          </div>

          {/* Subjects and Proficiency Ratings */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-charcoal-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-sage-600" />
                <span>Subject Proficiencies (1 to 5)</span>
              </label>
              <span className="text-[11px] text-charcoal-500">1: Novice / 5: Expert</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {subjects.map(sub => (
                <div
                  key={sub.id}
                  className="p-3 rounded-xl bg-cream-50 border border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <span className="font-bold text-charcoal-900 text-xs">{sub.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(sub.id)}
                      className="text-charcoal-400 hover:text-coral-600 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    {[1, 2, 3, 4, 5].map(val => {
                      const isSelected = sub.proficiency === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          title={getProficiencyLabel(val)}
                          onClick={() => handleRatingChange(sub.id, val)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                            isSelected
                              ? val <= 2
                                ? 'bg-coral-500 text-white shadow-sm'
                                : val === 3
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-sage-500 text-white shadow-sm'
                              : 'bg-white border border-cream-300 text-charcoal-600 hover:bg-cream-100'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                    <span className="text-[10px] text-charcoal-500 font-medium ml-2 min-w-[70px]">
                      {sub.proficiency <= 2 ? '⚠️ Weak' : sub.proficiency === 3 ? 'Average' : '✅ Strong'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Subject Row */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add new subject (e.g. Biology, History)..."
                value={newSubjectName}
                onChange={e => setNewSubjectName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubject();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl border border-cream-300 text-xs focus:outline-none focus:ring-2 focus:ring-sage-400"
              />
              <button
                type="button"
                onClick={handleAddSubject}
                className="px-3.5 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-charcoal-700 font-semibold text-xs border border-cream-200 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-cream-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-charcoal-600 hover:bg-cream-100 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-sage-500 hover:bg-sage-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save & Recalibrate Plan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
