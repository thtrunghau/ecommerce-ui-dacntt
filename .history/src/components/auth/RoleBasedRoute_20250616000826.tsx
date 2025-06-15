import type { ReactNode } from "react";
import tokenService from "../../services/tokenService";

interface RoleBasedRouteProps {
  children: ReactNode;
  requiredRoles: string[];
  fallback?: ReactNode;
}

/**
 * RoleBasedRoute component
 * 
 * Hiển thị nội dung dựa trên quyền của user.
 * - Nếu user có đủ quyền, hiển thị children
 * - Nếu không, hiển thị fallback (nếu có) hoặc null
 */
const RoleBasedRoute = ({
  children,
  requiredRoles,
  fallback = null,
}: RoleBasedRouteProps) => {
  // Kiểm tra user có đủ quyền không
  const hasAccess = tokenService.hasAnyAuthority(requiredRoles);

  // Nếu có đủ quyền, hiển thị children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Nếu không có đủ quyền, hiển thị fallback hoặc null
  return <>{fallback}</>;
};

export default RoleBasedRoute;
