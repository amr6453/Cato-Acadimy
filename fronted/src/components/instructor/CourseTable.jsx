import React from 'react';
import { Edit2, Trash2, BarChart2, ExternalLink } from 'lucide-react';
import Button from '../ui/Button';

const StatusBadge = ({ status }) => {
  const styles = {
    PUBLISHED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    DRAFT: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    REVIEW: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    PROCESSING: 'bg-purple-500/10 text-purple-500 border-purple-500/20 animate-pulse',
  };

  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.DRAFT}`}>
      {status}
    </span>
  );
};

const CourseTable = ({ courses, onEdit, onDelete, onViewAnalytics }) => {
  if (courses.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50/50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No courses found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-4">
        <thead>
          <tr className="text-[11px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.2em]">
            <th className="px-6 pb-2">Course</th>
            <th className="px-6 pb-2 text-center">Enrolled</th>
            <th className="px-6 pb-2 text-center">Rating</th>
            <th className="px-6 pb-2 text-center">Video HLS</th>
            <th className="px-6 pb-2">Status</th>
            <th className="px-6 pb-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id} className="group">
              <td className="px-6 py-4 bg-white dark:bg-dark-card rounded-l-[24px] border-y border-l border-slate-100 dark:border-white/5 premium-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5">
                    <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[200px]">
                      {course.title}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {course.category?.title || 'Uncategorized'}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 bg-white dark:bg-dark-card border-y border-slate-100 dark:border-white/5 text-center">
                <span className="text-sm font-black text-slate-900 dark:text-white">{course.total_enrollments}</span>
              </td>
              <td className="px-6 py-4 bg-white dark:bg-dark-card border-y border-slate-100 dark:border-white/5 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-sm font-black text-slate-900 dark:text-white">{course.average_rating}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                </div>
              </td>
              <td className="px-6 py-4 bg-white dark:bg-dark-card border-y border-slate-100 dark:border-white/5 text-center">
                 {course.is_processing ? (
                   <StatusBadge status="PROCESSING" />
                 ) : (
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ready</span>
                 )}
              </td>
              <td className="px-6 py-4 bg-white dark:bg-dark-card border-y border-slate-100 dark:border-white/5">
                <StatusBadge status={course.status} />
              </td>
              <td className="px-6 py-4 bg-white dark:bg-dark-card rounded-r-[24px] border-y border-r border-slate-100 dark:border-white/5 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onViewAnalytics(course)}
                    className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                  >
                    <BarChart2 size={18} />
                  </button>
                  <button 
                    onClick={() => onEdit(course)}
                    className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(course.id)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseTable;
