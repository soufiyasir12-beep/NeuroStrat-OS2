import React, { useState } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { ZenToDo } from './features/todo/ZenToDo';
import { EmailHub } from './features/email/EmailHub';
import { Whiteboard } from './features/whiteboard/Whiteboard';
import { View } from './types';
import { AnimatePresence, motion } from 'framer-motion';

export default function App() {
  const [currentView, setCurrentView] = useState<View>(View.ZEN_TODO);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-text font-sans selection:bg-white selection:text-black">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 relative overflow-hidden flex flex-col bg-gradient-to-br from-bg via-bg to-surface">
        <header className="p-8 pb-4 flex justify-between items-end border-b border-white/5">
            <div>
              <h1 className="font-serif text-3xl text-white font-normal tracking-tight">
                {currentView === View.ZEN_TODO && "Strategic Priorities"}
                {currentView === View.EMAIL_HUB && "Command Center"}
                {currentView === View.WHITEBOARD && "Infinite Canvas"}
              </h1>
              <p className="text-text-muted text-sm mt-1 font-light tracking-wide">
                {currentView === View.ZEN_TODO && "Execute with precision."}
                {currentView === View.EMAIL_HUB && "Communication protocols."}
                {currentView === View.WHITEBOARD && "Visualizing complex systems."}
              </p>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-text-muted opacity-50 font-bold hidden md:block">
               Neurostrat OS v2.0
            </div>
        </header>

        <div className="flex-1 relative p-6 pt-0 overflow-hidden">
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentView}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full w-full pt-6"
            >
              {currentView === View.ZEN_TODO && <ZenToDo />}
              {currentView === View.EMAIL_HUB && <EmailHub />}
              {currentView === View.WHITEBOARD && <Whiteboard />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}