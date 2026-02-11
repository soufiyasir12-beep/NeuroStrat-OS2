import React from 'react';
import { CheckSquare, Mail, Map, Command, Aperture } from 'lucide-react';
import { View } from '../../types';
import { motion } from 'framer-motion';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: View.ZEN_TODO, icon: CheckSquare, label: 'Tasks' },
    { id: View.EMAIL_HUB, icon: Mail, label: 'Mail' },
    { id: View.WHITEBOARD, icon: Map, label: 'Canvas' },
  ];

  return (
    <aside className="w-20 md:w-64 bg-surface/50 backdrop-blur-xl border-r border-white/10 h-full flex flex-col justify-between py-8 z-50">
      <div>
        <div className="px-6 mb-12 flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]">
             <Aperture className="w-5 h-5 animate-spin-slow" />
          </div>
          <span className="hidden md:block font-serif font-bold text-lg text-white tracking-tighter">Neurostrat</span>
        </div>

        <nav className="flex flex-col gap-2 px-3">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`group relative flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 ease-out border border-transparent ${
                  isActive 
                    ? 'bg-white/10 text-white border-white/10 shadow-glow' 
                    : 'text-text-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="hidden md:block font-medium text-sm tracking-wide">{item.label}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white shadow-[0_0_10px_white]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-6 hidden md:block">
        <div className="p-4 rounded-lg bg-surface2/30 border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_lime]"></div>
            <p className="text-[10px] text-white font-medium uppercase tracking-widest">System Online</p>
          </div>
          <p className="text-[10px] text-text-muted">Local Encryption Active</p>
        </div>
      </div>
    </aside>
  );
};