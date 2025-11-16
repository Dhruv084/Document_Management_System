import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../utils/auth';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const authenticated = isAuthenticated();
  const userRole = getUserRole();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

