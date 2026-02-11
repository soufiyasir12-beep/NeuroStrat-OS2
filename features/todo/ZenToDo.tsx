import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Task, Priority } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, ChevronRight, ChevronDown, Trash2, ArrowUpCircle, Filter, Circle, Disc } from 'lucide-react';

type SortOption = 'date' | 'priority';

export const ZenToDo: React.FC = () => {
  const [sortBy, setSortBy] = useState<SortOption>('priority');

  const tasks = useLiveQuery(() => 
    db.tasks
      .where('parentId')
      .equals(null as any)
      .or('parentId').equals('null')
      .toArray()
  );

  const addTask = async (title: string, priority: Priority) => {
    if (!title.trim()) return;
    await db.tasks.add({
      title,
      isCompleted: false,
      parentId: null,
      createdAt: new Date(),
      expanded: true,
      priority
    });
  };

  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    return [...tasks].sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder: Record<Priority, number> = { 'High': 3, 'Medium': 2, 'Low': 1 };
        const pDiff = priorityOrder[b.priority || 'Low'] - priorityOrder[a.priority || 'Low'];
        if (pDiff !== 0) return pDiff;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }, [tasks, sortBy]);

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 px-1">
         <h2 className="text-white text-lg font-light tracking-wide">Tasks</h2>
         <div className="flex items-center gap-2 text-xs font-medium text-text-muted bg-surface/50 border border-white/5 px-3 py-1.5 rounded-full backdrop-blur-md">
             <Filter size={12} />
             <span className="opacity-50 uppercase tracking-wider text-[10px]">Sort:</span>
             <button 
                onClick={() => setSortBy('priority')} 
                className={`hover:text-white transition-colors ${sortBy === 'priority' ? 'text-white font-bold' : ''}`}
             >
                Importance
             </button>
             <span className="opacity-20">|</span>
             <button 
                onClick={() => setSortBy('date')} 
                className={`hover:text-white transition-colors ${sortBy === 'date' ? 'text-white font-bold' : ''}`}
             >
                Time
             </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 no-scrollbar px-1">
        <AnimatePresence mode='popLayout'>
            {sortedTasks.map(task => (
                <TaskItem key={task.id} task={task} level={0} sortBy={sortBy} />
            ))}
        </AnimatePresence>
        <NewTaskInput onAdd={addTask} placeholder="Initialize new directive..." className="mt-6 opacity-60 hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

