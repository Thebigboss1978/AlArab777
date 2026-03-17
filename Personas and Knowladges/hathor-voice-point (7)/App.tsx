
import React, { useState, useEffect } from 'react';
import { VoiceOrb } from './components/VoiceOrb';
import { TasksPage } from './components/TasksPage';
import { LayoutGrid, Mic, ListChecks, ShieldAlert } from 'lucide-react';

type View = 'voice' | 'tasks';

const App: React.FC = () => {
  const [view, setView] = useState<View>('voice');
  const [securityBreach, setSecurityBreach] = useState(false);

  // --- THE 777 SHIELD (SECURITY PROTOCOL) ---
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Disable Right Click
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        triggerSecurityAlert();
      }
    };

    const triggerSecurityAlert = () => {
      setSecurityBreach(true);
      console.clear();
      console.log("%c STOP! 777 SECURITY PROTOCOL ENGAGED.", "color: red; font-size: 50px; font-weight: bold;");
      console.log("This system is protected. Do not attempt to reverse engineer the Judy OS Core.");
      
      // Auto-reset after 3 seconds for UX, but warns the user
      setTimeout(() => setSecurityBreach(false), 3000);
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    // Use h-[100dvh] for mobile browsers to ignore the address bar area
    <div className="h-screen h-[100dvh] w-screen bg-black text-white relative font-sans selection:bg-pharaonic-gold selection:text-black overflow-hidden">
      
      {/* SECURITY OVERLAY */}
      {securityBreach && (
        <div className="fixed inset-0 z-[100000] bg-red-900/90 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
          <ShieldAlert className="w-24 h-24 text-white mb-4 animate-bounce" />
          <h1 className="text-4xl font-bold uppercase tracking-widest text-white">Access Denied</h1>
          <p className="text-xl font-mono mt-2 text-red-200">777 Security Shield Active</p>
          <p className="text-sm mt-8 text-white/50">Only Authorized Developers Allowed.</p>
        </div>
      )}

      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.05)_0%,_transparent_70%)] pointer-events-none" />
      
      {/* OS Shell Navigation - Minimalist & Transparent */}
      <nav className="absolute top-0 left-0 right-0 h-16 z-[10000] flex items-center justify-between px-6 md:px-12 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-pharaonic-gold flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.5)]">
            <LayoutGrid className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-[12px] font-bold tracking-[0.3em] uppercase text-white/90">Judy OS <span className="text-pharaonic-gold">v2.0</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-6 md:gap-8">
          <button 
            onClick={() => setView('voice')}
            className={`flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase transition-all duration-300 ${view === 'voice' ? 'text-pharaonic-gold scale-105' : 'text-white/40 hover:text-white'}`}
          >
            <Mic className={`w-3 h-3 ${view === 'voice' ? 'animate-pulse' : ''}`} />
            <span className="hidden md:inline">Voice</span>
          </button>
          <button 
            onClick={() => setView('tasks')}
            className={`flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase transition-all duration-300 ${view === 'tasks' ? 'text-pharaonic-gold scale-105' : 'text-white/40 hover:text-white'}`}
          >
            <ListChecks className="w-3 h-3" />
            <span className="hidden md:inline">Missions</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area - Full Screen Center */}
      <main className="h-full w-full relative">
        {view === 'voice' ? (
          <div className="h-full w-full flex flex-col items-center justify-center">
            <VoiceOrb mode="full" onToggleMode={() => {}} />
          </div>
        ) : (
          <div className="h-full w-full overflow-y-auto pt-20 pb-10 custom-scrollbar">
            <TasksPage />
          </div>
        )}
      </main>

      {/* OS Footer Decor - Subtle */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center pointer-events-none opacity-30 z-[999]">
        <p className="text-[8px] font-mono tracking-[0.5em] uppercase text-pharaonic-gold/50">Nazlet El-Semman</p>
      </div>
    </div>
  );
};

export default App;
