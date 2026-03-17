import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  Users,
  TrendingUp,
  DollarSign,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RevenueChart from '../components/instructor/RevenueChart';
import CourseTable from '../components/instructor/CourseTable';
import CourseWizard from '../components/instructor/wizard/CourseWizard';

const MetricCard = ({ icon: Icon, label, value, color, loading }) => (
  <Card hover className="flex flex-col gap-4 border-slate-100 dark:border-white/5 bg-white dark:bg-dark-card shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-start justify-between">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10`}>
        <Icon size={24} className="text-primary" />
      </div>
    </div>
    <div>
      {loading ? (
        <div className="h-8 w-24 bg-slate-100 dark:bg-white/10 rounded-lg animate-pulse mb-1" />
      ) : (
        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">
          {value}
        </div>
      )}
      <div className="text-[13px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
        {label}
      </div>
    </div>
  </Card>
);

const InstructorDashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, coursesRes] = await Promise.all([
        api.get('/api/courses/stats/'),
        api.get('/api/courses/')
      ]);
      setStats(statsRes.data);
      setCourses(coursesRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    try {
      await api.delete(`/api/courses/${courseId}/`);
      toast.success("Course deleted successfully");
      fetchData();
    } catch (err) {
      console.error("Failed to delete course", err);
      toast.error("Failed to delete course");
    }
  };

  const handleEditCourse = (course) => {
    // navigate(`/instructor/courses/${course.id}/edit`);
    toast.error("Course editor is coming soon!");
  };

  const handleViewAnalytics = (course) => {
    // navigate(`/instructor/analytics/${course.id}`);
    toast.error("Analytics dashboard is coming soon!");
  };

  return (
    <div className="animate-fade-in space-y-10 pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <LayoutDashboard size={20} className="text-primary" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
              Instructor Dashboard
            </h1>
          </div>
          <p className="text-[14px] text-slate-500 dark:text-slate-400 font-medium">
            Welcome back, <strong className="text-slate-900 dark:text-white">{user?.username}</strong>. Here's your academy's performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
            <Button variant="glass" icon={RefreshCw} onClick={fetchData} loading={loading} />
            <Button icon={PlusCircle} variant="primary" className="shadow-lg shadow-primary/20" onClick={() => setIsWizardOpen(true)}>
            Create New Course
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={BookOpen} label="Total Courses" value={stats?.total_courses || 0} loading={loading} />
        <MetricCard icon={Users} label="Total Students" value={stats?.total_students || 0} loading={loading} />
        <MetricCard icon={TrendingUp} label="Avg. Completion" value={`${stats?.avg_completion || 0}%`} loading={loading} />
        <MetricCard icon={DollarSign} label="Total Revenue" value={`$${stats?.total_revenue || '0.00'}`} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Revenue Chart ── */}
        <Card className="lg:col-span-2 border-slate-100 dark:border-white/5 bg-white dark:bg-dark-card" padding="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">Revenue Analytics</h2>
                    <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-1">Last 30 days growth</p>
                </div>
            </div>
            {loading ? (
                <div className="h-[350px] w-full bg-slate-50 dark:bg-dark-bg/50 rounded-3xl animate-pulse flex items-center justify-center">
                    <Loader2 size={32} className="text-slate-200 animate-spin" />
                </div>
            ) : (
                <RevenueChart data={stats?.revenue_growth || []} />
            )}
        </Card>

        {/* ── Recent Activity / Quick Links ── */}
        <Card className="border-slate-100 dark:border-white/5 bg-white dark:bg-dark-card" padding="p-8">
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase mb-8">Quick Actions</h2>
            <div className="space-y-4">
                {[
                    { title: 'Create Announcement', icon: BookOpen, color: 'text-blue-500', path: '/instructor/announcements' },
                    { title: 'Message Students', icon: Users, color: 'text-primary', path: '/instructor/messages' },
                    { title: 'Withdraw Funds', icon: DollarSign, color: 'text-emerald-500', path: '/instructor/revenue' },
                    { title: 'Instructor Settings', icon: LayoutDashboard, color: 'text-slate-400', path: '/instructor/settings' }
                ].map((item, i) => (
                    <button 
                        key={i} 
                        onClick={() => {
                            // navigate(item.path);
                            toast.error(`${item.title} is coming soon!`);
                        }}
                        className="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all border border-slate-100 dark:border-white/5 text-left group"
                    >
                        <div className={`w-10 h-10 rounded-xl bg-white dark:bg-dark-bg flex items-center justify-center ${item.color} shadow-sm group-hover:scale-110 transition-transform`}>
                            <item.icon size={20} />
                        </div>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{item.title}</span>
                    </button>
                ))}
            </div>
        </Card>
      </div>

      {/* ── Course Management Table ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Manage Courses</h2>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {courses.length} Courses Total
            </div>
        </div>
        
        {loading ? (
             <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-slate-50 dark:bg-white/5 rounded-[24px] animate-pulse" />
                ))}
             </div>
        ) : (
            <CourseTable 
                courses={courses} 
                onDelete={handleDeleteCourse} 
                onEdit={handleEditCourse} 
                onViewAnalytics={handleViewAnalytics} 
            />
        )}
      </div>

      {/* Course Wizard Modal */}
      <CourseWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        onRefresh={fetchData} 
      />
    </div>
  );
};

export default InstructorDashboardPage;
