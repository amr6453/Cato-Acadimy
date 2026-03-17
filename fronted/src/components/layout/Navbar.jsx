import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Search,
  Sun,
  Moon
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync search input with URL when searchParams change externally (e.g. clearing filters)
  useEffect(() => {
    const query = searchParams.get('search') || '';
    if (query !== search) {
      setSearch(query);
    }
  }, [searchParams]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      const currentQuery = searchParams.get('search') || '';
      
      // If the query actually changed
      if (currentQuery !== search) {
        const newParams = new URLSearchParams(searchParams);
        if (search) {
          newParams.set('search', search);
        } else {
          newParams.delete('search');
        }

        // If not on search page, redirect to home with the search query
        if (location.pathname !== '/') {
          if (search) {
            navigate(`/?${newParams.toString()}`);
          }
        } else {
          // On home page, just update the search params
          setSearchParams(newParams);
        }
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [search, location.pathname, navigate, searchParams, setSearchParams]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinkClass = (path) => `
    flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-bold transition-all duration-200
    ${location.pathname === path 
      ? 'bg-primary/10 text-primary' 
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}
  `;

  return (
    <nav className={`
      sticky top-0 z-50 transition-all duration-300 border-b
      ${scrolled 
        ? 'bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-slate-200/60 dark:border-dark-border py-2 shadow-sm' 
        : 'bg-transparent border-transparent py-4'}
    `}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary group-hover:bg-primary-hover rounded-xl flex items-center justify-center transition-all duration-300 premium-shadow">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-900 dark:text-white font-black text-xl leading-none tracking-tight">CATO</span>
            <span className="text-primary font-bold text-[9px] tracking-[3px] uppercase">Academy</span>
          </div>
        </Link>

        {/* ── Search Bar ── */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-8 px-4 py-2 bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-xl focus-within:bg-white dark:focus-within:bg-white/10 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-300">
          <Search size={18} className="text-slate-400 dark:text-slate-500 mr-3" />
          <input
            type="text"
            placeholder="Search for courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-[14px] font-medium text-slate-700 dark:text-white w-full placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* ── Desktop Nav Links ── */}
        <div className="hidden md:flex items-center gap-1">
          {isAuthenticated && (
            <>
              <Link to="/" className={navLinkClass('/')}>
                <BookOpen size={16} />
                Courses
              </Link>
              {(user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN') ? (
                <Link to="/instructor" className={navLinkClass('/instructor')}>
                  <LayoutDashboard size={16} />
                  Instructor
                </Link>
              ) : (
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                <LayoutDashboard size={16} />
                My Learning
              </Link>
              )}
            </>
          )}
        </div>

        {/* ── Theme Toggle & Auth Area ── */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-all duration-300 border border-transparent hover:border-primary/20"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block"></div>
          {isAuthenticated ? (
            <div className="relative group/user">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2.5 bg-white dark:bg-dark-card border border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 rounded-full py-1.5 pl-1.5 pr-4 transition-all duration-300 shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white premium-shadow">
                  <User size={16} />
                </div>
                <span className="text-[14px] font-bold text-slate-700 dark:text-white">
                  {user?.username || 'User'}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-dark-card border border-slate-100 dark:border-white/5 rounded-2xl shadow-2xl premium-shadow overflow-hidden animate-fade-in py-2">
                    <div className="px-5 py-3 border-b border-slate-50 dark:border-white/5">
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Signed in as</p>
                      <p className="text-[14px] font-bold text-slate-900 dark:text-white truncate">{user?.email}</p>
                      <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-wider">
                        {user?.role}
                      </span>
                      <div className="mt-4 pt-4 border-t border-slate-50 dark:border-white/5 space-y-1">
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-[14px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary transition-all rounded-xl" onClick={() => setDropdownOpen(false)}>
                          <User size={16} />
                          Profile Settings
                        </Link>
                        <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2 text-[14px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary transition-all rounded-xl" onClick={() => setDropdownOpen(false)}>
                          <LayoutDashboard size={16} />
                          My Learning
                        </Link>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors font-bold text-[14px]"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
               <Link to="/login" className="text-slate-600 dark:text-slate-400 font-bold hover:text-primary transition-colors text-sm">Sign In</Link>
               <Link to="/register" className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-hover transition-all text-sm premium-shadow">Register</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-dark-bg border-t border-slate-100 dark:border-white/5 p-6 flex flex-col gap-6 animate-fade-in text-slate-900 dark:text-white">
          {/* Mobile Search */}
          <div className="flex items-center px-4 py-3 bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-xl focus-within:bg-white dark:focus-within:bg-white/10 focus-within:border-primary/30 transition-all">
            <Search size={18} className="text-slate-400 dark:text-slate-500 mr-3" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 dark:text-white w-full"
            />
          </div>

          {isAuthenticated && (
            <>
              <Link to="/" className={navLinkClass('/')} onClick={() => setMobileOpen(false)}>
                <BookOpen size={18} />
                Courses
              </Link>
              {user?.role === 'STUDENT' && (
                 <Link to="/dashboard" className={navLinkClass('/dashboard')} onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard size={18} />
                  My Learning
                </Link>
              )}
              <Link to="/profile" className={navLinkClass('/profile')} onClick={() => setMobileOpen(false)}>
                <User size={18} />
                Profile
              </Link>
              {(user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN') && (
                <Link to="/instructor" className={navLinkClass('/instructor')} onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard size={18} />
                  Instructor
                </Link>
              )}
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="flex items-center gap-3 px-4 py-3 text-red-500 font-bold"
              >
                <LogOut size={18} />
                Log Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
