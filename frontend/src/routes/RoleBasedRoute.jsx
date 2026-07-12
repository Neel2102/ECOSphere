import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Renders children only when the logged-in user has one of the allowed roles.
function RoleBasedRoute({ roles, children }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default RoleBasedRoute;
