
import React, { useEffect, useState } from 'react';
import { useLocalVoice, AgentState } from '../hooks/useLocalVoice';
import { Mic, MicOff, BrainCircuit, Volume2 } from 'lucide-react';

export const LocalOrb: React.FC = () => {
  const { state, transcript, response, connect, disconnect } = useLocalVoice();
  const [showTranscript, setShowTranscript] = useState(false);

  // Auto-connect on mount (optional, or wait for user click)
  useEffect(() => {
    // connect(); // Uncomment to auto-start
  }, [connect]);

  // Visual State Helpers
  const isListening = state === AgentState.LISTENING;
  const isThinking = state === AgentState.THINKING;
  const isSpeaking = state === AgentState.SPEAKING;
  const isDisconnected = state === AgentState.DISCONNECTED;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden">
      
      {/* 1. THE ORB VISUALIZER */}
      <button 
        onClick={isDisconnected ? connect : disconnect}
        className={`
          relative w-64 h-64 rounded-full flex items-center justify-center transition-all duration-500
          ${isListening ? 'bg-black border-4 border-pharaonic-gold/50 shadow-[0_0_50px_rgba(212,175,55,0.3)] scale-100' : ''}
          ${isThinking ? 'bg-black border-4 border-cyan-500/50 shadow-[0_0_80px_rgba(6,182,212,0.5)] scale-90 animate-pulse' : ''}
          ${isSpeaking ? 'bg-pharaonic-gold/10 border-4 border-pharaonic-gold shadow-[0_0_100px_rgba(212,175,55,0.8)] scale-110' : ''}
          ${isDisconnected ? 'bg-gray-900 border-2 border-gray-700 opacity-50 grayscale' : ''}
        `}
      >
        {/* Inner Core Icon */}
        <div className="z-10 text-white transition-all duration-300">
           {isListening && <Mic className="w-12 h-12 text-pharaonic-gold animate-bounce-slow" />}
           {isThinking && <BrainCircuit className="w-16 h-16 text-cyan-400 animate-spin-slow" />}
           {isSpeaking && <Volume2 className="w-16 h-16 text-pharaonic-gold animate-ping-slow" />}
           {isDisconnected && <MicOff className="w-10 h-10 text-gray-500" />}
        </div>

        {/* Outer Ripple Effects (CSS) */}
        {isSpeaking && (
          <>
            <div className="absolute inset-0 rounded-full border border-pharaonic-gold opacity-50 animate-ping" />
            <div className="absolute inset-0 rounded-full border border-pharaonic-gold opacity-30 animate-ping delay-150" />
            <div className="absolute inset-0 rounded-full border border-pharaonic-gold opacity-10 animate-ping delay-300" />
          </>
        )}
      </button>

      {/* 2. STATUS TEXT */}
      <div className="mt-12 text-center z-20">
        <h2 className="text-xl font-bold tracking-[0.5em] text-pharaonic-gold/80 uppercase mb-2">
          {state}
        </h2>
        {isDisconnected && (
          <p className="text-xs text-gray-500 tracking-widest">TAP ORB TO ACTIVATE SYSTEM</p>
        )}
      </div>

      {/* 3. CAPTIONS / TRANSCRIPT (Optional Toggle) */}
      <div className="absolute bottom-20 left-0 right-0 px-8 text-center pointer-events-none">
        {isSpeaking && (
          <p className="text-lg md:text-2xl font-light text-white/90 leading-relaxed animate-in fade-in slide-in-from-bottom-4">
            "{response}"
          </p>
        )}
        {isListening && transcript && (
           <p className="text-sm font-mono text-gray-400 mt-2">
             Listening: {transcript}
           </p>
        )}
      </div>

    </div>
  );
};
