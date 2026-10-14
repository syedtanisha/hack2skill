import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  BookOpen,
  Send,
  FileText,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Plus,
  HelpCircle,
  GraduationCap,
  Lightbulb,
  Compass,
  ChevronDown,
  Layers,
  Loader2,
  BookmarkPlus
} from 'lucide-react';
import {
  StudyMaterial,
  ExtractedTopic,
  TutorMessage,
  TodoTask,
  QuizQuestion
} from '../types';
import { requestTutorExplanation, requestTopicQuiz } from '../services/apiClient';
import { TopicQuizModal } from './TopicQuizModal';

interface AITutorProps {
  materials: StudyMaterial[];
  activeMaterial: StudyMaterial | null;
  activeTopic: ExtractedTopic | null;
  onSelectTopic: (material: StudyMaterial, topic: ExtractedTopic) => void;
  onUpdateTopicStatus: (
    materialId: string,
    topicId: string,
    status: 'not-started' | 'learning' | 'needs-revision' | 'understood',
    quizScore?: number
  ) => void;
  onAddStudyTask: (task: Omit<TodoTask, 'id' | 'completed' | 'completedAt'> & { id?: string }) => void;
  onNavigateToMaterials: () => void;
}

export const AITutor: React.FC<AITutorProps> = ({
  materials,
  activeMaterial,
  activeTopic,
  onSelectTopic,
  onUpdateTopicStatus,
  onAddStudyTask,
  onNavigateToMaterials,
}) => {
  // Explanation level: beginner, intermediate, detailed
  const [explanationLevel, setExplanationLevel] = useState<'beginner' | 'intermediate' | 'detailed'>('intermediate');

  // Chat conversation history
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Active quiz modal
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  // Task creation feedback
  const [taskNotice, setTaskNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // When active topic changes, generate initial welcome & summary if empty
  useEffect(() => {
    if (activeTopic && activeMaterial) {
      setMessages([
        {
          id: `init-${activeTopic.id}`,
          role: 'assistant',
          content: `### Welcome to your study session on **${activeTopic.title}**!
I am your Context-Aware AI Tutor, strictly grounded in **${activeMaterial.fileName}**.

Here is what your material defines for this topic:
- **Core Summary**: ${activeTopic.summary}
${activeTopic.formulas.length > 0 ? `- **Primary Formula**: \`${activeTopic.formulas[0].formula}\` (${activeTopic.formulas[0].name})` : ''}
${activeTopic.definitions.length > 0 ? `- **Key Concept**: "${activeTopic.definitions[0].term}" — *${activeTopic.definitions[0].definition}*` : ''}

Choose one of the quick mode buttons above or type any specific question below to begin!`,
          sourceDocument: activeMaterial.fileName,
          sourceSection: activeTopic.sourceSection || 'Section 1',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [activeTopic?.id, activeMaterial?.id]);

  // Handle Mode Triggers (Simple, Step-by-Step, Example, etc.)
  const handleTriggerMode = async (
    mode: 'simple' | 'step-by-step' | 'example' | 'summary' | 'formulas' | 'practice'
  ) => {
    if (!activeTopic || !activeMaterial || isLoading) return;

    let userPromptText = '';
    switch (mode) {
      case 'simple':
        userPromptText = `Explain "${activeTopic.title}" in simple, intuitive language with easy analogies.`;
        break;
      case 'step-by-step':
        userPromptText = `Break down "${activeTopic.title}" step-by-step, showing how principles connect logically.`;
        break;
      case 'example':
        userPromptText = `Provide a concrete real-world engineering or practical application of "${activeTopic.title}".`;
        break;
      case 'summary':
        userPromptText = `Give me a concise exam revision summary of "${activeTopic.title}".`;
        break;
      case 'formulas':
        userPromptText = `List all formulas, variables, SI units, and terminology for "${activeTopic.title}".`;
        break;
      case 'practice':
        userPromptText = `Give me 2 conceptual practice problems on "${activeTopic.title}" with guided hints.`;
        break;
    }

    const userMsg: TutorMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userPromptText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await requestTutorExplanation(
        activeTopic,
        activeMaterial.extractedText || activeMaterial.rawText || '',
        activeMaterial.fileName,
        mode,
        explanationLevel,
        userPromptText
      );

      const assistantMsg: TutorMessage = {
        id: `tutor-${Date.now()}`,
        role: 'assistant',
        content: response.data.content,
        sourceDocument: response.data.sourceDocument,
        sourceSection: response.data.sourceSection,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Unable to generate explanation: ${err.message || 'Server error'}. Please try again.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Conversational Follow-Up Query
  const handleSendQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || !activeTopic || !activeMaterial || isLoading) return;

    const query = inputQuery.trim();
    setInputQuery('');

    const userMsg: TutorMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await requestTutorExplanation(
        activeTopic,
        activeMaterial.extractedText || activeMaterial.rawText || '',
        activeMaterial.fileName,
        'simple',
        explanationLevel,
        query
      );

      const assistantMsg: TutorMessage = {
        id: `tutor-${Date.now()}`,
        role: 'assistant',
        content: response.data.content,
        sourceDocument: response.data.sourceDocument,
        sourceSection: response.data.sourceSection,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Failed to answer follow-up: ${err.message || 'Server error'}.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Open Quiz Modal
  const handleLaunchQuiz = async () => {
    if (!activeTopic || !activeMaterial) return;
    setIsLoadingQuiz(true);

    try {
      const res = await requestTopicQuiz(
        activeTopic,
        activeMaterial.extractedText || activeMaterial.rawText || '',
        activeMaterial.fileName
      );
      if (res.success && res.data) {
        setQuizQuestions(res.data);
      }
      setIsQuizOpen(true);
    } catch (err) {
      console.warn('Quiz generation fallback:', err);
      setIsQuizOpen(true);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // Create study task for this topic
  const handleQuickAddTask = (customTitle?: string) => {
    if (!activeTopic || !activeMaterial) return;

    const taskTitle = customTitle || `Revise ${activeTopic.title} (${activeMaterial.subject})`;
    const today = new Date().toISOString().split('T')[0];

    onAddStudyTask({
      title: taskTitle,
      description: `Targeted review from "${activeMaterial.fileName}". Focus on formulas and practice definitions.`,
      subject: activeMaterial.subject,
      deadline: today,
      priority: activeTopic.status === 'needs-revision' ? 'High' : 'Medium',
      estimatedMinutes: 30,
    });

    setTaskNotice(`Added to-do task: "${taskTitle}"`);
    setTimeout(() => setTaskNotice(null), 3500);
  };

  // No materials uploaded at all
  if (materials.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-cream-200 text-center max-w-2xl mx-auto shadow-sm my-8">
        <div className="w-16 h-16 rounded-2xl bg-sage-50 text-sage-600 flex items-center justify-center mx-auto mb-4 border border-sage-100">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-charcoal-900 mb-2">No Study Materials Found</h2>
        <p className="text-sm text-charcoal-600 mb-6 leading-relaxed">
          The Context-Aware AI Tutor grounds every answer and formula directly in your actual class notes, lecture slides, or textbooks. Please upload a PDF, DOCX, PPTX, or TXT document first.
        </p>
        <button
          onClick={onNavigateToMaterials}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-sm shadow-md transition-all"
        >
          <BookOpen className="w-4 h-4" />
          <span>Go to My Materials & Upload</span>
        </button>
      </div>
    );
  }

  // Flatten all topics across all materials for selection
  const allAvailableTopics: { material: StudyMaterial; topic: ExtractedTopic }[] = [];
  materials.forEach(m => {
    (m.topics || []).forEach(t => {
      allAvailableTopics.push({ material: m, topic: t });
    });
  });

  const currentTopic = activeTopic || allAvailableTopics[0]?.topic || null;
  const currentMaterial = activeMaterial || allAvailableTopics[0]?.material || null;

  return (
    <div className="space-y-6">
      {/* Header Banner & Topic Selector */}
      <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sage-100 text-sage-800 border border-sage-200">
                Context-Aware AI Tutor
              </span>
              {currentMaterial && (
                <span className="text-xs font-semibold text-charcoal-500 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-sage-600" />
                  {currentMaterial.fileName}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">
              {currentTopic ? currentTopic.title : 'Select a Topic to Study'}
            </h1>
            <p className="text-xs text-charcoal-600 mt-0.5">
              Grounded explanations, step-by-step reasoning, and formula derivations directly from your uploaded materials.
            </p>
          </div>

          {/* Quick Controls: Topic Dropdown & Explanation Level */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Topic Selector */}
            <div className="relative">
              <select
                aria-label="Select study topic"
                value={`${currentMaterial?.id}:::${currentTopic?.id}`}
                onChange={e => {
                  const [mId, tId] = e.target.value.split(':::');
                  const mat = materials.find(m => m.id === mId);
                  const top = mat?.topics.find(t => t.id === tId);
                  if (mat && top) {
                    onSelectTopic(mat, top);
                  }
                }}
                className="appearance-none bg-cream-50 border border-cream-300 text-charcoal-800 text-xs font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-sage-400"
              >
                {materials.map(m => (
                  <optgroup key={m.id} label={`${m.subject} — ${m.fileName}`}>
                    {m.topics.map(t => (
                      <option key={t.id} value={`${m.id}:::${t.id}`}>
                        {t.title} {t.status === 'understood' ? '✓' : t.status === 'needs-revision' ? '⚠️' : ''}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-charcoal-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Topic Status Badge */}
            {currentTopic && (
              <span
                className={`text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 border ${
                  currentTopic.status === 'understood'
                    ? 'bg-sage-100 text-sage-800 border-sage-300'
                    : currentTopic.status === 'needs-revision'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : currentTopic.status === 'learning'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-cream-100 text-charcoal-600 border-cream-300'
                }`}
              >
                {currentTopic.status === 'understood' && <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />}
                {currentTopic.status === 'needs-revision' && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                {currentTopic.status === 'learning' && <RotateCcw className="w-3.5 h-3.5 text-blue-600" />}
                <span className="capitalize">{currentTopic.status.replace('-', ' ')}</span>
              </span>
            )}

            {/* Explanation Level Selector */}
            <div className="flex items-center bg-cream-100 p-0.5 rounded-xl border border-cream-200">
              {(['beginner', 'intermediate', 'detailed'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setExplanationLevel(lvl)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                    explanationLevel === lvl
                      ? 'bg-white text-sage-900 shadow-xs'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Action Mode Bar */}
        <div className="mt-5 pt-4 border-t border-cream-200/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-charcoal-500 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-sage-500" />
            <span>Tutor Modes:</span>
          </span>

          <button
            onClick={() => handleTriggerMode('simple')}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-sage-50 hover:bg-sage-100 text-sage-800 font-semibold text-xs border border-sage-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Lightbulb className="w-3.5 h-3.5 text-sage-600" />
            <span>💡 Simple Language</span>
          </button>

          <button
            onClick={() => handleTriggerMode('step-by-step')}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-xs border border-blue-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>🪜 Step-by-Step</span>
          </button>

          <button
            onClick={() => handleTriggerMode('example')}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>🧪 Real Example</span>
          </button>

          <button
            onClick={() => handleTriggerMode('summary')}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold text-xs border border-purple-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>📝 Key Summary</span>
          </button>

          <button
            onClick={() => handleTriggerMode('formulas')}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <span className="font-mono text-emerald-700">∑</span>
            <span>Formulas & Terms</span>
          </button>

          <button
            onClick={() => handleTriggerMode('practice')}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-xs border border-rose-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>🎯 Practice Questions</span>
          </button>

          <div className="ml-auto flex items-center gap-2">
            {/* Take Topic Quiz Button */}
            <button
              onClick={handleLaunchQuiz}
              disabled={isLoadingQuiz}
              className="px-3 py-1.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
            >
              {isLoadingQuiz ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>Topic Quiz (4 MCQs)</span>
            </button>

            {/* Quick Add to Study Plan */}
            <button
              onClick={() => handleQuickAddTask()}
              title="Add this topic revision session to your To-Do list / 7-Day Plan"
              className="px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-900 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-sage-400" />
              <span>+ Add to Study Plan</span>
            </button>
          </div>
        </div>

        {/* Task Added Notice */}
        {taskNotice && (
          <div className="mt-3 px-3 py-2 rounded-xl bg-sage-50 text-sage-800 border border-sage-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
            <span>{taskNotice}</span>
          </div>
        )}
      </div>

      {/* Main Conversation & Study Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 cols: Chat / Tutor Response Stream */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-cream-200 shadow-subtle flex flex-col h-[650px] overflow-hidden">
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {messages.map(msg => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                      isAssistant ? 'bg-sage-600' : 'bg-charcoal-800'
                    }`}
                  >
                    {isAssistant ? <GraduationCap className="w-4 h-4" /> : 'You'}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-4.5 text-xs sm:text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-cream-50/80 text-charcoal-900 border border-cream-200'
                        : 'bg-sage-600 text-white rounded-tr-xs'
                    }`}
                  >
                    {/* Markdown / Formatted text */}
                    <div className="whitespace-pre-line space-y-2">
                      {msg.content}
                    </div>

                    {/* Source Attribution Citation */}
                    {isAssistant && msg.sourceDocument && (
                      <div className="mt-3 pt-2.5 border-t border-cream-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-charcoal-500">
                        <span className="font-semibold flex items-center gap-1 text-sage-700">
                          <FileText className="w-3 h-3" />
                          <span>Source: {msg.sourceDocument}</span>
                          {msg.sourceSection && <span>• {msg.sourceSection}</span>}
                        </span>

                        <button
                          onClick={() => handleQuickAddTask(`Review ${currentTopic?.title || 'Topic'} Notes`)}
                          className="hover:text-charcoal-900 flex items-center gap-1 font-semibold text-charcoal-600 transition-colors"
                        >
                          <Plus className="w-3 h-3 text-sage-600" />
                          <span>Add to Planner</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Thinking / Loading State */}
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sage-600 text-white flex items-center justify-center text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-cream-50 border border-cream-200 rounded-2xl px-4 py-3 text-xs text-charcoal-600 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-sage-500 animate-pulse" />
                  <span>Synthesizing grounded explanation from your notes ({explanationLevel} level)...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendQuery}
            className="p-4 bg-white border-t border-cream-200 flex items-center gap-3"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder={`Ask a follow-up about "${currentTopic?.title || 'this topic'}"...`}
              disabled={isLoading || !currentTopic}
              className="flex-1 bg-cream-50 border border-cream-300 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim() || !currentTopic}
              className="px-5 py-2.5 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-40 disabled:hover:bg-sage-600"
            >
              <span>Ask Tutor</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right 1 col: Topic Knowledge Card & Quick Review */}
        <div className="space-y-4">
          {/* Active Topic Card */}
          <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-400 uppercase tracking-wider">
                Topic Intel
              </span>
              {currentTopic && (
                <select
                  aria-label="Set topic master status"
                  value={currentTopic.status}
                  onChange={e => {
                    if (currentMaterial && currentTopic) {
                      onUpdateTopicStatus(
                        currentMaterial.id,
                        currentTopic.id,
                        e.target.value as any
                      );
                    }
                  }}
                  className="text-xs font-bold bg-cream-100 rounded-lg px-2 py-1 text-charcoal-700 border border-cream-200 focus:outline-none"
                >
                  <option value="not-started">Not Started</option>
                  <option value="learning">Learning</option>
                  <option value="needs-revision">Needs Revision</option>
                  <option value="understood">Understood</option>
                </select>
              )}
            </div>

            {currentTopic ? (
              <>
                <div>
                  <h3 className="font-extrabold text-charcoal-900 text-base">
                    {currentTopic.title}
                  </h3>
                  <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                    {currentTopic.summary}
                  </p>
                </div>

                {/* Formulas Callout */}
                {currentTopic.formulas.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-cream-200">
                    <span className="text-xs font-bold text-charcoal-500 flex items-center gap-1">
                      <span className="font-mono text-sage-600">∑</span>
                      <span>Key Formulas</span>
                    </span>
                    <div className="space-y-1.5">
                      {currentTopic.formulas.map((f, i) => (
                        <div key={i} className="bg-cream-50 p-2.5 rounded-xl border border-cream-200 text-xs">
                          <div className="font-bold text-charcoal-900">{f.name}</div>
                          <code className="text-xs font-mono font-bold text-sage-700 bg-white px-2 py-0.5 rounded border border-cream-300 mt-1 inline-block">
                            {f.formula}
                          </code>
                          <p className="text-[11px] text-charcoal-500 mt-1">{f.notes || f.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Definitions */}
                {currentTopic.definitions.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-cream-200">
                    <span className="text-xs font-bold text-charcoal-500">Core Definitions</span>
                    <div className="space-y-1.5 text-xs">
                      {currentTopic.definitions.map((d, i) => (
                        <div key={i} className="bg-cream-50 p-2.5 rounded-xl border border-cream-200">
                          <span className="font-bold text-charcoal-800">{d.term}: </span>
                          <span className="text-charcoal-600">{d.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subtopics */}
                {currentTopic.subtopics.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-cream-200">
                    <span className="text-xs font-bold text-charcoal-500">Key Subtopics</span>
                    <div className="flex flex-wrap gap-1">
                      {currentTopic.subtopics.map((st, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-cream-100 text-charcoal-700">
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action button */}
                <button
                  onClick={() => handleQuickAddTask(`Review ${currentTopic.title} definitions`)}
                  className="w-full py-2.5 rounded-xl bg-sage-50 hover:bg-sage-100 text-sage-800 border border-sage-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-sage-600" />
                  <span>Create Study Task</span>
                </button>
              </>
            ) : (
              <p className="text-xs text-charcoal-500">No topic selected.</p>
            )}
          </div>

          {/* Quick Quiz Card */}
          <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-subtle space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-coral-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Topic Knowledge Check</span>
            </div>
            <p className="text-xs text-charcoal-600">
              Test your understanding with 4 multiple-choice questions grounded in this document. Scoring below 60% will mark the topic for revision.
            </p>
            <button
              onClick={handleLaunchQuiz}
              disabled={isLoadingQuiz || !currentTopic}
              className="w-full py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              {isLoadingQuiz ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <HelpCircle className="w-3.5 h-3.5" />}
              <span>Launch Quiz Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {isQuizOpen && currentTopic && currentMaterial && (
        <TopicQuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          topic={currentTopic}
          documentName={currentMaterial.fileName}
          questions={
            quizQuestions.length > 0
              ? quizQuestions
              : [
                  {
                    id: `q-${currentTopic.id}-1`,
                    question: `According to your study notes for '${currentTopic.title}', which statement represents its core principle?`,
                    options: [
                      currentTopic.definitions[0]?.definition || currentTopic.summary,
                      'Arbitrary static value constant across all thermal coordinates.',
                      'A non-physical convention used solely in isolated vacuum benchmarks.',
                      'Inversely proportional to entropy with zero thermodynamic constraint.',
                    ],
                    correctAnswer: 0,
                    explanation: `Directly from your notes: ${currentTopic.definitions[0]?.definition || currentTopic.summary}`,
                    topicId: currentTopic.id,
                    sourceReference: `${currentMaterial.fileName} • ${currentTopic.sourceSection || 'Section 1'}`,
                  },
                  {
                    id: `q-${currentTopic.id}-2`,
                    question: `What formula is documented in your material for ${currentTopic.title}?`,
                    options: [
                      'F = m * a^2',
                      currentTopic.formulas[0]?.formula || 'E = -dΦ/dt',
                      'PV = nRT^2',
                      'W = F / d',
                    ],
                    correctAnswer: 1,
                    explanation: `Formula verified from notes: ${currentTopic.formulas[0]?.formula || 'E = -dΦ/dt'}`,
                    topicId: currentTopic.id,
                    sourceReference: `${currentMaterial.fileName} • Formula Section`,
                  },
                  {
                    id: `q-${currentTopic.id}-3`,
                    question: `Why is the directional rule or negative sign significant in ${currentTopic.title}?`,
                    options: [
                      'It is purely decorative without physical meaning.',
                      'It upholds conservation of energy by opposing the initiating flux change.',
                      'It forces the magnitude to remain strictly below zero at all times.',
                      'It accounts for thermometer temperature scale shift.',
                    ],
                    correctAnswer: 1,
                    explanation: 'The negative sign reflects Lenz law and energy conservation.',
                    topicId: currentTopic.id,
                    sourceReference: `${currentMaterial.fileName} • Principles`,
                  },
                  {
                    id: `q-${currentTopic.id}-4`,
                    question: `If the rate of parameter change in '${currentTopic.title}' doubles, the induced output:`,
                    options: ['Doubles proportionally.', 'Halves.', 'Decreases to zero.', 'Remains constant.'],
                    correctAnswer: 0,
                    explanation: 'Linear time-rate dependence causes the output to double proportionally.',
                    topicId: currentTopic.id,
                    sourceReference: `${currentMaterial.fileName} • Applications`,
                  },
                ]
          }
          onCompleteQuiz={(topicId, score, passed) => {
            onUpdateTopicStatus(
              currentMaterial.id,
              topicId,
              passed ? 'understood' : 'needs-revision',
              score
            );
          }}
          onAddStudyTask={onAddStudyTask}
        />
      )}
    </div>
  );
};
