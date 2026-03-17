import InstructorSidebar from './InstructorSidebar';
import { Toaster } from 'react-hot-toast';

const InstructorLayout = ({ children }) => {
  return (
    <div className="dark flex min-h-screen bg-dark-bg transition-colors duration-300">
      <InstructorSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* ── Top Bar (Optional, can add user profile, notifications) ── */}
        <header className="h-20 border-b border-white/5 bg-dark-card/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-10">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
             Instructor Management Console
          </div>
          <div className="flex items-center gap-4">
             {/* Add Notifications or Profile here if needed */}
          </div>
        </header>

        <main className="flex-1 p-10 max-w-7xl">
          {children}
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'premium-shadow',
          style: {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            borderRadius: '16px',
            background: '#1a1a24',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </div>
  );
};

export default InstructorLayout;
