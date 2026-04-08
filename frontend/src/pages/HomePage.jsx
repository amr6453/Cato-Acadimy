import { BookOpen, Award, TrendingUp, User, Star, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
  <Card hover padding="p-6" className="flex flex-col gap-4 group">
    <div className={`w-12 h-12 rounded-2xl ${colorClass} bg-opacity-10 flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
      <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
    </div>
    <div>
      <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
        {value}
      </div>
      <div className="text-[13px] text-slate-500 font-bold uppercase tracking-wider">
        {label}
      </div>
    </div>
  </Card>
);

const HomePage = () => {
  const { user } = useAuthStore();
  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';

  return (
    <div className="animate-fade-in space-y-10">
      <SEO
        title="Home"
        description="Master your future today with Cato Academy. Access world-class courses and grow your career without limits."
      />
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-[32px] bg-white dark:bg-dark-bg p-10 sm:p-16 premium-shadow border border-slate-100 dark:border-white/5 transition-colors duration-300">
        {/* Simplified Background Gradients */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-blue-500/5 blur-[100px]" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-full mb-8 backdrop-blur-md">
            <Star size={14} className="text-primary fill-primary" />
            <span className="text-[11px] font-black text-slate-600 dark:text-white/80 uppercase tracking-[2px]">
              {user?.role} Access
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
            Welcome back, <br />
            <span className="text-primary">{user?.username || 'Learner'}</span>! 👋
          </h1>
          
          <p className="text-slate-500 dark:text-white/40 text-lg sm:text-xl font-medium mb-10 leading-relaxed">
            Ready to continue your journey? Let's make progress!
          </p>

          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="lg" className="px-8 shadow-2xl shadow-primary/40">
              Continue Learning
            </Button>
            {isInstructor && (
              <Link to="/instructor">
                <Button variant="glass" size="lg" icon={ArrowRight}>
                  Instructor Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Section ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={BookOpen} label="Enrolled Courses" value="0" colorClass="bg-primary" />
        <StatCard icon={TrendingUp} label="Hours Learned" value="0" colorClass="bg-blue-500" />
        <StatCard icon={Award} label="Certificates" value="0" colorClass="bg-amber-500" />
        <StatCard icon={User} label="Community Rank" value="N/A" colorClass="bg-emerald-500" />
      </div>

      {/* ── Account Info Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2" padding="p-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Account Information</h2>
            <Button variant="ghost" size="sm">Edit Profile</Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: 'Username', value: user?.username, icon: User },
              { label: 'Email Address', value: user?.email, icon: BookOpen },
              { label: 'Account Role', value: user?.role, icon: Award },
              { label: 'Member Since', value: 'N/A', icon: TrendingUp },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100/50 dark:border-white/5 flex items-start gap-4 hover:border-primary/20 transition-colors group">
                <div className="p-3 bg-white dark:bg-white/5 rounded-xl shadow-sm border border-slate-100 dark:border-white/10 group-hover:text-primary transition-colors">
                  <Icon size={20} className="dark:text-slate-400" />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</div>
                  <div className="text-[15px] font-bold text-slate-700 dark:text-white truncate max-w-[200px]">{value || 'N/A'}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sidebar Card */}
        <Card glass className="bg-primary/5 border-primary/10">
           <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Daily Goal</h3>
           <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">You're at <span className="text-primary font-bold">80%</span> of your weekly learning goal. Almost there!</p>
           <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-inner">
             <div className="h-full bg-primary w-[80%] rounded-full purple-glow transition-all duration-1000" />
           </div>
           <div className="mt-8">
             <Button fullWidth variant="primary" className="shadow-lg shadow-primary/20">View Schedule</Button>
           </div>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
