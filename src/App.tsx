import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { StudyPlanner } from './components/StudyPlanner';
import { SkillGapAnalysis } from './components/SkillGapAnalysis';
import { ResourceRecommendations } from './components/ResourceRecommendations';
import { LearningCoach } from './components/LearningCoach';
import { ProfileModal } from './components/ProfileModal';
import { StudentProfile, StudyPlan, SkillGap, ResourceItem, ChatMessage, ApiStatus, StudyTask } from './types';
import { storage } from './utils/storage';
import { checkApiHealth, requestSkillGaps, requestStudyPlan } from './services/apiClient';
import { Sparkles, X } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [profile, setProfile] = useState<StudentProfile>(() => storage.getProfile());
  const [plan, setPlan] = useState<StudyPlan>(() => storage.getStudyPlan());
  const [gaps, setGaps] = useState<SkillGap[]>(() => storage.getSkillGaps());
  const [resources, setResources] = useState<ResourceItem[]>(() => storage.getResources());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => storage.getChatMessages());
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    isConfigured: false,
    model: 'Offline Intelligence Engine',
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check API health on load
  useEffect(() => {
    const initApi = async () => {
      const status = await checkApiHealth();
      setApiStatus(status);
    };
    initApi();
  }, []);

  // Save changes to storage
  useEffect(() => {
    storage.saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    storage.saveStudyPlan(plan);
  }, [plan]);

  useEffect(() => {
    storage.saveSkillGaps(gaps);
  }, [gaps]);

  useEffect(() => {
    storage.saveChatMessages(chatMessages);
  }, [chatMessages]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleToggleTask = (taskId: string) => {
    setPlan(prevPlan => {
      const updatedTasks = prevPlan.tasks.map(t => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      });

      const toggled = updatedTasks.find(t => t.id === taskId);
      if (toggled?.completed) {
        showToast(`🎉 Completed: "${toggled.topic}"`);
      }

      return {
        ...prevPlan,
        tasks: updatedTasks,
      };
    });
  };

  const handleAddTask = (newTaskData: Omit<StudyTask, 'id' | 'completed'>) => {
    const newTask: StudyTask = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      completed: false,
    };

    setPlan(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));

    showToast(`Added task to ${newTaskData.dayLabel}`);
  };

  const handleSaveProfile = async (updatedProfile: StudentProfile) => {
    setProfile(updatedProfile);
    showToast('Recalibrating plan based on updated proficiencies...');

    try {
      // Re-calculate skill gaps
      const gapRes = await requestSkillGaps(updatedProfile);
      if (gapRes.success && gapRes.data) {
        setGaps(gapRes.data);
      }

      // Re-generate study plan
      const planRes = await requestStudyPlan(updatedProfile);
      if (planRes.success && planRes.data) {
        setPlan(planRes.data);
      }

      showToast('Study Plan and Skill Gap Analysis successfully updated!');
    } catch (e) {
      console.error(e);
      showToast('Profile saved!');
    }
  };

  const handleResetDemo = () => {
    storage.resetToDemo();
    setProfile(storage.getProfile());
    setPlan(storage.getStudyPlan());
    setGaps(storage.getSkillGaps());
    setResources(storage.getResources());
    setChatMessages(storage.getChatMessages());
    showToast('Demo student profile & plan reloaded for evaluation');
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        apiStatus={apiStatus}
        profile={profile}
        onOpenProfile={() => setIsProfileOpen(true)}
        onResetDemo={handleResetDemo}
        isDemoStudent={profile.name === 'Aarav Sharma'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <DashboardOverview
            profile={profile}
            plan={plan}
            gaps={gaps}
            onToggleTask={handleToggleTask}
            onNavigate={setCurrentTab}
            onOpenProfile={() => setIsProfileOpen(true)}
          />
        )}

        {currentTab === 'planner' && (
          <StudyPlanner
            profile={profile}
            plan={plan}
            setPlan={setPlan}
            apiStatus={apiStatus}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
          />
        )}

        {currentTab === 'gaps' && (
          <SkillGapAnalysis
            profile={profile}
            gaps={gaps}
            setGaps={setGaps}
            apiStatus={apiStatus}
            onOpenProfile={() => setIsProfileOpen(true)}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'resources' && (
          <ResourceRecommendations
            resources={resources}
            profile={profile}
          />
        )}

        {currentTab === 'coach' && (
          <LearningCoach
            profile={profile}
            messages={chatMessages}
            setMessages={setChatMessages}
            apiStatus={apiStatus}
          />
        )}
      </main>

      {/* Profile & Goals Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-charcoal-900 text-white px-4 py-3 rounded-2xl shadow-elevated flex items-center gap-3 text-xs animate-in slide-in-from-bottom duration-200 border border-charcoal-700">
          <Sparkles className="w-4 h-4 text-sage-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-charcoal-400 hover:text-white ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-cream-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-charcoal-800">EduBridge AI</span>
            <span>•</span>
            <span>Your Personal AI Learning Companion</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiStatus.isConfigured ? 'bg-sage-500' : 'bg-amber-500'
                }`}
              />
              <span>{apiStatus.isConfigured ? 'Gemini 3.8 Flash' : 'Deterministic Offline Mode'}</span>
            </span>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="hover:text-charcoal-900 font-semibold transition-colors"
            >
              Goal Settings
            </button>
            <button
              onClick={handleResetDemo}
              className="hover:text-charcoal-900 transition-colors"
            >
              Reset Sample Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
