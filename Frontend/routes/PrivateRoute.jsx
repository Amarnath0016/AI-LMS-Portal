import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getHomePath } from "@/config/navigation";

export function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    const fallbackPath = getHomePath(user.role);
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}
