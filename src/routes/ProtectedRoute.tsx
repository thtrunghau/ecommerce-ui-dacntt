import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  unauthOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  unauthOnly,
}) => {
  const { isAuthenticated, authorities } = useAuthStore();

  if (unauthOnly && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!unauthOnly && !isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredRole) {
    const required = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];
    const hasRole = required.some((role) => authorities.includes(role));
    if (!hasRole) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
