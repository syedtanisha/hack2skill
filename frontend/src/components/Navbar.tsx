import { 
  GraduationCap, 
  RotateCcw, 
  Sliders, 
  Activity, 
  Calendar, 
  BookOpen, 
  FileText, 
  Target 
} from 'lucide-react';
import { ApiStatus, StudentProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  apiStatus: ApiStatus;
  profile: StudentProfile;
  onOpenProfile: () => void;
  onResetDemo: () => void;
  onResetEmpty?: () => void;
  isDemoStudent: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  apiStatus,
  profile,
  onOpenProfile,
  onResetDemo,
  onResetEmpty,
  isDemoStudent,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'subjects', label: 'My Subjects', icon: BookOpen },
    { id: 'materials', label: 'My Materials', icon: FileText },
    { id: 'tutor', label: 'AI Tutor', icon: GraduationCap },
    { id: 'tasks', label: 'My Tasks', icon: Calendar },
    { id: 'progress', label: 'My Progress', icon: Target },
  ];

  const isTabActive = (tabId: string) => {
    if (currentTab === tabId) return true;
    if (tabId === 'tasks' && currentTab === 'planner') return true;
    if (tabId === 'subjects' && currentTab === 'gaps') return true;
    if (tabId === 'tutor' && currentTab === 'coach') return true;
    if (tabId === 'progress' && currentTab === 'resources') return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cream-200 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage-500 text-white flex items-center justify-center shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-charcoal-900">EduBridge</span>
                <span className="bg-sage-100 text-sage-800 text-xs px-2 py-0.5 rounded-md font-semibold tracking-wide border border-sage-200">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-charcoal-500 hidden sm:block">Your Personal AI Learning Companion</p>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-cream-100/80 p-1 rounded-xl border border-cream-200">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = isTabActive(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-sage-800 shadow-sm'
                      : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sage-600' : 'text-charcoal-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Items & Status */}
          <div className="flex items-center gap-2.5">
            {/* API Status Pill */}
            <div
              title={
                apiStatus.isConfigured
                  ? `Connected to Google ${apiStatus.model}`
                  : 'Running in offline intelligence demo mode (configured deterministic responses)'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                apiStatus.isConfigured
                  ? 'bg-sage-50 text-sage-800 border-sage-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  apiStatus.isConfigured ? 'bg-sage-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="hidden lg:inline text-[11px]">
                {apiStatus.isConfigured ? 'Gemini 3.8 Live' : 'Demo Mode (Offline AI)'}
              </span>
              <span className="lg:hidden text-[11px]">
                {apiStatus.isConfigured ? 'AI Live' : 'Demo'}
              </span>
            </div>

            {/* Sample Student / New Profile Actions */}
            <div className="hidden sm:flex items-center gap-1.5 bg-cream-100 p-0.5 rounded-xl border border-cream-200">
              <button
                onClick={onResetDemo}
                title="Load realistic sample student (Aarav Sharma) with PCM subjects, weak areas, and 5 tasks"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isDemoStudent
                    ? 'bg-sage-600 text-white shadow-xs'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Sample Demo</span>
              </button>
              {onResetEmpty && (
                <button
                  onClick={onResetEmpty}
                  title="Clear data and test new student onboarding experience from scratch"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    !profile.isCompleted
                      ? 'bg-sage-600 text-white shadow-xs'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  <span>New Student</span>
                </button>
              )}
            </div>

            {/* Profile / Goal Configuration */}
            <button
              onClick={onOpenProfile}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors shadow-sm ${
                profile.isCompleted
                  ? 'bg-sage-500 hover:bg-sage-600 text-white'
                  : 'bg-coral-500 hover:bg-coral-600 text-white animate-pulse'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {profile.isCompleted ? profile.name : 'Setup Profile'}
              </span>
              <span className="sm:hidden">Profile</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-cream-200/80 -mx-4 px-4 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = isTabActive(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  isActive
                    ? 'bg-sage-500 text-white'
                    : 'bg-cream-100 text-charcoal-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
