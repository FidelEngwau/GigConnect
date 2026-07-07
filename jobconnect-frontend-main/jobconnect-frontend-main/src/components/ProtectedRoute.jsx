import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

// Map database role names to frontend role names
const mapRole = (role) => {
  if (role === 'employer') return 'professional';
  if (role === 'job_seeker') return 'graduate';
  return role;
};

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for AuthProvider to finish checking the saved token.
  if (loading) return <Loading />;
  // Unauthenticated users are sent to login and the attempted URL is preserved.
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  // Map the database role to frontend role for comparison
  const mappedRole = mapRole(user.role);
  // Authenticated users still need the correct role for role-specific pages.
  if (roles && !roles.includes(mappedRole)) return <Navigate to="/" replace />;

  // Outlet renders the child route that matched inside this protected group.
  return <Outlet />;
};

export default ProtectedRoute;
