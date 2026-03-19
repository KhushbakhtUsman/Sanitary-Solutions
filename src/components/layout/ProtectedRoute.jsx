import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const ProtectedRoute = ({ allowedRoles, redirectTo = "/login", children }) => {
  const { isAuthenticated, user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-sm text-gray-500">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
