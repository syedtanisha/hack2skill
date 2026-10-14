import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Lightbulb
} from 'lucide-react';
import { ChatMessage, StudentProfile, ApiStatus } from '../types';
import { requestCoachAnswer } from '../services/apiClient';

interface LearningCoachProps {
  profile: StudentProfile;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  apiStatus: ApiStatus;
}

export const LearningCoach: React.FC<LearningCoachProps> = ({
  profile,
  messages,
  setMessages,
  apiStatus,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: "⚡ Explain Lenz's Law simply", prompt: "Explain Lenz's Law and magnetic flux opposition in simple terms with an everyday analogy." },
    { label: "🧪 Demystify Aldol Condensation", prompt: "Break down the Aldol condensation mechanism into 3 simple memorable steps for exam recall." },
    { label: "📐 Master Integration by Parts", prompt: "What is the fastest way to choose u and dv in Integration by Parts using the ILATE rule?" },
    { label: "⏱️ 2-Hour Study Routine", prompt: "How should I structure my 120-minute daily study block to tackle Physics and Chemistry without mental fatigue?" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsSending(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const result = await requestCoachAnswer(text.trim(), profile, history);

      const assistantMessage: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: 'assistant',
        content: result.data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: result.isFallback,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: 'assistant',
        content: `I encountered an unexpected issue: ${err.message || 'Unable to connect'}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = () => {
    const welcome: ChatMessage = {
      id: 'msg-reset',
      role: 'assistant',
      content: `Chat history cleared. I'm ready to help with your study goal: **${profile.goal}**. What concept or problem can we solve together?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcome]);
  };

  return (
    <div className="card-warm flex flex-col h-[700px] max-h-[82vh] overflow-hidden border border-cream-200">
      {/* Top Coach Header */}
      <div className="p-4 sm:p-5 border-b border-cream-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sage-500 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-charcoal-900 text-base">EduBridge Learning Coach</h2>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  apiStatus.isConfigured
                    ? 'bg-sage-50 text-sage-800 border-sage-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {apiStatus.isConfigured ? 'Gemini 3.8 Flash' : 'Offline Coach Mode'}
              </span>
            </div>
            <p className="text-[11px] text-charcoal-500">
              Personalized academic tutoring for <span className="font-medium text-charcoal-700">{profile.name}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          title="Clear chat conversation"
          className="p-2 rounded-xl text-charcoal-400 hover:text-coral-600 hover:bg-cream-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-cream-50/40">
        {messages.map(msg => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-charcoal-800 text-white'
                    : 'bg-sage-500 text-white shadow-sm'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-subtle ${
                  isUser
                    ? 'bg-sage-600 text-white rounded-tr-none'
                    : 'bg-white text-charcoal-800 border border-cream-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap space-y-2">
                  {msg.content}
                </div>

                <div
                  className={`mt-2 flex items-center justify-between text-[10px] ${
                    isUser ? 'text-sage-100' : 'text-charcoal-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.isFallback && (
                    <span className="text-amber-600 font-semibold ml-2">
                      • Offline Diagnostic Response
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-sage-500 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-white border border-cream-200 rounded-2xl rounded-tl-none p-4 shadow-subtle text-xs text-charcoal-600 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-sage-400 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse delay-100" />
                <span className="w-2 h-2 rounded-full bg-sage-600 animate-pulse delay-200" />
              </div>
              <span className="font-medium">Thinking through your question...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-white border-t border-cream-200 overflow-x-auto scrollbar-none flex items-center gap-1.5">
        <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
          <Lightbulb className="w-3 h-3 text-amber-500" />
          <span>Quick Ask:</span>
        </span>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(qp.prompt)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-sage-50 hover:text-sage-800 text-charcoal-700 whitespace-nowrap transition-colors border border-cream-200 shrink-0 font-medium"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 sm:p-4 bg-white border-t border-cream-200">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask a question about physics formulas, organic mechanisms, study habits..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={isSending}
            className="flex-1 px-4 py-2.5 rounded-xl border border-cream-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 disabled:bg-cream-100"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="px-4 py-2.5 rounded-xl bg-sage-500 hover:bg-sage-600 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
