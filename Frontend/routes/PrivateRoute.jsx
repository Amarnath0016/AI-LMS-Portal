import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getHomePath } from "@/utils/roleRedirect";
import RouteLoadingSkeleton from "@/components/common/LoadingSkeleton";

export function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <RouteLoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  return children;
}
