import { useEffect } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import tokenService from "../../services/tokenService";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireRoles?: string[];
}

/**
 * ProtectedRoute component
 *
 * Bảo vệ routes yêu cầu authentication, chỉ cho phép truy cập khi user đã đăng nhập
 * và có đầy đủ quyền cần thiết. Nếu không, redirect tới trang đăng nhập.
 */
const ProtectedRoute = ({
  children,
  redirectTo = "/auth/login",
  requireRoles = [],
}: ProtectedRouteProps) => {
  const { isAuthenticated, checkAuthStatus } = useAuthStore();
  const location = useLocation();

  // Kiểm tra trạng thái authentication khi component mount
  useEffect(() => {
    checkAuthStatus().catch(console.error);
  }, [checkAuthStatus]);

  // Kiểm tra quyền nếu cần thiết
  const hasRequiredRoles = () => {
    if (requireRoles.length === 0) return true;

    if (requireRoles.length > 0) {
      return tokenService.hasAnyAuthority(requireRoles);
    }

    return true;
  };

  // Nếu chưa đăng nhập, redirect tới trang login
  if (!isAuthenticated) {
    // Lưu lại URL hiện tại để redirect sau khi đăng nhập
    const searchParams = new URLSearchParams();
    searchParams.append("redirect", location.pathname + location.search);

    return <Navigate to={`${redirectTo}?${searchParams.toString()}`} replace />;
  }

  // Nếu đã đăng nhập nhưng không có đủ quyền
  if (!hasRequiredRoles()) {
    return <Navigate to="/forbidden" replace />;
  }

  // Nếu đã đăng nhập và có đủ quyền, render children
  return <>{children}</>;
};

export default ProtectedRoute;
