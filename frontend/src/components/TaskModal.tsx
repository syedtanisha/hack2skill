import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Clock, AlertCircle, Bookmark } from 'lucide-react';
import { TodoTask, SubjectRating } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Omit<TodoTask, 'id' | 'completed' | 'completedAt'> & { id?: string }) => void;
  taskToEdit?: TodoTask | null;
  subjects: SubjectRating[];
  defaultSubject?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  taskToEdit,
  subjects,
  defaultSubject,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'Urgent' | 'High' | 'Medium' | 'Low'>('High');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || '');
        setSubject(taskToEdit.subject);
        setDeadline(taskToEdit.deadline);
        setPriority(taskToEdit.priority);
        setEstimatedMinutes(taskToEdit.estimatedMinutes || 45);
      } else {
        setTitle('');
        setDescription('');
        setSubject(defaultSubject || subjects[0]?.name || '');
        setDeadline(new Date().toISOString().split('T')[0]);
        setPriority('High');
        setEstimatedMinutes(45);
      }
      setErrorMsg('');
    }
  }, [isOpen, taskToEdit, defaultSubject, subjects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Task title is required');
      return;
    }
    if (!subject.trim()) {
      setErrorMsg('Please select a subject');
      return;
    }

    onSaveTask({
      id: taskToEdit?.id,
      title: title.trim(),
      description: description.trim(),
      subject,
      deadline,
      priority,
      estimatedMinutes: Number(estimatedMinutes),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-elevated border border-cream-200 space-y-5 my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-cream-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center border border-sage-200">
              <Bookmark className="w-4 h-4 text-sage-700" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-charcoal-900">
                {taskToEdit ? 'Edit Academic Task' : 'Add To-Do Task'}
              </h2>
              <p className="text-xs text-charcoal-500">
                Assign real assignments, topics, or problem sets to your subjects.
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
              Task Title <span className="text-coral-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Solve 10 questions on Lenz's Law & Faraday EMF"
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-charcoal-700 mb-1">
              Notes or Problem Set Details (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Exercise 4.2 in textbook, review formula cheat sheet first"
              className="w-full px-3.5 py-2 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none"
            />
          </div>

          {/* Subject & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Associated Subject <span className="text-coral-500">*</span>
              </label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
                required
              >
                {subjects.length === 0 ? (
                  <option value="">No subjects saved in profile</option>
                ) : (
                  subjects.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.proficiency}/5)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
              >
                <option value="Urgent">🔥 Urgent (Exam / Due Soon)</option>
                <option value="High">⚠️ High Priority</option>
                <option value="Medium">⚡ Medium Priority</option>
                <option value="Low">🌱 Low Priority</option>
              </select>
            </div>
          </div>

          {/* Deadline & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
                <span>Deadline</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-charcoal-400" />
                <span>Estimated Duration</span>
              </label>
              <select
                value={estimatedMinutes}
                onChange={e => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
              >
                <option value="20">20 mins (Quick Review)</option>
                <option value="30">30 mins (Standard Sprint)</option>
                <option value="45">45 mins (Deep Problem Set)</option>
                <option value="60">60 mins (1 Hour Session)</option>
                <option value="90">90 mins (Comprehensive Block)</option>
                <option value="120">120 mins (Mock / Long Prep)</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
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
              className="px-5 py-2.5 rounded-xl bg-sage-500 hover:bg-sage-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{taskToEdit ? 'Save Changes' : 'Add to My Tasks'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
