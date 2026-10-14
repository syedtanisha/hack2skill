import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { StudyPlanner } from './components/StudyPlanner';
import { SkillGapAnalysis } from './components/SkillGapAnalysis';
import { MaterialScanner } from './components/MaterialScanner';
import { AITutor } from './components/AITutor';
import { ProgressOverview } from './components/ProgressOverview';
import { ProfileModal } from './components/ProfileModal';
import {
  StudentProfile,
  StudyPlan,
  SkillGap,
  ResourceItem,
  ChatMessage,
  ApiStatus,
  StudyTask,
  TodoTask,
  WeakAreaItem,
  StudyMaterial,
  ExtractedTopic,
} from './types';
import { storage } from './utils/storage';
import { checkApiHealth, requestSkillGaps, requestStudyPlan } from './services/apiClient';
import { Sparkles, X } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [profile, setProfile] = useState<StudentProfile>(() => storage.getProfile());
  const [tasks, setTasks] = useState<TodoTask[]>(() => storage.getTasks());
  const [weakAreas, setWeakAreas] = useState<WeakAreaItem[]>(() => storage.getWeakAreas());
  const [plan, setPlan] = useState<StudyPlan>(() => storage.getStudyPlan());
  const [gaps, setGaps] = useState<SkillGap[]>(() => storage.getSkillGaps());
  const [resources, setResources] = useState<ResourceItem[]>(() => storage.getResources());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => storage.getChatMessages());
  const [materials, setMaterials] = useState<StudyMaterial[]>(() => storage.getMaterials());
  const [activeTutorMaterial, setActiveTutorMaterial] = useState<StudyMaterial | null>(() => {
    const initial = storage.getMaterials();
    return initial[0] || null;
  });
  const [activeTutorTopic, setActiveTutorTopic] = useState<ExtractedTopic | null>(() => {
    const initial = storage.getMaterials();
    return initial[0]?.topics[0] || null;
  });
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
    storage.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    storage.saveWeakAreas(weakAreas);
  }, [weakAreas]);

  useEffect(() => {
    storage.saveStudyPlan(plan);
  }, [plan]);

  useEffect(() => {
    storage.saveSkillGaps(gaps);
  }, [gaps]);

  useEffect(() => {
    storage.saveChatMessages(chatMessages);
  }, [chatMessages]);

  useEffect(() => {
    storage.saveMaterials(materials);
  }, [materials]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  // Toggle To-Do task completion
  const handleToggleTodoTask = (taskId: string) => {
    setTasks(prevTasks => {
      const updated = prevTasks.map(t => {
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

      const toggled = updated.find(t => t.id === taskId);
      if (toggled?.completed) {
        showToast(`🎉 Completed task: "${toggled.title}"`);
      }
      return updated;
    });
  };

  // Add or Edit To-Do task
  const handleAddOrEditTodoTask = (
    taskData: Omit<TodoTask, 'id' | 'completed' | 'completedAt'> & { id?: string }
  ) => {
    if (taskData.id) {
      // Editing existing task
      setTasks(prev =>
        prev.map(t =>
          t.id === taskData.id
            ? {
                ...t,
                title: taskData.title,
                description: taskData.description,
                subject: taskData.subject,
                deadline: taskData.deadline,
                priority: taskData.priority,
                estimatedMinutes: taskData.estimatedMinutes,
              }
            : t
        )
      );
      showToast(`Updated task: "${taskData.title}"`);
    } else {
      // Adding new task
      const newTask: TodoTask = {
        id: `todo-${Date.now()}`,
        title: taskData.title,
        description: taskData.description,
        subject: taskData.subject,
        deadline: taskData.deadline,
        priority: taskData.priority,
        estimatedMinutes: taskData.estimatedMinutes,
        completed: false,
      };

      setTasks(prev => [newTask, ...prev]);

      // Synchronize to 7-Day Plan so the task immediately appears in both Planner and Dashboard
      const planPriority = newTask.priority === 'Urgent' ? 'High' : (newTask.priority as 'High' | 'Medium' | 'Low');
      const newPlanTask: StudyTask = {
        id: `plan-synced-${newTask.id}`,
        dayNumber: 1,
        dayLabel: 'Day 1 (Mon)',
        subject: newTask.subject,
        topic: newTask.title,
        durationMinutes: newTask.estimatedMinutes || 30,
        priority: planPriority,
        activity: newTask.description || `Targeted practice for ${newTask.title}`,
        completed: false,
      };
      setPlan(prev => ({
        ...prev,
        tasks: [newPlanTask, ...prev.tasks],
      }));

      showToast(`Added to study plan and to-do list for ${taskData.subject}`);
    }
  };

  // Delete To-Do task
  const handleDeleteTodoTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (taskToDelete) {
      showToast(`Removed task: "${taskToDelete.title}"`);
    }
  };

  // Save Self-Reported Weak Area
  const handleSaveWeakArea = (weakArea: Omit<WeakAreaItem, 'id' | 'dateAdded'>) => {
    const newWeakItem: WeakAreaItem = {
      ...weakArea,
      id: `weak-${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    setWeakAreas(prev => [newWeakItem, ...prev]);
    showToast(`Recorded weak topic in ${weakArea.subject}`);
  };

  // Delete Weak Area
  const handleDeleteWeakArea = (id: string) => {
    setWeakAreas(prev => prev.filter(w => w.id !== id));
    showToast('Weak area removed');
  };

  // Toggle 7-Day Plan Task (for planner tab)
  const handleTogglePlanTask = (taskId: string) => {
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
        showToast(`🎉 Completed 7-day session: "${toggled.topic}"`);
      }

      return {
        ...prevPlan,
        tasks: updatedTasks,
      };
    });
  };

  // Add 7-Day Plan Task
  const handleAddPlanTask = (newTaskData: Omit<StudyTask, 'id' | 'completed'>) => {
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

  // Save Profile & Recalibrate
  const handleSaveProfile = async (updatedProfile: StudentProfile) => {
    setProfile(updatedProfile);
    showToast('Recalibrating academic recommendations...');

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

      showToast('Profile saved and academic intelligence refreshed!');
    } catch (e) {
      console.error(e);
      showToast('Academic profile saved!');
    }
  };

  // Handle Topic Status Update (e.g. from quiz or tutor)
  const handleUpdateTopicStatus = (
    materialId: string,
    topicId: string,
    status: 'not-started' | 'learning' | 'needs-revision' | 'understood',
    quizScore?: number
  ) => {
    setMaterials(prevMaterials => {
      const updated = prevMaterials.map(mat => {
        if (mat.id === materialId) {
          return {
            ...mat,
            topics: mat.topics.map(t => {
              if (t.id === topicId) {
                return {
                  ...t,
                  status,
                  quizScore: quizScore !== undefined ? quizScore : t.quizScore,
                  lastQuizDate: quizScore !== undefined ? new Date().toISOString() : t.lastQuizDate,
                };
              }
              return t;
            }),
          };
        }
        return mat;
      });
      return updated;
    });

    if (activeTutorTopic?.id === topicId) {
      setActiveTutorTopic(prev =>
        prev
          ? {
              ...prev,
              status,
              quizScore: quizScore !== undefined ? quizScore : prev.quizScore,
              lastQuizDate: quizScore !== undefined ? new Date().toISOString() : prev.lastQuizDate,
            }
          : null
      );
    }

    if (status === 'understood') {
      showToast(`🎉 Topic marked as Understood! (${quizScore !== undefined ? `${quizScore}% score` : ''})`);
    } else if (status === 'needs-revision') {
      showToast(`⚠️ Topic marked as Needs Revision. Practice task recommended.`);
    }
  };

  // Add Uploaded Material
  const handleAddMaterial = (newMaterial: StudyMaterial) => {
    setMaterials(prev => [newMaterial, ...prev]);
    if (newMaterial.topics.length > 0) {
      setActiveTutorMaterial(newMaterial);
      setActiveTutorTopic(newMaterial.topics[0]);
    }
    showToast(`Analyzed and saved: "${newMaterial.fileName}"`);
  };

  // Delete Material
  const handleDeleteMaterial = (materialId: string) => {
    const mat = materials.find(m => m.id === materialId);
    setMaterials(prev => prev.filter(m => m.id !== materialId));
    if (activeTutorMaterial?.id === materialId) {
      const remaining = materials.filter(m => m.id !== materialId);
      setActiveTutorMaterial(remaining[0] || null);
      setActiveTutorTopic(remaining[0]?.topics[0] || null);
    }
    if (mat) {
      showToast(`Removed document: "${mat.fileName}"`);
    }
  };

  // Select Topic to study in AI Tutor
  const handleSelectTopicForTutor = (material: StudyMaterial, topic: ExtractedTopic) => {
    setActiveTutorMaterial(material);
    setActiveTutorTopic(topic);
    setCurrentTab('tutor');
    showToast(`Opened "${topic.title}" in AI Tutor`);
  };

  // Reset to Demo (Aarav Sharma)
  const handleResetDemo = () => {
    storage.resetToDemo();
    setProfile(storage.getProfile());
    setTasks(storage.getTasks());
    setWeakAreas(storage.getWeakAreas());
    setPlan(storage.getStudyPlan());
    setGaps(storage.getSkillGaps());
    setResources(storage.getResources());
    setChatMessages(storage.getChatMessages());
    const demoMats = storage.getMaterials();
    setMaterials(demoMats);
    setActiveTutorMaterial(demoMats[0] || null);
    setActiveTutorTopic(demoMats[0]?.topics[0] || null);
    showToast('Demo profile (Aarav Sharma) & sample tasks loaded for evaluation');
  };

  // Reset to Empty (New Student Experience)
  const handleResetEmpty = () => {
    storage.resetToEmpty();
    setProfile(storage.getProfile());
    setTasks(storage.getTasks());
    setWeakAreas(storage.getWeakAreas());
    setPlan(storage.getStudyPlan());
    setGaps(storage.getSkillGaps());
    setResources(storage.getResources());
    setChatMessages(storage.getChatMessages());
    const emptyMats = storage.getMaterials();
    setMaterials(emptyMats);
    setActiveTutorMaterial(null);
    setActiveTutorTopic(null);
    showToast('Switched to Fresh New Student mode — Setup prompt active');
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
        onResetEmpty={handleResetEmpty}
        isDemoStudent={profile.name === 'Aarav Sharma' && profile.isCompleted === true}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <DashboardOverview
            profile={profile}
            tasks={tasks}
            weakAreas={weakAreas}
            gaps={gaps}
            apiStatus={apiStatus}
            onSaveProfile={handleSaveProfile}
            onAddTask={handleAddOrEditTodoTask}
            onToggleTask={handleToggleTodoTask}
            onDeleteTask={handleDeleteTodoTask}
            onSaveWeakArea={handleSaveWeakArea}
            onDeleteWeakArea={handleDeleteWeakArea}
            onNavigate={setCurrentTab}
            onOpenProfile={() => setIsProfileOpen(true)}
            onLoadDemo={handleResetDemo}
          />
        )}

        {(currentTab === 'subjects' || currentTab === 'gaps') && (
          <SkillGapAnalysis
            profile={profile}
            gaps={gaps}
            setGaps={setGaps}
            apiStatus={apiStatus}
            onOpenProfile={() => setIsProfileOpen(true)}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'materials' && (
          <MaterialScanner
            materials={materials}
            subjects={profile.subjects || []}
            onAddMaterial={handleAddMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            onUpdateTopicStatus={handleUpdateTopicStatus}
            onSelectTopicForTutor={handleSelectTopicForTutor}
            onAddStudyTask={handleAddOrEditTodoTask}
          />
        )}

        {(currentTab === 'tutor' || currentTab === 'coach') && (
          <AITutor
            materials={materials}
            activeMaterial={activeTutorMaterial || materials[0] || null}
            activeTopic={activeTutorTopic || materials[0]?.topics[0] || null}
            onSelectTopic={(mat, top) => {
              setActiveTutorMaterial(mat);
              setActiveTutorTopic(top);
            }}
            onUpdateTopicStatus={handleUpdateTopicStatus}
            onAddStudyTask={handleAddOrEditTodoTask}
            onNavigateToMaterials={() => setCurrentTab('materials')}
          />
        )}

        {(currentTab === 'tasks' || currentTab === 'planner') && (
          <StudyPlanner
            profile={profile}
            plan={plan}
            setPlan={setPlan}
            apiStatus={apiStatus}
            onToggleTask={handleTogglePlanTask}
            onAddTask={handleAddPlanTask}
          />
        )}

        {(currentTab === 'progress' || currentTab === 'resources') && (
          <ProgressOverview
            profile={profile}
            tasks={tasks}
            plan={plan}
            weakAreas={weakAreas}
            materials={materials}
            resources={resources}
            onNavigate={setCurrentTab}
            onSelectTopicForTutor={handleSelectTopicForTutor}
          />
        )}
      </main>

      {/* Profile & Academic Settings Modal */}
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
              <span>{apiStatus.isConfigured ? 'Gemini 3.8 Flash Live' : 'Deterministic Offline Engine'}</span>
            </span>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="hover:text-charcoal-900 font-semibold transition-colors"
            >
              Academic Settings
            </button>
            <button
              onClick={handleResetDemo}
              className="hover:text-charcoal-900 transition-colors"
            >
              Reload Sample Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
