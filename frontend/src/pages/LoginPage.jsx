import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Sparkles, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const LoginPage = () => {
  const location = useLocation();
  const defaultTab = location.search.includes('register') ? 'register' : 'login';
  const [tab, setTab] = useState(defaultTab);

  // Sync state with URL if it changes outside (e.g. Navbar click)
  useEffect(() => {
    const newTab = location.search.includes('register') ? 'register' : 'login';
    setTab(newTab);
  }, [location.search]);
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loginGeneralError, setLoginGeneralError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    setLoginForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setLoginGeneralError('');
  };

  const handleRegisterChange = (e) => {
    setRegisterForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setLoginGeneralError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (Object.values(registerForm).some(v => !v)) {
      toast.error('Please fill in all fields');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoginLoading(true);
    try {
      const { confirmPassword, ...data } = registerForm;
      await api.post('/auth/users/', data);
      toast.success('Account created! Please login.');
      setTab('login');
      navigate('/login');
    } catch (err) {
      console.error('Registration Error:', err.response?.data);
      const errorMsg = err.response?.data 
        ? Object.values(err.response.data).flat()[0] 
        : 'Registration failed';
      toast.error(errorMsg);
    } finally { setLoginLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoginLoading(true);
    setLoginGeneralError('');
    try {
      await api.post('/api/v1/users/login/', loginForm);
      const res = await api.get('/api/v1/users/user/');
      setUser(res.data);
      toast.success('Welcome back to Cato!');
      navigate('/');
    } catch (err) {
      setLoginGeneralError("Email or password is incorrect");
      toast.error('Login failed');
    } finally { setLoginLoading(false); }
  };

  return (
    <div className="min-h-screen w-full bg-dark-bg flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Background Blobs (Simplified) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />

      {/* ── Auth Card ── */}
      <div className="relative z-10 flex w-full max-w-5xl min-h-[640px] glass rounded-[32px] overflow-hidden premium-shadow animate-fade-in border border-white/5">
        
        {/* ── Left Panel (Hero) ── */}
        <div className="hidden lg:flex lg:basis-[45%] relative flex-col justify-between p-12 overflow-hidden bg-primary/5">
          <img src="/auth-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 sepia-[0.3]" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-primary/10" />
          
          {/* Logo Section */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center purple-glow">
              <span className="text-white text-2xl font-black">🎓</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-2xl leading-none tracking-tight">CATO</span>
              <span className="text-primary font-bold text-[10px] tracking-[4px] uppercase">Academy</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
              <Sparkles size={14} className="text-primary" />
              <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">Premium Learning</span>
            </div>
            <h2 className="text-white text-5xl font-black mb-4 leading-[1.1] tracking-tight">
              Master your <br />
              <span className="text-primary">future</span> today.
            </h2>
            <p className="text-white/40 text-lg font-medium max-w-[280px]">
              Access world-class courses and grow your career without limits.
            </p>
          </div>

          {/* Bottom Progress Indicator Removed */}
        </div>

        {/* ── Right Panel (Form) ── */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 bg-dark-card/30 backdrop-blur-sm">
          <div className="mb-12">
            <h1 className="text-white text-4xl font-black mb-3 tracking-tight">
              {tab === 'login' ? 'Welcome back' : 'Create Account'}
            </h1>
            <p className="text-white/40 font-medium text-lg">
              {tab === 'login' ? (
                <>New here? <button onClick={() => { setTab('register'); navigate('/login?tab=register'); }} className="text-primary font-black hover:underline underline-offset-4 decoration-2">Create account</button></>
              ) : (
                <>Already a member? <button onClick={() => { setTab('login'); navigate('/login'); }} className="text-primary font-black hover:underline underline-offset-4 decoration-2">Sign in</button></>
              )}
            </p>
          </div>

          <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-6">
            <div className="space-y-4">
              {tab === 'register' && (
                <Input 
                  name="username"
                  label="Full Name"
                  placeholder="John Doe"
                  icon={User}
                  value={registerForm.username}
                  onChange={handleRegisterChange}
                  autoComplete="name"
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:bg-black/40"
                />
              )}
              
              <Input 
                name="email"
                type="email"
                label="Email Address"
                placeholder="name@company.com"
                icon={Mail}
                value={tab === 'login' ? loginForm.email : registerForm.email}
                onChange={tab === 'login' ? handleLoginChange : handleRegisterChange}
                autoComplete={tab === 'login' ? "username email" : "email"}
                className="bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:bg-black/40"
              />

              <div className="relative">
                <Input 
                  name="password"
                  type="password"
                  label="Password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={tab === 'login' ? loginForm.password : registerForm.password}
                  onChange={tab === 'login' ? handleLoginChange : handleRegisterChange}
                  autoComplete={tab === 'login' ? "current-password" : "new-password"}
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:bg-black/40"
                />
                {tab === 'login' && (
                  <button 
                    type="button"
                    onClick={() => toast.error('Password reset is not implemented yet')}
                    className="absolute right-0 -top-1 text-[11px] font-black text-primary hover:text-primary-hover uppercase tracking-wider transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              {tab === 'register' && (
                <Input 
                  name="confirmPassword"
                  type="password"
                  label="Confirm Password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                  autoComplete="new-password"
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:bg-black/40"
                />
              )}
            </div>

            {loginGeneralError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-fade-in">
                <span className="text-red-500 font-bold">⚠️</span>
                <p className="text-red-500 text-sm font-bold leading-tight">{loginGeneralError}</p>
              </div>
            )}

            <Button 
              type="submit" 
              variant="primary"
              size="lg"
              fullWidth
              loading={loginLoading}
              className="py-5 text-lg font-black tracking-wide"
            >
              {tab === 'login' ? 'Sign In to Account' : 'Get Started Now'}
            </Button>
          </form>

          {/* Social Proof / Footer Removed */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
