import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Spinner } from "./ui/Spinner";

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  const hasToken = typeof localStorage !== "undefined" ? !!localStorage.getItem("auth_token") : false;

  if (isLoading || (!isAuthenticated && hasToken && user === null)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#010102]">
        <Spinner className="h-7 w-7 text-[#f7f8f8]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
