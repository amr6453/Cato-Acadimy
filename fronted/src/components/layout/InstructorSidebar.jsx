import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  DollarSign, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

const InstructorSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/instructor' },
    { name: 'My Courses', icon: BookOpen, path: '/instructor/courses' },
    { name: 'Revenue', icon: DollarSign, path: '/instructor/revenue' },
    { name: 'Settings', icon: Settings, path: '/instructor/settings' },
  ];

  return (
    <motion.div 
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="h-screen sticky top-0 bg-dark-card border-r border-white/5 flex flex-col z-40 transition-all duration-300"
    >
      {/* ── Brand ── */}
      <div className="p-6 mb-8 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-black text-xl italic">L</span>
            </div>
            <span className="text-lg font-black text-white uppercase italic tracking-tighter">LERN<span className="text-primary">.</span>PRO</span>
          </motion.div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all ml-auto"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* ── Nav Links ── */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end
            className={({ isActive }) => `
              flex items-center gap-4 p-4 rounded-2xl transition-all group
              ${isActive 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} className="min-w-[22px]" />
                {!isCollapsed && (
                  <span className="text-sm font-bold uppercase tracking-wider">{item.name}</span>
                )}
                {isActive && !isCollapsed && (
                  <motion.div 
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-lg shadow-primary/50"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="p-4 mt-auto border-t border-white/5">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all group"
        >
          <LogOut size={22} className="min-w-[22px]" />
          {!isCollapsed && (
            <span className="text-sm font-bold uppercase tracking-wider">Logout</span>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default InstructorSidebar;
