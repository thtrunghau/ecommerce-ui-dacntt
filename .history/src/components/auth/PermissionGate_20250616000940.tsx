import type { ReactNode } from "react";
import usePermission from "../../hooks/usePermission";

interface PermissionGateProps {
  children: ReactNode;
  permissions: string[];
  type?: "any" | "all"; // "any": có bất kỳ quyền nào, "all": có tất cả các quyền
  fallback?: ReactNode;
}

/**
 * PermissionGate component
 * 
 * Component giúp kiểm soát hiển thị UI dựa trên quyền của user.
 * - Nếu user có đủ quyền, hiển thị children
 * - Nếu không, hiển thị fallback (nếu có) hoặc null
 */
const PermissionGate = ({
  children,
  permissions,
  type = "any", // default là "any"
  fallback = null,
}: PermissionGateProps) => {
  const { hasAnyPermission, hasAllPermissions } = usePermission();

  // Kiểm tra quyền dựa trên type
  const hasAccess = type === "any" 
    ? hasAnyPermission(permissions) 
    : hasAllPermissions(permissions);

  // Nếu có quyền, hiển thị children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Nếu không có quyền, hiển thị fallback hoặc null
  return <>{fallback}</>;
};

export default PermissionGate;
