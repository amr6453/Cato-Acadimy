import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/router/ProtectedRoute';
import InstructorRoute from './components/router/InstructorRoute';
import InstructorLayout from './components/layout/InstructorLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import CourseListPage from './pages/CourseListPage';
import CourseDetailPage from './pages/CourseDetailPage';
import InstructorDashboardPage from './pages/InstructorDashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import LearningPage from './pages/LearningPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

import { Toaster } from 'react-hot-toast';

import { AnimatePresence } from 'framer-motion';

function App() {
  const { initAuth, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Rehydrate session from HttpOnly cookie on every fresh page load
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <AnimatePresence mode="wait">
      <Toaster position="top-center" reverseOrder={false} />
      <Routes location={location} key={location.pathname}>
      {/* ── Auth Pages: No Navbar ── */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ── Protected: Wrap with Layout (Navbar + Content Container) ── */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <CourseListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Layout>
              <HomePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <StudentDashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/course/:slug/learn"
        element={
          <ProtectedRoute>
            <LearningPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/course/:slug"
        element={
          <ProtectedRoute>
            <Layout>
              <CourseDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/*"
        element={
          <InstructorRoute>
            <InstructorLayout>
              <Routes>
                <Route path="/" element={<InstructorDashboardPage />} />
                <Route path="/courses" element={<div className="text-white font-bold p-10 bg-dark-card rounded-3xl border border-white/5">Manage Courses - Coming Soon</div>} />
                <Route path="/revenue" element={<div className="text-white font-bold p-10 bg-dark-card rounded-3xl border border-white/5">Revenue Analytics - Coming Soon</div>} />
                <Route path="/settings" element={<div className="text-white font-bold p-10 bg-dark-card rounded-3xl border border-white/5">Instructor Settings - Coming Soon</div>} />
              </Routes>
            </InstructorLayout>
          </InstructorRoute>
        }
      />

      {/* ── Catch-all ── */}
      <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
    </Routes>
    </AnimatePresence>
  );
}

export default App;
