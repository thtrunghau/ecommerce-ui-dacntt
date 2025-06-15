/**
 * Token Service
 * 
 * Dịch vụ quản lý JWT token, bao gồm:
 * - Lưu trữ và truy xuất token
 * - Giải mã JWT để lấy thông tin
 * - Kiểm tra tính hợp lệ và thời hạn
 * - Quản lý refresh token
 */

import jwt_decode from 'jwt-decode'; // Cần cài đặt: npm install jwt-decode

// Định nghĩa cấu trúc JWT payload
interface JwtPayload {
  sub: string; // subject (user ID)
  email: string;
  iat: number; // issued at
  exp: number; // expiration time
  authorities?: string[]; // user roles/permissions
  [key: string]: unknown; // other claims
}

// Định nghĩa loại token lưu trữ
interface StoredToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // timestamp in milliseconds
  rememberMe?: boolean;
}

// Các keys để lưu trữ trong localStorage
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';
const REMEMBER_ME_KEY = 'rememberMe';

/**
 * Lưu token vào localStorage
 */
export const saveToken = (
  accessToken: string,
  refreshToken?: string,
  rememberMe = false
): void => {
  try {
    // Giải mã token để lấy thời gian hết hạn
    const decodedToken = jwt_decode<JwtPayload>(accessToken);
    const expiresAt = decodedToken.exp * 1000; // Convert to milliseconds

    // Lưu token và thông tin liên quan
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
    localStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());

    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    // Debugging
    console.log('Token saved successfully');
  } catch (error) {
    console.error('Failed to save token:', error);
    clearTokens();
  }
};

/**
 * Lấy stored token từ localStorage
 */
export const getStoredToken = (): StoredToken | null => {
  const accessToken = localStorage.getItem(TOKEN_KEY);
  const expiresAtString = localStorage.getItem(TOKEN_EXPIRY_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || undefined;
  const rememberMeString = localStorage.getItem(REMEMBER_ME_KEY);

  if (!accessToken || !expiresAtString) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    expiresAt: parseInt(expiresAtString),
    rememberMe: rememberMeString === 'true',
  };
};

/**
 * Xóa tất cả tokens từ localStorage
 */
export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
};

/**
 * Giải mã JWT token để lấy payload
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt_decode<JwtPayload>(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Lấy decoded token payload từ stored token
 */
export const getDecodedToken = (): JwtPayload | null => {
  const storedToken = getStoredToken();
  
  if (!storedToken) {
    return null;
  }

  return decodeToken(storedToken.accessToken);
};

/**
 * Kiểm tra token có còn hợp lệ không
 */
export const isTokenValid = (): boolean => {
  const storedToken = getStoredToken();
  
  if (!storedToken) {
    return false;
  }

  // Token còn hạn sử dụng nếu thời gian hiện tại nhỏ hơn thời gian hết hạn
  // Thêm buffer 10s để tránh edge cases
  const currentTime = Date.now();
  return currentTime < storedToken.expiresAt - 10000;
};

/**
 * Kiểm tra token sẽ hết hạn trong bao lâu nữa (milliseconds)
 * Trả về số âm nếu token đã hết hạn
 */
export const getTokenTimeRemaining = (): number => {
  const storedToken = getStoredToken();
  
  if (!storedToken) {
    return -1;
  }

  return storedToken.expiresAt - Date.now();
};

/**
 * Kiểm tra xem token có cần refresh không (sắp hết hạn)
 * Default: refresh khi còn 5 phút
 */
export const shouldRefreshToken = (bufferTime = 300000): boolean => {
  const timeRemaining = getTokenTimeRemaining();
  
  // Nếu token không tồn tại hoặc đã hết hạn
  if (timeRemaining <= 0) {
    return false; // Không refresh mà phải đăng nhập lại
  }

  // Refresh nếu thời gian còn lại nhỏ hơn buffer
  return timeRemaining < bufferTime;
};

/**
 * Lấy authorities (roles/permissions) từ token
 */
export const getAuthorities = (): string[] => {
  const decodedToken = getDecodedToken();
  
  if (!decodedToken || !decodedToken.authorities) {
    return [];
  }

  return Array.isArray(decodedToken.authorities) 
    ? decodedToken.authorities 
    : [];
};

/**
 * Kiểm tra user có quyền không
 */
export const hasPermission = (requiredPermissions: string[]): boolean => {
  // Nếu không yêu cầu quyền, cho phép truy cập
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // Lấy quyền của user từ token
  const userPermissions = getAuthorities();
  
  // Kiểm tra user có ít nhất một trong các quyền yêu cầu
  return requiredPermissions.some(permission => 
    userPermissions.includes(permission)
  );
};

/**
 * Lấy thông tin user từ token
 */
export const getUserInfo = () => {
  const decodedToken = getDecodedToken();
  
  if (!decodedToken) {
    return null;
  }

  // Trả về các thông tin cơ bản từ token
  return {
    id: decodedToken.sub,
    email: decodedToken.email,
    authorities: decodedToken.authorities || [],
    // Thêm các trường khác nếu cần
  };
};

export default {
  saveToken,
  getStoredToken,
  clearTokens,
  decodeToken,
  getDecodedToken,
  isTokenValid,
  getTokenTimeRemaining,
  shouldRefreshToken,
  getAuthorities,
  hasPermission,
  getUserInfo
};
