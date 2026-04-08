import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Clock, 
  Users, 
  CheckCircle2, 
  Globe, 
  ShieldCheck, 
  User,
  ArrowRight,
  Loader2,
  Play,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import CurriculumAccordion from '../components/courses/CurriculumAccordion';
import ReviewSection from '../components/course/ReviewSection';
import SEO from '../components/common/SEO';

const CourseDetailPage = () => {
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const { slug } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const response = await api.get(`/api/public/courses/${slug}/`);
                setCourse(response.data);

                // Check enrollment if authenticated
                if (isAuthenticated) {
                    try {
                        const myCoursesRes = await api.get('/api/my-courses/');
                        setIsEnrolled(myCoursesRes.data.some(c => c.slug === slug));
                    } catch (e) {
                        setIsEnrolled(false);
                    }
                }

            } catch (err) {
                setError('Course not found');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseData();
    }, [slug, isAuthenticated]);

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to enroll in this course');
            navigate('/login');
            return;
        }

        setEnrolling(true);
        try {
            await api.post('/api/enroll/', { course: course.id });
            toast.success('Successfully enrolled!');
            navigate(`/course/${course.slug}/learn`);
        } catch (err) {
            console.error('Enrollment error:', err);
            toast.error(err.response?.data?.error || 'Enrollment failed');
        } finally {
            setEnrolling(false);
        }
    };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-slate-400 dark:text-slate-500 font-bold animate-pulse">Loading course magic...</p>
    </div>
  );

  if (error || !course) return (
    <div className="text-center py-20">
      <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Oops! {error}</h2>
      <Button variant="primary" as={Link} to="/">Back to Catalog</Button>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-20"
    >
      <SEO
        title={course?.title || 'Course Details'}
        description={course?.description || 'Learn more about this course on Cato Academy.'}
        ogImage={course?.thumbnail}
      />
      {/* -- Header Section -- */}
      <div className="relative rounded-[40px] bg-white dark:bg-dark-bg p-8 sm:p-16 overflow-hidden mb-12 premium-shadow border border-slate-100 dark:border-white/5 transition-colors duration-300">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[120px]" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/30">
                {course.category_title || 'Expert Course'}
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-full">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-[11px] font-black text-slate-600 dark:text-white/80">{course.average_rating || 0} Rating</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
              {course.title}
            </h1>
            
            <p className="text-slate-500 dark:text-white/40 text-lg font-medium mb-10 leading-relaxed line-clamp-3">
              {course.description}
            </p>

            <div className="flex flex-wrap gap-8 items-center pt-4 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                  <User size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">Instructor</div>
                  <div className="text-slate-900 dark:text-white font-bold">{course.instructor_name}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                 <div className="text-center">
                    <div className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest mb-1">Students</div>
                    <div className="text-slate-900 dark:text-white font-black text-lg">{course.total_enrollments}</div>
                 </div>
                 <div className="w-px h-8 bg-slate-100 dark:bg-white/5" />
                 <div className="text-center">
                    <div className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest mb-1">Language</div>
                    <div className="text-slate-900 dark:text-white font-black text-lg">English</div>
                 </div>
              </div>
            </div>
          </div>

          <div className="lg:block">
            <Card className="bg-white dark:bg-dark-card p-2 rounded-[32px] overflow-hidden shadow-2xl scale-105 border-white/5">
               <div className="relative aspect-video rounded-3xl overflow-hidden group">
                  <img src={course.thumbnail} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                     <button className="w-20 h-20 bg-primary hover:bg-primary-hover rounded-full flex items-center justify-center text-white premium-shadow transition-all hover:scale-110">
                        <Play size={32} className="ml-1 fill-white" />
                     </button>
                  </div>
               </div>
               <div className="p-8">
                   <div className="flex items-center justify-between mb-8">
                      <div>
                         <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Access</div>
                         <div className="text-4xl font-black text-slate-900 dark:text-white">${course.price}</div>
                      </div>
                   </div>
                  <div className="space-y-3">
                     {isEnrolled ? (
                        <Button 
                            fullWidth 
                            variant="primary" 
                            size="lg" 
                            className="h-16 text-lg shadow-xl shadow-primary/20"
                            onClick={() => navigate(`/course/${course.slug}/learn`)}
                        >
                            Resume Learning
                        </Button>
                     ) : (
                        <Button 
                            fullWidth 
                            variant="primary" 
                            size="lg" 
                            className="h-16 text-lg shadow-xl shadow-primary/20"
                            onClick={handleEnroll}
                            loading={enrolling}
                        >
                            {course.price === 0 ? 'Enroll Now (Free)' : `Buy Now ($${course.price})`}
                        </Button>
                     )}
                     <Button fullWidth variant="glass" size="lg" className="h-16 border-slate-100 dark:border-white/10">Add to Wishlist</Button>
                  </div>
                  <p className="mt-6 text-center text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                     30-Day Money-Back Guarantee
                  </p>
               </div>
            </Card>
          </div>
        </div>
      </div>

      {/* -- Content Grid -- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Whats included */}
          <section>
             <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <div className="w-2 h-8 bg-primary rounded-full" />
                What you'll learn
             </h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(course.learning_outcomes?.split('\n') || [
                  'Master the core concepts of the subject',
                  'Build real-world projects from scratch',
                  'Advanced techniques and best practices',
                  'Problem solving and professional workflow'
                ]).filter(item => item.trim()).map((item, i) => (
                  <div key={i} className="flex gap-3 p-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl">
                     <CheckCircle2 className="text-primary flex-shrink-0" size={20} />
                     <span className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-snug">{item}</span>
                  </div>
                ))}
             </div>
          </section>

          {/* Curriculum */}
          <section>
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  Course Content
                </h2>
                <div className="text-sm font-bold text-slate-400 dark:text-slate-500">
                   {course.sections?.length || 0} Sections • {course.total_lessons || 0} Lessons
                </div>
             </div>
             <CurriculumAccordion sections={course.sections} />
          </section>

          {/* Description */}
          <section>
             <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <div className="w-2 h-8 bg-primary rounded-full" />
                Description
             </h2>
             <div className="prose prose-slate dark:prose-invert max-w-none text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {course.description}
             </div>
          </section>

          {/* Reviews */}
          <section id="reviews">
             <ReviewSection courseId={course.id} isEnrolled={isEnrolled} />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
           <Card className="bg-slate-50 dark:bg-white/5 border-slate-200/50 dark:border-white/5 p-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">This course includes:</h3>
              <ul className="space-y-4">
                 {(course.course_includes?.split('\n') || [
                   '24 hours on-demand video',
                   '12 downloadable resources',
                   'Full lifetime access',
                   'Certificate of completion'
                 ]).filter(item => item.trim()).map((item, i) => (
                   <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-bold text-sm">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 shadow-sm flex items-center justify-center text-primary border border-slate-100 dark:border-white/5">
                         {item.toLowerCase().includes('video') ? <Play size={16} /> : <FileText size={16} />}
                      </div>
                      {item}
                   </li>
                 ))}
              </ul>
           </Card>

           <Card padding="p-8" className="premium-shadow bg-white dark:bg-dark-card border-white/5">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Instructor</h3>
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white premium-shadow">
                    <User size={32} />
                 </div>
                 <div>
                    <h4 className="font-black text-slate-900 dark:text-white">{course.instructor_name}</h4>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">Premium Instructor</p>
                 </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6">
                 Passionate educator with years of experience in the field. Helping students reach their full potential through practical, project-based learning.
              </p>
              <Button variant="outline" fullWidth>View Profile</Button>
           </Card>
        </aside>
     </div>
  </motion.div>
  );
};

export default CourseDetailPage;
