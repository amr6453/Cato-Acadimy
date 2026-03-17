import { ChevronDown, PlayCircle, FileText, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const CurriculumAccordion = ({ sections, isEnrolled = false }) => {
  const [openSections, setOpenSections] = useState([0]); // First one open by default

  const toggleSection = (index) => {
    setOpenSections(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  if (!sections || sections.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <p className="text-slate-400 font-medium">Curriculum coming soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section, idx) => {
        const isOpen = openSections.includes(idx);
        return (
          <div key={section.id} className="border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-dark-card premium-shadow transition-colors">
            <button
              onClick={() => toggleSection(idx)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`
                  w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-colors
                  ${isOpen ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/20'}
                `}>
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white leading-tight">{section.title}</h4>
                  <p className="text-[11px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-wider mt-1">
                    {section.lessons?.length || 0} Lessons
                  </p>
                </div>
              </div>
              <ChevronDown 
                size={20} 
                className={`text-slate-300 dark:text-white/10 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} 
              />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="px-5 pb-5 pt-0 space-y-1">
                    {section.lessons?.map((lesson, lIdx) => (
                      <div 
                        key={lesson.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 group transition-colors cursor-default"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/5 group-hover:border-primary/30 transition-colors">
                            {lesson.video_thumbnail ? (
                              <img src={lesson.video_thumbnail} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <PlayCircle size={16} className="text-slate-400 dark:text-white/20 group-hover:text-primary transition-colors" />
                            )}
                          </div>
                          <span className="text-[14px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            {lesson.title}
                          </span>
                        </div>
                        {!isEnrolled && (
                           <Lock size={14} className="text-slate-200 dark:text-white/5" />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default CurriculumAccordion;
