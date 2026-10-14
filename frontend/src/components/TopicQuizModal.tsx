import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Plus, Sparkles } from 'lucide-react';
import { ExtractedTopic, QuizQuestion, TodoTask } from '../types';
import confetti from 'canvas-confetti';

interface TopicQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: ExtractedTopic | null;
  documentName: string;
  questions: QuizQuestion[];
  onCompleteQuiz: (topicId: string, score: number, passed: boolean) => void;
  onAddStudyTask: (task: Omit<TodoTask, 'id' | 'completed' | 'completedAt'> & { id?: string }) => void;
}

export const TopicQuizModal: React.FC<TopicQuizModalProps> = ({
  isOpen,
  onClose,
  topic,
  documentName,
  questions,
  onCompleteQuiz,
  onAddStudyTask,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scorePercentage, setScorePercentage] = useState(0);

  if (!isOpen || !topic || questions.length === 0) return null;

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / questions.length) * 100);
    setScorePercentage(percent);
    setIsSubmitted(true);

    const passed = percent >= 60;
    onCompleteQuiz(topic.id, percent, passed);

    if (passed) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4A7C59', '#E07A5F', '#9CBFA7'],
      });
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScorePercentage(0);
  };

  const handleCreateRevisionTask = () => {
    onAddStudyTask({
      title: `Revise weak topic: ${topic.title}`,
      description: `Targeted review prompted by ${scorePercentage}% quiz score on ${documentName}. Focus on definitions and formulas.`,
      subject: topic.chapterTitle?.split('•')[0]?.trim() || 'General Studies',
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'Urgent',
      estimatedMinutes: 45,
      topicId: topic.id,
    });
    onClose();
  };

  const allAnswered = Object.keys(selectedAnswers).length === questions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-elevated border border-cream-200 space-y-5 my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cream-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-sage-100 text-sage-800 border border-sage-200 uppercase tracking-wider">
                Topic Mastery Diagnostic
              </span>
              <span className="text-xs text-charcoal-400">•</span>
              <span className="text-xs text-charcoal-500 truncate max-w-[200px] sm:max-w-xs">
                {documentName}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-charcoal-900 mt-1">
              {topic.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Banner if Submitted */}
        {isSubmitted && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-3 animate-in fade-in duration-200 ${
              scorePercentage >= 60
                ? 'bg-sage-50 border-sage-200 text-sage-900'
                : 'bg-coral-50 border-coral-200 text-coral-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                {scorePercentage >= 60 ? (
                  <CheckCircle2 className="w-5 h-5 text-sage-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-coral-600 shrink-0" />
                )}
                <span>
                  Diagnostic Score: {scorePercentage}% ({Object.values(selectedAnswers).filter((ans, idx) => ans === questions[idx].correctAnswer).length} of {questions.length} correct)
                </span>
              </div>
              <button
                onClick={handleResetQuiz}
                className="flex items-center gap-1 text-xs font-semibold underline text-charcoal-600 hover:text-charcoal-900"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
            </div>

            <p className="leading-relaxed">
              {scorePercentage >= 60
                ? 'Excellent work! You demonstrated strong retention of this topic from your notes.'
                : '⚠️ Learning gap detected: Reviewing formulas and directional rules is recommended before proceeding.'}
            </p>

            {scorePercentage < 60 && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCreateRevisionTask}
                  className="px-3.5 py-2 rounded-xl bg-coral-600 hover:bg-coral-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Revision Task to Study Plan</span>
                </button>
                <span className="text-[11px] text-coral-800 italic">
                  Topic automatically flagged as "Needs revision"
                </span>
              </div>
            )}
          </div>
        )}

        {/* Question List */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs max-h-[60vh] overflow-y-auto pr-1">
          {questions.map((q, qIdx) => {
            const studentChoice = selectedAnswers[qIdx];
            const isAnswered = studentChoice !== undefined;
            const isCorrect = isAnswered && studentChoice === q.correctAnswer;

            return (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-cream-50/60 border border-cream-200 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-charcoal-900 text-xs">
                    Question {qIdx + 1}: {q.question}
                  </span>
                  {isSubmitted && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        isCorrect ? 'bg-sage-100 text-sage-800' : 'bg-coral-100 text-coral-800'
                      }`}
                    >
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = studentChoice === optIdx;
                    let optionStyle = 'bg-white border-cream-300 hover:border-sage-300 text-charcoal-700';

                    if (isSubmitted) {
                      if (optIdx === q.correctAnswer) {
                        optionStyle = 'bg-sage-100 border-sage-400 text-sage-900 font-bold';
                      } else if (isSelected && !isCorrect) {
                        optionStyle = 'bg-coral-100 border-coral-400 text-coral-900 line-through';
                      } else {
                        optionStyle = 'bg-white/60 border-cream-200 text-charcoal-400';
                      }
                    } else if (isSelected) {
                      optionStyle = 'bg-sage-50 border-sage-500 text-sage-900 font-semibold shadow-xs';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(qIdx, optIdx)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${optionStyle}`}
                      >
                        <span className="w-5 h-5 rounded-full border border-current text-[11px] font-bold flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1 leading-relaxed">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {isSubmitted && q.explanation && (
                  <div className="p-2.5 rounded-xl bg-white border border-cream-200 text-[11px] text-charcoal-600 space-y-1">
                    <span className="font-bold text-charcoal-800 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-sage-600" />
                      <span>Rationale:</span>
                    </span>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Actions */}
          <div className="pt-3 border-t border-cream-200 flex items-center justify-between">
            <span className="text-xs text-charcoal-500">
              {Object.keys(selectedAnswers).length} of {questions.length} answered
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-charcoal-600 hover:bg-cream-100 font-semibold text-xs transition-colors"
              >
                {isSubmitted ? 'Close' : 'Cancel'}
              </button>
              {!isSubmitted && (
                <button
                  type="submit"
                  disabled={!allAnswered}
                  className="px-5 py-2.5 rounded-xl bg-sage-500 hover:bg-sage-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <span>Submit Answers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
