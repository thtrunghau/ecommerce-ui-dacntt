import { useMemo } from "react";
import useAuthStore from "../store/authStore";
import tokenService from "../services/tokenService";

/**
 * Hook usePermission
 * 
 * Hook để kiểm tra quyền của user.
 * - Kiểm tra user đã đăng nhập chưa
 * - Kiểm tra user có quyền cụ thể không
 * - Kiểm tra user có một trong các quyền không
 * - Kiểm tra user có tất cả các quyền không
 */
const usePermission = () => {
  const { isAuthenticated } = useAuthStore();

  const permissions = useMemo(() => {
    return {
      /**
       * Kiểm tra user có quyền cụ thể không
       */
      hasPermission: (permission: string): boolean => {
        if (!isAuthenticated) return false;
        return tokenService.hasAuthority(permission);
      },

      /**
       * Kiểm tra user có một trong các quyền không
       */
      hasAnyPermission: (permissions: string[]): boolean => {
        if (!isAuthenticated) return false;
        return tokenService.hasAnyAuthority(permissions);
      },

      /**
       * Kiểm tra user có tất cả các quyền không
       */
      hasAllPermissions: (permissions: string[]): boolean => {
        if (!isAuthenticated) return false;
        return tokenService.hasAllAuthorities(permissions);
      },

      /**
       * Lấy danh sách quyền của user
       */
      getUserPermissions: (): string[] => {
        if (!isAuthenticated) return [];
        return tokenService.getAuthorities();
      },
    };
  }, [isAuthenticated]);

  return permissions;
};

export default usePermission;
