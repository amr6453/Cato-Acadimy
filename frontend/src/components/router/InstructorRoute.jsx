import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const INSTRUCTOR_ROLES = ['INSTRUCTOR', 'ADMIN'];

/**
 * Extends ProtectedRoute: also requires user to have an instructor/admin role.
 * Non-matching roles are redirected to /unauthorized.
 */
const InstructorRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '3px solid var(--gray-200)',
            borderTopColor: 'var(--purple)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!INSTRUCTOR_ROLES.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default InstructorRoute;
