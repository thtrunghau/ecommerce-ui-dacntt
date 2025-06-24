/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Token Service
 *
 * Dịch vụ quản lý JWT token, bao gồm:
 * - Lưu trữ và truy xuất token
 * - Giải mã JWT để lấy thông tin
 * - Kiểm tra tính hợp lệ và thời hạn
 * - Quản lý refresh token
 */

import { jwtDecode } from "jwt-decode";
import type { GrantedAuthority } from "../types/api";

// Các storage keys
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const TOKEN_EXPIRY_KEY = "tokenExpiry";

// Interface định nghĩa cấu trúc JWT payload
interface JwtPayload {
  sub: string; // subject (user ID)
  email?: string; // email
  exp?: number; // expiration time
  iat?: number; // issued at
  roles?: string[]; // user roles
  authorities?: GrantedAuthority[]; // authorities từ backend
  [key: string]: unknown; // cho phép các field khác
}

/**
 * Service quản lý JWT token
 */
const tokenService = {
  /**
   * Lưu access token vào storage
   */
  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);

    // Lưu thời điểm hết hạn nếu có
    try {
      const decoded = this.decodeToken(token);
      if (decoded.exp) {
        const expiryDate = new Date(decoded.exp * 1000).toISOString();
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate);
      }
    } catch (error) {
      console.error("Failed to save token expiry:", error);
    }
  },

  /**
   * Lưu refresh token vào storage
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  /**
   * Lấy access token từ storage
   */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Lấy refresh token từ storage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Xóa tất cả tokens khỏi storage
   */
  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  },

  /**
   * Giải mã JWT token để lấy payload
   */
  decodeToken(token: string): JwtPayload {
    try {
      return jwtDecode<JwtPayload>(token);
    } catch (error) {
      console.error("Failed to decode token:", error);
      throw new Error("Invalid token format");
    }
  },
  /**
   * Lấy thông tin người dùng từ token
   */
  getUserInfo(): {
    userId: string;
    username?: string;
    email?: string;
    phoneNumber?: string;
    birthYear?: number;
    roles: string[];
  } | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const decoded = this.decodeToken(token);
      return {
        userId: decoded.sub,
        username: decoded.username as string | undefined,
        email: decoded.email,
        phoneNumber: decoded.phoneNumber as string | undefined,
        birthYear: decoded.birthYear as number | undefined, // Thêm dòng này
        roles: decoded.roles || [],
      };
    } catch (_error) {
      return null;
    }
  },
  /**
   * Lấy danh sách quyền từ token
   */
  getAuthorities(): string[] {
    const token = this.getAccessToken();
    if (!token) return [];

    try {
      const decoded = this.decodeToken(token);
      // Nếu authorities là mảng
      if (Array.isArray(decoded.authorities)) {
        return decoded.authorities
          .map((auth) =>
            typeof auth === "string" ? auth : auth.authority || "",
          )
          .filter(Boolean); // Remove empty strings
      }
      // Nếu authorities là string
      if (typeof decoded.authorities === "string") {
        return [decoded.authorities];
      }
      // Nếu roles là mảng
      if (decoded.roles && Array.isArray(decoded.roles)) {
        return decoded.roles;
      }
      return [];
    } catch (_error) {
      return [];
    }
  },
  /**
   * Kiểm tra xem user có quyền cụ thể không
   */
  hasAuthority(authority: string): boolean {
    const authorities = this.getAuthorities();
    return authorities.includes(authority);
  },

  /**
   * Kiểm tra xem user có một trong các quyền được yêu cầu không
   */
  hasAnyAuthority(requiredAuthorities: string[]): boolean {
    const authorities = this.getAuthorities();
    return requiredAuthorities.some((required) =>
      authorities.includes(required),
    );
  },

  /**
   * Kiểm tra xem user có tất cả các quyền được yêu cầu không
   */
  hasAllAuthorities(requiredAuthorities: string[]): boolean {
    const authorities = this.getAuthorities();
    return requiredAuthorities.every((required) =>
      authorities.includes(required),
    );
  },

  /**
   * Kiểm tra token có hợp lệ không (tồn tại và chưa hết hạn)
   */
  isTokenValid(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const decoded = this.decodeToken(token);
      if (!decoded.exp) return true; // Nếu không có exp thì coi như valid

      // Kiểm tra thời hạn
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime;
    } catch (_error) {
      return false;
    }
  },

  /**
   * Kiểm tra token có sắp hết hạn không (còn dưới 5 phút)
   */
  isTokenExpiringSoon(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const decoded = this.decodeToken(token);
      if (!decoded.exp) return false;

      const currentTime = Math.floor(Date.now() / 1000);
      const fiveMinutes = 5 * 60;

      // Token sẽ hết hạn trong vòng 5 phút tới
      return (
        decoded.exp < currentTime + fiveMinutes && decoded.exp > currentTime
      );
    } catch (_error) {
      return false;
    }
  },

  /**
   * Lấy thời gian còn lại của token (tính bằng giây)
   */
  getTokenRemainingTime(): number {
    const token = this.getAccessToken();
    if (!token) return 0;

    try {
      const decoded = this.decodeToken(token);
      if (!decoded.exp) return 0;

      const currentTime = Math.floor(Date.now() / 1000);
      return Math.max(0, decoded.exp - currentTime);
    } catch (_error) {
      return 0;
    }
  },

  /**
   * Lấy authorization header cho API requests
   */
  getAuthHeader(): Record<string, string> {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  /**
   * Update token expiry trong storage (khi đã parse trước đó)
   */
  updateTokenExpiry(expiryDate: Date): void {
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate.toISOString());
  },

  /**
   * Lấy thời điểm hết hạn của token
   */
  getTokenExpiry(): Date | null {
    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
    return expiryStr ? new Date(expiryStr) : null;
  },
};

export default tokenService;
