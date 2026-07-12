import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SkeletonLoader from '../components/common/SkeletonLoader/SkeletonLoader';

function PrivateRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div style={{ maxWidth: 960, margin: '48px auto', padding: '0 24px' }}>
        <SkeletonLoader variant="card" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default PrivateRoute;
