import { Star, Clock, Users, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';

const CourseCard = ({ course }) => {
  const {
    title,
    slug,
    instructor_name,
    thumbnail,
    price,
    average_rating,
    total_enrollments,
  } = course;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card hover padding="p-0" className="flex flex-col h-full overflow-hidden group border-slate-100/60">
        {/* -- Thumbnail -- */}
        <Link to={`/course/${slug}`} className="relative block aspect-video overflow-hidden">
          <img
            src={thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transform scale-50 group-hover:scale-100 transition-transform duration-500">
               <PlayCircle className="text-white fill-white/20" size={28} />
            </div>
          </div>
          {price === "0.00" && (
             <div className="absolute top-4 left-4 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-lg premium-shadow">
               Free
             </div>
          )}
        </Link>

        {/* -- Content -- */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[1px] rounded-md">
              {course.category_title || 'General'}
            </span>
            <div className="flex items-center gap-1 ml-auto">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{average_rating || '5.0'}</span>
            </div>
          </div>

          <Link to={`/course/${slug}`}>
            <h3 className="text-[17px] font-black text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
          </Link>

          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
            by <span className="text-slate-900 dark:text-white font-bold">{instructor_name || 'Expert Instructor'}</span>
          </p>

          <div className="mt-auto pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span className="text-[11px] font-bold">{total_enrollments || 0}</span>
              </div>
            </div>
            
            <div className="text-lg font-black text-slate-900 dark:text-white">
               {price === "0.00" ? 'Free' : `$${price}`}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
