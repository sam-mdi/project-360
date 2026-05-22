import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Clock, LayoutGrid, BarChart2, Calendar, Settings, ChevronLeft, Menu } from 'lucide-react';
import { RoutinePage } from './pages/RoutinePage';
import { PlanPage } from './pages/PlanPage';
import { ProgressPage } from './pages/ProgressPage';
import { SchedulePage } from './pages/SchedulePage';
import { SettingsModal } from './components/ui/SettingsModal';
import { WelcomeModal } from './components/ui/WelcomeModal';
import { CommandPalette } from './components/ui/CommandPalette';
import { useSettings } from './stores/useSettings';
import { useKeyboard } from './hooks/useKeyboard';
import { useNotifications } from './hooks/useNotifications';
import { greetingText } from './lib/utils';
import { cn } from './lib/utils';

type Tab = 'routine' | 'plan' | 'progress' | 'schedule';

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'routine', label: 'Routine', icon: Clock },
  { id: 'plan', label: 'Plan', icon: LayoutGrid },
  { id: 'progress', label: 'Progress', icon: BarChart2 },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
];

const TAB_ORDER = TABS.map((t) => t.id);

class ErrorBoundaryInner extends React.Component<
  { children: React.ReactNode; onError: (msg: string) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: (msg: string) => void }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) { this.props.onError(error.message); }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = React.useState<string | null>(null);
  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-center">
        <div>
          <p className="text-rose-500 font-semibold mb-2">Something went wrong</p>
          <p className="text-stone-400 text-sm mb-3">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-amber-500 text-sm font-semibold hover:text-amber-600"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  return <ErrorBoundaryInner onError={setError}>{children}</ErrorBoundaryInner>;
}

export default function App() {
  const [tab, setTab] = useState<Tab>('routine');
  const [prevTab, setPrevTab] = useState<Tab | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const { firstName } = useSettings();

  useNotifications();

  useEffect(() => {
    const seen = localStorage.getItem('p360-welcome-seen');
    if (!seen) {
      setShowWelcome(true);
      localStorage.setItem('p360-welcome-seen', '1');
    }
  }, []);

  const navigateToTab = (newTab: Tab) => {
    setPrevTab(tab);
    setTab(newTab);
  };

  const tabDirection =
    prevTab ? (TAB_ORDER.indexOf(tab) > TAB_ORDER.indexOf(prevTab) ? 1 : -1) : 1;

  useKeyboard({
    t: () => navigateToTab('routine'),
    escape: () => { setSettingsOpen(false); setCommandOpen(false); },
    'meta+k': () => setCommandOpen(true),
    'ctrl+k': () => setCommandOpen(true),
  }, [tab]);

  const pages: Record<Tab, React.ReactNode> = {
    routine: <RoutinePage />,
    plan: <PlanPage />,
    progress: <ProgressPage />,
    schedule: <SchedulePage />,
  };

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-slate-900 transition-all duration-300 shrink-0',
          sidebarExpanded ? 'w-60' : 'w-16'
        )}
      >
        {/* Logo + toggle */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-slate-800">
          {sidebarExpanded && (
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-7 h-7 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <span className="text-white text-xs font-extrabold">360</span>
              </div>
              <span className="text-white font-bold text-sm tracking-tight">Project 360</span>
            </div>
          )}
          <button
            onClick={() => setSidebarExpanded((v) => !v)}
            className={cn(
              'p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors',
              !sidebarExpanded && 'mx-auto'
            )}
          >
            {sidebarExpanded ? <ChevronLeft size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Greeting */}
        {sidebarExpanded && (
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              {greetingText(firstName)}
            </p>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-2 py-3 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => navigateToTab(id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                tab === id
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800',
                !sidebarExpanded && 'justify-center'
              )}
              title={!sidebarExpanded ? label : undefined}
            >
              <Icon size={18} />
              {sidebarExpanded && <span className="text-sm font-semibold">{label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom: user + settings */}
        <div className="px-2 pb-4 border-t border-slate-800 pt-3 space-y-1">
          {sidebarExpanded && (
            <div className="flex items-center gap-2.5 px-3 py-2">
              <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                {firstName[0]?.toUpperCase() ?? 'U'}
              </div>
              <span className="text-slate-300 text-sm font-semibold truncate">{firstName}</span>
            </div>
          )}
          <button
            onClick={() => setSettingsOpen(true)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all',
              !sidebarExpanded && 'justify-center'
            )}
            title={!sidebarExpanded ? 'Settings' : undefined}
          >
            <Settings size={18} />
            {sidebarExpanded && <span className="text-sm font-semibold">Settings</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-14 flex items-center px-6 border-b border-stone-200 bg-white shrink-0 gap-4">
          <h1 className="text-base font-bold text-stone-900 capitalize">
            {TABS.find((t) => t.id === tab)?.label}
          </h1>
          <div className="ml-auto">
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors text-xs font-semibold text-stone-500"
            >
              <span>⌘K</span>
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait" custom={tabDirection}>
            <motion.div
              key={tab}
              custom={tabDirection}
              variants={{
                enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
                center: { opacity: 1, x: 0 },
                exit: (dir: number) => ({ opacity: 0, x: -dir * 24 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute inset-0 flex flex-col"
            >
              <ErrorBoundary>
                {pages[tab]}
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Global modals */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <WelcomeModal open={showWelcome} onClose={() => setShowWelcome(false)} />
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNavigate={(t) => navigateToTab(t as Tab)}
        onOpenSettings={() => setSettingsOpen(true)}
        onAddBlock={() => {}}
      />

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#1c1917',
            color: '#fafaf9',
            fontSize: '13px',
            fontWeight: 600,
          },
        }}
      />
    </div>
  );
}
