import React, { useState } from 'react';
import { X, Check, AlertTriangle, AlertCircle } from 'lucide-react';
import { WeakAreaItem, SubjectRating } from '../types';

interface WeakAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveWeakArea: (weakArea: Omit<WeakAreaItem, 'id' | 'dateAdded'>) => void;
  subjects: SubjectRating[];
  defaultSubject?: string;
}

export const WeakAreaModal: React.FC<WeakAreaModalProps> = ({
  isOpen,
  onClose,
  onSaveWeakArea,
  subjects,
  defaultSubject,
}) => {
  const [subject, setSubject] = useState(defaultSubject || subjects[0]?.name || '');
  const [topic, setTopic] = useState('');
  const [severity, setSeverity] = useState<'critical' | 'moderate'>('critical');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setErrorMsg('Please select a subject');
      return;
    }
    if (!topic.trim()) {
      setErrorMsg('Topic or concept name is required');
      return;
    }

    onSaveWeakArea({
      subject,
      topic: topic.trim(),
      source: 'self-reported',
      severity,
      notes: notes.trim() || undefined,
    });

    setTopic('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-elevated border border-cream-200 space-y-5 my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-cream-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-coral-100 text-coral-800 flex items-center justify-center border border-coral-200">
              <AlertTriangle className="w-4 h-4 text-coral-600" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-charcoal-900">
                Self-Report Weak Topic
              </h2>
              <p className="text-xs text-charcoal-500">
                Flag concepts where you feel stuck or need extra revision.
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
          <div>
            <label className="block font-semibold text-charcoal-700 mb-1">
              Subject <span className="text-coral-500">*</span>
            </label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
              required
            >
              {subjects.map(s => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.proficiency}/5)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-charcoal-700 mb-1">
              Weak Topic / Difficult Concept <span className="text-coral-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Cross-Aldol reaction predictions, Lenz's Law direction"
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-charcoal-700 mb-1">
              Severity Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSeverity('critical')}
                className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                  severity === 'critical'
                    ? 'bg-coral-50 border-coral-300 text-coral-800 shadow-sm'
                    : 'bg-white border-cream-200 text-charcoal-600 hover:bg-cream-50'
                }`}
              >
                <div className="font-bold">⚠️ Critical Gap</div>
                <div className="text-[10px] text-charcoal-500 mt-0.5 font-normal">
                  High exam risk; need immediate focus
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSeverity('moderate')}
                className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                  severity === 'moderate'
                    ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-sm'
                    : 'bg-white border-cream-200 text-charcoal-600 hover:bg-cream-50'
                }`}
              >
                <div className="font-bold">⚡ Moderate</div>
                <div className="text-[10px] text-charcoal-500 mt-0.5 font-normal">
                  Understand basics, but need speed & drill
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-charcoal-700 mb-1">
              Why do you find this difficult? (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Tend to get confused with sign conventions in numerical formulas"
              className="w-full px-3.5 py-2 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-cream-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-charcoal-600 hover:bg-cream-100 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-coral-600 hover:bg-coral-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Record Weak Topic</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
