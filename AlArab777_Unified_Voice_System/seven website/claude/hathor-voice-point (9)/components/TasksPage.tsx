
import React from 'react';
import { CheckCircle2, Circle, Trophy, Terminal, Palette, Zap, Layers, Globe, Code2 } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  icon: React.ReactNode;
}

export const TasksPage: React.FC = () => {
  const tasks: Task[] = [
    {
      id: 1,
      title: "Core System Initialization",
      description: "تأسيس بنية Judy OS وبروتوكولات الأمان 777.",
      status: 'completed',
      icon: <Terminal className="w-5 h-5" />
    },
    {
      id: 2,
      title: "Judy Voice Engineering",
      description: "ضبط الذكاء الاصطناعي على لهجة نزلة السمان، وتدريبه على خدمات الفندق العائلية والرحلات.",
      status: 'completed',
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: 3,
      title: "The Gold Interface",
      description: "واجهة الذهب الفاخرة التي تليق بنادي العرب.",
      status: 'completed',
      icon: <Palette className="w-5 h-5" />
    },
    {
      id: 4,
      title: "Service Knowledge Base",
      description: "إضافة: غرف عائلية، مساحة عمل، بازار، ورحلات شاملة.",
      status: 'completed',
      icon: <Layers className="w-5 h-5" />
    },
    {
      id: 5,
      title: "System Freeze",
      description: "تجميد الكود الصوتي لضمان الاستقرار (Motherboard Promise).",
      status: 'completed',
      icon: <Code2 className="w-5 h-5" />
    },
    {
      id: 6,
      title: "LIVE DEPLOYMENT",
      description: "النظام يعمل الآن أونلاين بالكامل. جاهز لاستقبال الزوار.",
      status: 'current',
      icon: <Globe className="w-5 h-5 animate-pulse text-green-400" />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-20 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-16">
        <h2 className="text-pharaonic-gold font-serif text-4xl font-bold tracking-[0.2em] uppercase mb-4">Final Status</h2>
        <div className="flex items-center justify-center gap-4 text-[10px] tracking-[0.5em] text-white/30 font-mono uppercase">
          <div className="w-12 h-[1px] bg-white/10" />
          SYSTEM IS ONLINE
          <div className="w-12 h-[1px] bg-white/10" />
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div 
            key={task.id}
            className={`relative group p-6 rounded-xl border transition-all duration-500 ${
              task.status === 'completed' 
                ? 'bg-pharaonic-gold/5 border-pharaonic-gold/20 opacity-80' 
                : task.status === 'current'
                ? 'bg-green-900/10 border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                : 'bg-white/5 border-white/10 opacity-40'
            }`}
          >
            <div className="flex items-start gap-6">
              <div className={`mt-1 p-3 rounded-lg ${
                task.status === 'completed' ? 'text-pharaonic-gold' : 
                task.status === 'current' ? 'text-green-400' : 'text-white/20'
              }`}>
                {task.icon}
              </div>
              
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`text-sm font-bold tracking-[0.1em] uppercase ${
                    task.status === 'completed' ? 'text-white/60 line-through' : 'text-white'
                  }`}>
                    {task.id}. {task.title}
                  </h3>
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-pharaonic-gold" />
                  ) : task.status === 'current' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono text-green-400 animate-pulse uppercase">LIVE NOW</span>
                      <Circle className="w-4 h-4 text-green-400 animate-ping" />
                    </div>
                  ) : (
                    <Circle className="w-4 h-4 text-white/20" />
                  )}
                </div>
                <p className="text-xs text-white/40 font-light leading-relaxed">
                  {task.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center">
        <div className="inline-block p-1 rounded-full bg-green-500/20 border border-green-500/30">
          <div className="bg-black px-10 py-4 rounded-full flex items-center gap-4 border border-white/5 shadow-2xl">
            <span className="text-[10px] font-mono tracking-widest text-green-400 uppercase">System Status:</span>
            <span className="text-[11px] font-bold tracking-widest text-white uppercase animate-pulse">ALL SYSTEMS GO</span>
          </div>
        </div>
      </div>
    </div>
  );
};