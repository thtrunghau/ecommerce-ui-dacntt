// src/utils/roleHelpers.ts

export type RoleGroup = {
  id: string;
  name: string;
};

/**
 * Kiểm tra user có role (theo authorities) không
 * @param authorities mảng role name (authorities) của user
 * @param roleName tên role cần kiểm tra ("admin", "seller", ...)
 * @returns true nếu user có role đó
 */
export function hasRoleName(authorities: string[], roleName: string): boolean {
  return (
    authorities.includes(roleName) ||
    authorities.includes(roleName.toUpperCase()) ||
    authorities.includes(`ROLE_${roleName.toUpperCase()}`)
  );
}
