import React from 'react';
import { Play, CheckCircle2, Lock, ChevronDown, FileText, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CurriculumSidebar = ({ sections, currentLessonId, onLessonSelect }) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-bg border-l border-slate-100 dark:border-white/5 shadow-2xl">
      <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-dark-card">
        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Course Content</h3>
        <p className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest mt-1">
          {sections.length} Sections • {sections.reduce((acc, s) => acc + s.lessons.length, 0)} Lessons
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {sections.map((section, sIdx) => (
          <div key={section.id} className="border-b border-slate-100 dark:border-white/5 last:border-0">
            {/* Section Header */}
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest leading-tight">
                Section {section.order}: {section.title}
              </span>
            </div>

            {/* Lessons List */}
            <div className="py-2">
              {section.lessons.map((lesson) => {
                const isActive = currentLessonId === lesson.id;
                const isCompleted = lesson.is_completed;
                
                let iconContent = <Play size={isActive ? 18 : 16} />;
                if (isCompleted) iconContent = <CheckCircle2 size={18} />;
                if (lesson.video_thumbnail) {
                   iconContent = <img src={lesson.video_thumbnail} className="w-full h-full object-cover rounded-xl" alt="" />;
                }

                return (
                  <button
                    key={lesson.id}
                    onClick={() => onLessonSelect(lesson.id)}
                    className={`w-full flex items-center gap-4 px-6 py-4 transition-all hover:bg-slate-50 dark:hover:bg-white/5 text-left group relative ${
                      isActive 
                        ? 'bg-primary/5 dark:bg-primary/10' 
                        : ''
                    }`}
                  >
                    {/* Active Indicator Bar */}
                    {isActive && (
                        <motion.div 
                            layoutId="activeLesson"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                        />
                    )}

                    {/* Lesson Icon / Status */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 overflow-hidden ${
                      isActive 
                        ? 'bg-primary text-white premium-shadow' 
                        : isCompleted
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-white dark:bg-white/5 text-slate-400 dark:text-white/20 border border-slate-100 dark:border-white/5'
                    }`}>
                      {iconContent}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold truncate transition-colors ${
                        isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {lesson.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 dark:text-white/20">
                          {lesson.lesson_type}
                        </span>
                        {isCompleted && (
                            <span className="text-[9px] uppercase font-black tracking-widest text-emerald-500/80">
                                Completed
                            </span>
                        )}
                      </div>
                    </div>

                    {/* Play Overlay for inactive lessons */}
                    {!isActive && !isCompleted && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play size={12} className="text-primary" />
                        </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurriculumSidebar;
