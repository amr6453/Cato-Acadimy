// RegisterPage is merged into LoginPage as a tab.
// This file redirects /register → /login?tab=register
import { Navigate } from 'react-router-dom';
const RegisterPage = () => <Navigate to="/login?tab=register" replace />;
export default RegisterPage;
