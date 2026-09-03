import { Navigate } from "react-router-dom";
import { useAuth } from "./authentication/authcontext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, isAuthLoading, user } = useAuth();

  if (isAuthLoading) return null;

  // Not logged in → redirect to login
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  // Role check (if allowedRoles specified)
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;