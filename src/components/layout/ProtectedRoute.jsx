import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const ProtectedRoute = ({ allowedRoles, redirectTo = "/login", children }) => {
  const { isAuthenticated, isRoleAuthenticated, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-sm text-gray-500">
        Checking authentication...
      </div>
    );
  }

  if (allowedRoles?.length) {
    const hasAllowedSession = allowedRoles.some((role) => isRoleAuthenticated(role));
    if (!hasAllowedSession) {
      return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }
  } else if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return children;
};
