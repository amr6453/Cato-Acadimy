import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Info, Trophy, Layout, Settings, Share2, AlertCircle } from 'lucide-react';
import VideoPlayer from '../components/courses/VideoPlayer';
import CurriculumSidebar from '../components/courses/CurriculumSidebar';
import api from '../services/api';
import Button from '../components/ui/Button';
import ReviewSection from '../components/course/ReviewSection';

const LearningPage = () => {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const currentLessonId = parseInt(searchParams.get('lesson'));

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLearningData = async () => {
            try {
                // 1. Check enrollment and get course data
                // We'll use the public endpoint for now, but in a real app,
                // we'd probably have a specific endpoint for enrolled content.
                const courseRes = await api.get(`/api/public/courses/${slug}/`);
                setCourse(courseRes.data);

                // 2. Check if user is enrolled
                const myCoursesRes = await api.get('/api/my-courses/');
                const isEnrolled = myCoursesRes.data.some(c => c.slug === slug);
                
                if (!isEnrolled) {
                    setError('ACCESS_DENIED');
                    return;
                }

                // 3. Set initial lesson if none selected
                if (!searchParams.get('lesson')) {
                    const firstLesson = courseRes.data.sections?.[0]?.lessons?.[0];
                    if (firstLesson) {
                        setSearchParams({ lesson: firstLesson.id });
                    }
                }
            } catch (err) {
                console.error(err);
                setError('FETCH_ERROR');
            } finally {
                setLoading(false);
            }
        };
        fetchLearningData();
    }, [slug]);

    useEffect(() => {
        if (course && currentLessonId) {
            let found = null;
            course.sections.forEach(s => {
                const l = s.lessons.find(lesson => lesson.id === currentLessonId);
                if (l) found = l;
            });
            setActiveLesson(found);
        }
    }, [course, currentLessonId]);

    const handleLessonComplete = async () => {
        if (!activeLesson) return;
        try {
            await api.post(`/api/lessons/${activeLesson.id}/complete/`);
            
            // Re-fetch course to update completion status in sidebar
            const res = await api.get(`/api/public/courses/${slug}/`);
            setCourse(res.data);
            
            // Logic for autoplaying next lesson
            playNextLesson(res.data);
        } catch (err) {
            console.error("Failed to mark lesson as complete", err);
        }
    };

    const playNextLesson = (latestCourse) => {
        let allLessons = [];
        latestCourse.sections.forEach(s => {
            allLessons = [...allLessons, ...s.lessons];
        });
        
        const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
        if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
            setSearchParams({ lesson: allLessons[currentIndex + 1].id });
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-dark-bg">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Entering Classroom...</p>
        </div>
    );

    if (error === 'ACCESS_DENIED') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-dark-bg p-6 text-center">
            <div className="w-24 h-24 bg-red-50 dark:bg-red-500/10 rounded-[40px] flex items-center justify-center text-red-500 mb-8 border border-red-100 dark:border-red-500/20">
                <AlertCircle size={48} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 italic tracking-tight uppercase">Access Denied</h1>
            <p className="text-slate-500 dark:text-white/40 max-w-md mb-10 font-medium leading-relaxed">
                You are not enrolled in this course. Please purchase the course to access the learning area and start your journey.
            </p>
            <Button variant="primary" size="lg" onClick={() => navigate(`/course/${slug}`)}>
                Back to Course Details
            </Button>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-500 overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                
                {/* Learning Header */}
                <header className="h-20 flex-shrink-0 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-8 z-20">
                    <div className="flex items-center gap-6 overflow-hidden">
                        <button 
                            onClick={() => navigate(`/course/${slug}`)}
                            className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-primary transition-all border border-slate-100 dark:border-white/10"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Watching now</span>
                            <h2 className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">
                                {activeLesson?.title || 'Selecting lesson...'}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <Trophy size={14} className="text-emerald-500" />
                            <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">
                                {course?.completion_percentage || 0}% Done
                            </span>
                        </div>
                        <div className="w-px h-8 bg-slate-100 dark:bg-white/5 mx-2" />
                        <button className="p-3 text-slate-400 hover:text-primary transition-colors">
                            <Settings size={20} />
                        </button>
                        <button className="p-3 text-slate-400 hover:text-primary transition-colors">
                            <Share2 size={20} />
                        </button>
                    </div>
                </header>

                {/* Player & Info Area */}
                <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-dark-bg">
                    <div className="max-w-6xl mx-auto p-8 sm:p-12">
                        
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeLesson?.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-12"
                            >
                                {activeLesson ? (
                                    activeLesson.hls_playlist || activeLesson.video_file ? (
                                        <VideoPlayer 
                                            src={activeLesson.hls_playlist 
                                                ? `http://127.0.0.1:8000/media/${activeLesson.hls_playlist}`
                                                : activeLesson.video_file}
                                            onEnded={handleLessonComplete}
                                            lessonId={activeLesson.id}
                                        />
                                    ) : (
                                        <div className="aspect-video bg-white dark:bg-dark-card rounded-[40px] flex items-center justify-center border border-slate-100 dark:border-white/5">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                                                    <AlertCircle size={32} />
                                                </div>
                                                <div className="text-slate-500 dark:text-white/40 font-black italic tracking-widest uppercase text-center">
                                                    No media available for this lesson.<br/>
                                                    <span className="text-[10px] font-bold opacity-50">Please add or re-upload the lesson content</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="aspect-video bg-white dark:bg-dark-card rounded-[40px] flex items-center justify-center animate-pulse border border-slate-100 dark:border-white/5">
                                        <div className="text-slate-300 dark:text-white/10 font-black italic tracking-widest uppercase">Loading Media...</div>
                                    </div>
                                )}

                                {/* Lesson Metadata */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                    <div className="lg:col-span-2 space-y-8">
                                        <div className="bg-white dark:bg-dark-card rounded-[40px] p-10 border border-slate-100 dark:border-white/5 premium-shadow">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                                                    About this lesson
                                                </div>
                                            </div>
                                            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight uppercase">
                                                {activeLesson?.title}
                                            </h1>
                                            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                                {activeLesson?.description || "In this lesson, we dive deep into the core concepts of the module. Follow along and practice the techniques shown in the video."}
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-dark-card rounded-[40px] p-10 border border-slate-100 dark:border-white/5 premium-shadow">
                                            <ReviewSection courseId={course.id} isEnrolled={true} />
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="bg-white dark:bg-dark-card rounded-[40px] p-8 border border-slate-100 dark:border-white/5 premium-shadow">
                                            <h4 className="text-xs font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.2em] mb-6">Resource files</h4>
                                            <div className="space-y-4">
                                                <p className="text-slate-400 dark:text-slate-500 text-xs font-bold italic">No downloadable resources for this lesson.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            {/* Curriculum Sidebar - Fixed Right */}
            <aside className="w-[380px] flex-shrink-0 border-l border-slate-100 dark:border-white/5 lg:block hidden">
                <CurriculumSidebar 
                    sections={course?.sections || []}
                    currentLessonId={currentLessonId}
                    onLessonSelect={(id) => setSearchParams({ lesson: id })}
                />
            </aside>
        </div>
    );
};

export default LearningPage;
