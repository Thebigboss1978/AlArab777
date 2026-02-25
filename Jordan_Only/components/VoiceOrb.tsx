import React from 'react';

export const VoiceOrb: React.FC<{ intensity: number; isActive: boolean }> = ({ intensity, isActive }) => {
  const scale = 1 + intensity * 0.5;
  const opacity = 0.3 + intensity * 0.7;
  
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Outer Pulse */}
      {isActive && (
        <div 
          className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping"
          style={{ transform: `scale(${scale * 1.2})` }}
        />
      )}
      
      {/* Main Orb */}
      <div 
        className={`relative w-32 h-32 rounded-full transition-all duration-300 flex items-center justify-center
          ${isActive ? 'bg-purple-600 shadow-[0_0_50px_rgba(168,85,247,0.5)]' : 'bg-white/5 border border-white/10'}
        `}
        style={{ transform: `scale(${scale})`, opacity }}
      >
        <i className={`fas fa-microphone text-2xl ${isActive ? 'text-white' : 'text-white/20'} animate-pulse`} />
      </div>
      
      {/* Orbiting particles (Cyberpunk style) */}
      <div className="absolute inset-0 border border-purple-500/10 rounded-full animate-[spin_10s_linear_infinite]" />
      <div className="absolute inset-2 border border-purple-400/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
    </div>
  );
};
