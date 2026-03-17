import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Play, Trophy, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StudentDashboardPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await api.get('/api/my-courses/');
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching my courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-bold text-white mb-2"
        >
          My Learning Dashboard
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400"
        >
          Track your progress and continue your educational journey.
        </motion.p>
      </header>

      {courses.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-card border border-white/5 rounded-3xl p-16 text-center"
        >
          <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="text-purple-500" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">No courses yet</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            You haven't enrolled in any courses yet. Start exploring our catalog to find your next favorite course!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-purple-500/20 transition-all transform hover:-translate-y-1"
          >
            <Search size={20} />
            Browse Catalog
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {courses.map((course) => (
            <motion.div
              key={course.id}
              variants={itemVariants}
              className="bg-dark-card border border-white/5 rounded-3xl overflow-hidden group hover:border-purple-500/30 transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={course.thumbnail || '/placeholder-course.jpg'} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/10">
                        {course.category_title}
                    </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 h-14 group-hover:text-purple-400 transition-colors">
                  {course.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                  <Clock size={16} />
                  <span>By {course.instructor_name}</span>
                </div>

                <div className="mt-auto space-y-4">
                  <div className="flex justify-between items-end mb-1 text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-purple-400 font-bold">{Math.round(course.completion_percentage)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${course.completion_percentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                    />
                  </div>

                  <button
                    onClick={() => navigate(`/course/${course.slug}/learn?lesson=${course.last_lesson_id}`)}
                    className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:bg-purple-600 group-hover:border-purple-600 transition-all duration-300 mt-4"
                  >
                    <Play size={18} fill="currentColor" />
                    Resume Learning
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default StudentDashboardPage;
