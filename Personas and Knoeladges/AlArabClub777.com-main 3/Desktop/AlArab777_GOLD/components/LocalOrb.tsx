import React from "react";
import type { LocalVoiceState } from "../hooks/useLocalVoice";

export function LocalOrb(props: {
  state?: LocalVoiceState;
  transcript?: string;
  reply?: string;
  error?: string | null;
  isActive?: boolean;
  onToggle?: () => void;
  location?: string;
  volume?: number;
  voiceMode?: "CLOUD" | "LOCAL";
  brainMode?: "GROQ" | "GEMINI" | "OFFLINE";
}) {
  const { 
      state = "idle", 
      transcript = "", 
      reply = "", 
      error = null, 
      isActive = false, 
      onToggle = () => {},
      location = "UNKNOWN",
      volume = 0,
      voiceMode = "LOCAL",
      brainMode = "OFFLINE"
  } = props;

  let agentName = "JUDY";
  if (location === "UAE") agentName = "NADINE";
  if (location === "EGYPT") agentName = "MALIQA";

  const isSpeaking = state === "speaking";
  const isThinking = state === "thinking";
  const isListening = state === "listening";
  const isError = state === "error";

  // COLOR PALETTE
  const color = isError ? "rgb(239, 68, 68)" : // Red
                isSpeaking ? "rgb(212, 175, 55)" : // Gold
                isThinking ? "rgb(6, 182, 212)" : // Cyan
                isListening ? "rgb(212, 175, 55)" : // Gold (Listening)
                "rgb(100, 100, 100)"; // Grey (Idle)

  return (
    <div className="orbWrap w-full h-full flex flex-col items-center justify-center bg-black text-white relative overflow-hidden font-mono">
      
      {/* 1. PYRAMID STAGE */}
      <div className="relative w-full max-w-2xl h-[60vh] flex items-center justify-center">
        
        {/* Background Aura */}
        <div className={`absolute w-[500px] h-[500px] rounded-full blur-[100px] transition-all duration-1000 opacity-20 pointer-events-none`}
             style={{ background: color }}></div>

        {/* 2. THE PYRAMID (Clickable) */}
        <button 
            onClick={onToggle}
            className={`relative group transition-all duration-75 transform focus:outline-none
                ${isActive ? '' : 'scale-95 grayscale opacity-50'}
            `}
            style={{ 
                transform: isActive ? `scale(${1 + (volume / 100)})` : 'scale(0.95)' 
            }}
        >
            {/* PYRAMID SHAPE */}
            <div className={`w-64 h-64 transition-all duration-500`}
                 style={{
                     clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                     background: `
                        radial-gradient(circle at 50% 30%, ${color}, transparent 60%),
                        repeating-linear-gradient(transparent, transparent 4px, rgba(0,0,0,0.5) 5px),
                        repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.5) 5px),
                        linear-gradient(to bottom, #000, #222)
                     `,
                     backgroundSize: '100% 100%, 10px 10px, 10px 10px, 100% 100%',
                     boxShadow: `0 0 50px ${color}`
                 }}
            >
                {/* Dotted Overlay (The Matrix) */}
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[size:10px_10px] opacity-30"></div>
                
                {/* Inner Glow / Eye */}
                <div className={`absolute top-[30%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full blur-md transition-all duration-300
                    ${isSpeaking ? 'bg-white opacity-80 scale-150' : ''}
                    ${isThinking ? 'bg-cyan-400 opacity-60 animate-pulse' : ''}
                    ${isListening ? 'bg-gold opacity-40' : ''}
                    ${isError ? 'bg-red-600 opacity-100' : ''}
                    ${!isActive ? 'opacity-0' : ''}
                `} />
            </div>

            {/* Reflection / Base */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-48 h-12 bg-black/50 blur-xl rounded-[100%] scale-x-150 opacity-50"></div>
        </button>

        {/* 3. STATUS LINES (Projecting out) */}
        <div className="absolute top-6 right-6 font-mono text-xs text-green-500/50 tracking-[0.2em]">
          JUDY OS v7 // SOVEREIGN
        </div>
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
             {/* Left Line */}
             <div className={`absolute left-0 top-1/2 w-[30%] h-[1px] bg-gradient-to-r from-transparent to-${isError ? 'red-500' : 'gray-700'} opacity-50`}></div>
             {/* Right Line */}
             <div className={`absolute right-0 top-1/2 w-[30%] h-[1px] bg-gradient-to-l from-transparent to-${isError ? 'red-500' : 'gray-700'} opacity-50`}></div>
        </div>

      </div>

      {/* 4. DATA HUD (Bottom) */}
      <div className="absolute bottom-10 w-full px-6 flex flex-col items-center gap-2 z-10">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] text-gray-500 uppercase">
              <span className={isActive ? "text-green-500" : "text-red-500"}>● SYSTEM {isActive ? "ONLINE" : "OFFLINE"}</span>
              <span>//</span>
              <span className={isSpeaking ? "text-gold" : "text-gray-500"}>{agentName}</span>
          </div>

          {/* VISIBLE ERROR CONSOLE */}
          {error && (
              <div className="text-red-500 text-xs tracking-widest bg-red-900/20 px-4 py-2 border border-red-900 animate-pulse font-bold">
                  ⚠️ ERROR: {error}
              </div>
          )}
          
          <div className="text-center max-w-lg w-full">
            <p className="text-gray-400 text-xs h-6 truncate font-sans">{transcript || "Listening for input..."}</p>
          </div>
          
          {/* 4. AUDIO METERS (IN / OUT) */}
          <div className="absolute bottom-12 w-full flex justify-center gap-8 font-mono text-[9px] text-gray-500 tracking-widest opacity-80">
              <div className="flex flex-col items-center gap-1">
                  <span>MIC IN</span>
                  <div className="w-16 h-1 bg-gray-800 rounded overflow-hidden">
                      <div className="h-full bg-green-500 transition-all duration-75" style={{ width: `${Math.min(100, volume)}%` }} />
                  </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                  <span>AI OUT</span>
                  <div className="w-16 h-1 bg-gray-800 rounded overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-75" style={{ width: state === 'speaking' ? '100%' : '0%' }} />
                  </div>
              </div>
          </div>
          
          {/* DEBUG INFO */}
          <div className="text-[9px] font-mono mt-2 flex gap-4 text-gray-500 items-center justify-center">
             <span>🧠 {brainMode}</span>
             <span>🗣️ {voiceMode}</span>
             <span>📍 {location}</span>
             
             {/* MANUAL TEST TRIGGER */}
             <button 
                onClick={(e) => {
                    e.stopPropagation();
                    console.log("FORCE TEST CLOUD");
                    // We can't easily call speak here without passing it down, 
                    // relying on the user to just speak or we can add a simple prop later.
                    // For now, let's just show the status clearly.
                }}
                className="hover:text-white"
             >
                [?]
             </button>
             {/* MANUAL TEST CLOUD TRIGGER */}
             <button 
                onClick={(e) => {
                    e.stopPropagation();
                    console.log("FORCE TEST CLOUD");
                    // We can't easily call speak here without passing it down, 
                    // relying on the user to just speak or we can add a simple prop later.
                    // For now, let's just show the status clearly.
                }}
                className="hover:text-white"
             >
                [TEST CLOUD]
             </button>
          </div>
      </div>

    </div>
  );
}
