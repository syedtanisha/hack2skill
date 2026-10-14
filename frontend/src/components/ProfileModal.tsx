import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, BookOpen, AlertCircle, GraduationCap } from 'lucide-react';
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
  const [name, setName] = useState(profile.name || '');
  const [course, setCourse] = useState(profile.course || '');
  const [branch, setBranch] = useState(profile.branch || '');
  const [year, setYear] = useState(profile.year || 'Class 12');
  const [semester, setSemester] = useState(profile.semester || 'Term 2');
  const [goal, setGoal] = useState(profile.goal || '');
  const [targetDate, setTargetDate] = useState(
    profile.targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [dailyMinutes, setDailyMinutes] = useState(profile.dailyMinutes || 120);
  const [subjects, setSubjects] = useState<SubjectRating[]>(profile.subjects || []);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(profile.name || '');
      setCourse(profile.course || '');
      setBranch(profile.branch || '');
      setYear(profile.year || 'Class 12');
      setSemester(profile.semester || 'Term 2');
      setGoal(profile.goal || '');
      setTargetDate(
        profile.targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      );
      setDailyMinutes(profile.dailyMinutes || 120);
      setSubjects(profile.subjects || []);
      setErrorMsg('');
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleRatingChange = (id: string, newProficiency: number) => {
    setSubjects(prev =>
      prev.map(sub => (sub.id === id ? { ...sub, proficiency: newProficiency } : sub))
    );
  };

  const handleAddSubject = () => {
    const trimmed = newSubjectName.trim();
    if (!trimmed) return;
    const exists = subjects.some(s => s.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setErrorMsg(`"${trimmed}" is already in your subjects list`);
      return;
    }

    const newSub: SubjectRating = {
      id: `sub-${Date.now()}`,
      name: trimmed,
      proficiency: 3,
    };

    setSubjects(prev => [...prev, newSub]);
    setNewSubjectName('');
    setErrorMsg('');
  };

  const handleRemoveSubject = (id: string) => {
    if (subjects.length <= 1) {
      setErrorMsg('You must have at least one subject to generate study plans and track progress.');
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
    if (!course.trim()) {
      setErrorMsg('Course / Degree is required (e.g. B.Tech Computer Science, Class 12 CBSE)');
      return;
    }
    if (!goal.trim()) {
      setErrorMsg('Exam or learning goal is required');
      return;
    }
    if (subjects.length === 0) {
      setErrorMsg('Please add at least one subject you are currently studying');
      return;
    }

    onSave({
      name: name.trim(),
      course: course.trim(),
      branch: branch.trim() || 'General',
      year: year.trim() || 'Current Year',
      semester: semester.trim() || 'Current Semester',
      goal: goal.trim(),
      targetDate,
      dailyMinutes: Number(dailyMinutes),
      subjects,
      isCompleted: true,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-elevated border border-cream-200 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cream-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sage-100 text-sage-800 flex items-center justify-center border border-sage-200">
              <GraduationCap className="w-5 h-5 text-sage-700" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-charcoal-900">
                {profile.isCompleted ? 'Edit Academic Profile' : 'Student Academic Setup'}
              </h2>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Personalize your subjects, academic year, and daily study capacity.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100 transition-colors"
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
          {/* Row 1: Name & Course */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Student Full Name <span className="text-coral-500">*</span>
              </label>
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
                Course & Degree <span className="text-coral-500">*</span>
              </label>
              <input
                type="text"
                value={course}
                onChange={e => setCourse(e.target.value)}
                placeholder="e.g. Class 12 CBSE, B.Tech CSE, B.Sc Physics"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400"
                required
              />
            </div>
          </div>

          {/* Row 2: Branch/Specialization & Year / Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Branch / Stream
              </label>
              <input
                type="text"
                value={branch}
                onChange={e => setBranch(e.target.value)}
                placeholder="e.g. PCM + CS, AI & Data Science"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Current Year
              </label>
              <input
                type="text"
                value={year}
                onChange={e => setYear(e.target.value)}
                placeholder="e.g. Class 12, 3rd Year"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Semester / Term
              </label>
              <input
                type="text"
                value={semester}
                onChange={e => setSemester(e.target.value)}
                placeholder="e.g. Term 2 Finals, 5th Sem"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400"
              />
            </div>
          </div>

          {/* Row 3: Goal & Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Target Exam / Learning Goal <span className="text-coral-500">*</span>
              </label>
              <input
                type="text"
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="e.g. Board Finals & JEE Entrance, Midterms"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Target Milestone Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400"
                required
              />
            </div>
          </div>

          {/* Row 4: Daily Available Minutes */}
          <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-200">
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-charcoal-800">
                Daily Study Capacity
              </label>
              <span className="font-bold text-sage-700 text-xs">
                {dailyMinutes} mins ({(dailyMinutes / 60).toFixed(1)} hrs/day)
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="300"
              step="15"
              value={dailyMinutes}
              onChange={e => setDailyMinutes(Number(e.target.value))}
              className="w-full accent-sage-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-charcoal-400 mt-1">
              <span>30 mins (Quick)</span>
              <span>120 mins (2.0 hrs)</span>
              <span>180 mins (3.0 hrs)</span>
              <span>300 mins (5.0 hrs)</span>
            </div>
          </div>

          {/* Row 5: Subjects and Proficiency Ratings */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-charcoal-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-sage-600" />
                <span>Currently Studying Subjects ({subjects.length})</span>
              </label>
              <span className="text-[11px] text-charcoal-500">1: Struggling • 3: Average • 5: Mastery</span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {subjects.map(sub => (
                <div
                  key={sub.id}
                  className="p-3 rounded-xl bg-cream-50/80 border border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <span className="font-bold text-charcoal-900 text-xs">{sub.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(sub.id)}
                      title="Remove subject"
                      className="text-charcoal-400 hover:text-coral-600 p-1 rounded transition-colors"
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
                    <span className="text-[10px] text-charcoal-600 font-semibold ml-2 min-w-[70px]">
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
                placeholder="Add another subject (e.g. Operating Systems, Calculus, Biology)..."
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
                className="px-3.5 py-2 rounded-xl bg-sage-50 hover:bg-sage-100 text-sage-800 font-bold text-xs border border-sage-200 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subject</span>
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-cream-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-charcoal-600 hover:bg-cream-100 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-sage-500 hover:bg-sage-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Save Academic Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