const TaskItem: React.FC<{ task: Task; level: number, sortBy: SortOption }> = ({ task, level, sortBy }) => {
  const subtasks = useLiveQuery(() => 
    db.tasks.where('parentId').equals(task.id!).toArray()
  , [task.id]);

  const toggleComplete = async () => {
    if (task.id) await db.tasks.update(task.id, { isCompleted: !task.isCompleted });
  };

  const toggleExpanded = async () => {
    if (task.id) await db.tasks.update(task.id, { expanded: !task.expanded });
  };

  const deleteSelf = async () => {
      if(task.id) await db.tasks.delete(task.id);
  }

  const addSubtask = async (title: string, priority: Priority) => {
    if (!title.trim() || !task.id) return;
    await db.tasks.add({
      title,
      isCompleted: false,
      parentId: task.id,
      createdAt: new Date(),
      expanded: true,
      priority
    });
    if (!task.expanded) {
        await db.tasks.update(task.id, { expanded: true });
    }
  };

  const isCompleted = task.isCompleted;

  const sortedSubtasks = useMemo(() => {
      if (!subtasks) return [];
      return [...subtasks].sort((a, b) => {
        if (sortBy === 'priority') {
            const priorityOrder: Record<Priority, number> = { 'High': 3, 'Medium': 2, 'Low': 1 };
            const pDiff = priorityOrder[b.priority || 'Low'] - priorityOrder[a.priority || 'Low'];
            if (pDiff !== 0) return pDiff;
        }
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }, [subtasks, sortBy]);

  const priorityColor = {
    'High': 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
    'Medium': 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]',
    'Low': 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]'
  }[task.priority || 'Medium'];

  const priorityLabel = task.priority || 'Medium';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`relative`}
      style={{ marginLeft: level > 0 ? '1.5rem' : '0' }}
    >
      <div className={`
        group flex items-center gap-4 py-4 px-5 my-2 rounded-lg transition-all duration-300 border
        ${isCompleted 
            ? 'bg-transparent border-transparent opacity-30' 
            : 'bg-surface2/40 border-white/5 hover:border-white/20 hover:bg-surface2/60 backdrop-blur-sm shadow-sm'
        }
      `}>
        {/* Expand Toggle */}
        <button 
            onClick={toggleExpanded}
            className={`text-text-muted hover:text-white transition-colors ${(!subtasks || subtasks.length === 0) ? 'invisible' : 'visible'}`}
        >
            {task.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Custom Checkbox */}
        <button
          onClick={toggleComplete}
          className={`
            w-5 h-5 rounded border flex items-center justify-center transition-all duration-300 shrink-0
            ${isCompleted ? 'bg-white border-white' : 'border-white/30 hover:border-white bg-transparent'}
          `}
        >
          {isCompleted && <Check size={12} className="text-black" />}
        </button>

        {/* Priority Indicator */}
        {!isCompleted && (
            <div className={`w-1.5 h-1.5 rounded-full ${priorityColor} shrink-0`} title={`Priority: ${priorityLabel}`} />
        )}

        {/* Title */}
        <span className={`
            flex-1 text-sm font-medium transition-all duration-500 font-sans tracking-wide
            ${isCompleted ? 'line-through text-text-muted' : 'text-white'}
        `}>
          {task.title}
        </span>
        
        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-3 transition-opacity">
            <span className="text-[9px] uppercase font-bold tracking-widest text-text-muted opacity-50">{priorityLabel}</span>
            <button onClick={deleteSelf} className="text-text-muted hover:text-red-400 transition-colors">
                <Trash2 size={14} />
            </button>
        </div>
      </div>

      {/* Nested Subtasks */}
      <AnimatePresence>
        {task.expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-l border-white/10 ml-8 pl-4"
          >
            {sortedSubtasks.map(sub => (
              <TaskItem key={sub.id} task={sub} level={level + 1} sortBy={sortBy} />
            ))}
            <div className="pl-5 py-3">
                <NewTaskInput onAdd={addSubtask} placeholder="Add sub-directive..." small />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const NewTaskInput = ({ onAdd, placeholder, className, small }: { onAdd: (t: string, p: Priority) => void, placeholder: string, className?: string, small?: boolean }) => {
    const [val, setVal] = useState('');
    const [priority, setPriority] = useState<Priority>('Medium');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(val, priority);
        setVal('');
        setPriority('Medium');
    }

    const cyclePriority = () => {
        const order: Priority[] = ['Low', 'Medium', 'High'];
        const currentIdx = order.indexOf(priority);
        setPriority(order[(currentIdx + 1) % 3]);
    }

    const priorityIndicator = {
        'High': 'text-red-500',
        'Medium': 'text-amber-400',
        'Low': 'text-blue-400'
    };

    return (
        <form onSubmit={handleSubmit} className={`flex items-center gap-3 group ${className}`}>
            <button 
                type="button" 
                onClick={cyclePriority}
                className={`transition-colors flex items-center justify-center ${priorityIndicator[priority]}`}
                title="Toggle Importance"
            >
                {small ? 
                    <div className={`w-1.5 h-1.5 rounded-full ${priority === 'High' ? 'bg-red-500 shadow-glow' : priority === 'Medium' ? 'bg-amber-400' : 'bg-blue-400'}`} /> 
                    : 
                    <Disc size={18} className="opacity-80 hover:opacity-100" />
                }
            </button>
            
            <div className="flex-1 relative border-b border-white/10 focus-within:border-white/50 transition-colors">
                <input 
                    value={val || ''}
                    onChange={e => setVal(e.target.value)}
                    placeholder={placeholder}
                    className={`bg-transparent focus:outline-none placeholder:text-text-muted/20 text-white w-full transition-all ${small ? 'text-xs py-1' : 'text-sm py-2'}`}
                />
                <button type="submit" disabled={!val.trim()} className="absolute right-0 top-1/2 -translate-y-1/2 text-white opacity-0 group-focus-within:opacity-100 transition-opacity disabled:opacity-0">
                    <Plus size={small ? 14 : 16} />
                </button>
            </div>
        </form>
    )
}