import React, { useState, useEffect } from 'react';
import './index.css'; // Tailwind Directives
import { JUDY_SETTINGS } from './config/judyConfig';
import { LocalOrb } from './components/LocalOrb';
import { useLocalVoice } from './hooks/useLocalVoice';

function App() {
  const [isSecure, setIsSecure] = useState(false);
  
  // Use the Local Voice Hook (Seven System Logic + Antigravity Tuning)
  const { state, transcript, reply, isActive, toggle, location, volume, voiceMode, brainMode } = useLocalVoice(); 

  // --- SECURITY PROTOCOL (Password Check) ---
  const checkPassword = () => {
    const input = prompt("🔐 SECURITY CLEARANCE REQUIRED\nEnter Access Code:");
    if (input === JUDY_SETTINGS.SECURITY_CODE) {
      setIsSecure(true);
    } else {
      alert("❌ ACCESS DENIED.");
    }
  };

  const triggerSecurityAlert = () => {
      // Silent alert or just console to avoid playback issues
      console.warn("SECURITY BREECH");
  };

  useEffect(() => {
    // Disable Right Click & DevTools (Seven Standard)
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || 
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        // triggerSecurityAlert();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-mono">
      
      {/* HEADER */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-xs tracking-[0.2em] text-red-600">LIVE // {location}</span>
        </div>
        <div className="text-xs text-gray-600 tracking-widest">
           SEVEN.VOICE.OS.v7
        </div>
      </header>

      {/* CORE ORB INTERFACE (Loaded from components) */}
      <LocalOrb 
        state={state}
        transcript={transcript}
        reply={reply}
        isActive={isActive} 
        onToggle={toggle}
        location={location}
        volume={volume}
        voiceMode={voiceMode}
        brainMode={brainMode}
      />

      {/* TRANSCRIPT AREA */}
      <div className="absolute bottom-32 w-full text-center px-4 z-10">
        <p className="text-gray-500 text-sm mb-2 h-6">{state === "listening" ? "Listening..." : (state === "thinking" ? "Thinking..." : "")}</p>
        <p className="text-xl md:text-2xl font-light text-white max-w-4xl mx-auto leading-relaxed" dir="auto">
          {reply || transcript || "..."}
        </p>
      </div>

      {/* NAVIGATION (Briefcase) */}
      <div className="absolute bottom-0 w-full p-6 flex justify-center z-20">
        <button 
           onClick={checkPassword}
           className="px-8 py-3 bg-gray-900/50 border border-gray-700 text-gray-400 text-xs tracking-[0.3em] hover:bg-red-900/20 hover:text-red-500 hover:border-red-800 transition-all duration-500 uppercase rounded-sm"
        >
          {isSecure ? "ACCESS GRANTED" : "OPEN MISSIONS"}
        </button>
      </div>

       {/* BACKGROUND GRID */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.5)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

      {/* HIDDEN SECURE AREA */}
      {isSecure && (
        <div className="absolute inset-0 bg-black/95 z-50 flex items-center justify-center p-10">
           <div className="max-w-4xl w-full border border-gray-800 p-8">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl text-white tracking-widest">CLASSIFIED MISSIONS</h2>
                 <button onClick={() => setIsSecure(false)} className="text-red-500 text-xl">×</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Mission 1 */}
                 <div className="p-6 border border-gray-800 hover:border-blue-500 transition-colors group cursor-pointer">
                    <h3 className="text-blue-500 text-lg mb-2 group-hover:underline">1. PROJECT: SULTAN</h3>
                    <p className="text-gray-500 text-sm">Deploy AI Concierge across 50 Giza Hotels.</p>
                 </div>
                 
                 {/* Mission 2 */}
                 <div className="p-6 border border-gray-800 hover:border-green-500 transition-colors group cursor-pointer">
                    <h3 className="text-green-500 text-lg mb-2 group-hover:underline">2. OPERATION: SCARAB</h3>
                    <p className="text-gray-500 text-sm">Activate Drone delivery network in Nazlet El-Semman.</p>
                 </div>

                   {/* Mission 3 */}
                   <div className="p-6 border border-gray-800 hover:border-yellow-500 transition-colors group cursor-pointer">
                    <h3 className="text-yellow-500 text-lg mb-2 group-hover:underline">3. PROTOCOL: 777</h3>
                    <p className="text-gray-500 text-sm">Unify Voice & Web into Single Organism.</p>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

export default App;