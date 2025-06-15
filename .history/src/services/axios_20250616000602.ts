import axios from "axios";
import type { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from "axios";
import tokenService from "./tokenService";
import useAuthStore from "../store/authStore";

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

// Tạo instance axios với config mặc định
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Loại requests cần bỏ qua xử lý 401
const publicEndpoints = [
  "/api/token",
  "/api/google/token",
  "/api/v1/webapp/account/signup",
  "/api/v1/webapp/account/google/signup"
];

// Kiểm tra URL có phải là public endpoint không
const isPublicEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;
  return publicEndpoints.some(endpoint => url.includes(endpoint));
};

// Thêm interceptor request
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Kiểm tra token hết hạn trước khi gửi request
    if (!isPublicEndpoint(config.url) && tokenService.isTokenExpiringSoon()) {
      // Lưu lại request để thử lại sau khi refresh token
      const originalRequest = config;
      
      // Thực hiện refresh token (vì đây là async, ta trả về Promise)
      return useAuthStore.getState()
        .refreshToken()
        .then(() => {
          // Thêm token mới vào request và thực hiện lại
          originalRequest.headers = {
            ...originalRequest.headers,
            ...tokenService.getAuthHeader()
          };
          return Promise.resolve(originalRequest);
        })
        .catch(() => {
          // Nếu refresh thất bại, ta vẫn gửi request với token cũ
          // (Server sẽ trả về 401 và xử lý ở response interceptor)
          return Promise.resolve(config);
        });
    }
    
    // Thêm token vào header
    if (!isPublicEndpoint(config.url)) {
      const authHeader = tokenService.getAuthHeader();
      config.headers = {
        ...config.headers,
        ...authHeader
      };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Xử lý unauthorized (401) errors
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Thêm callback vào queue để thực thi sau khi refresh
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// Thực thi tất cả callbacks với token mới
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
};

// Thêm interceptor response
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Xử lý trường hợp 401 Unauthorized
    if (error.response?.status === 401 && 
        originalRequest && 
        !originalRequest._retry && 
        !isPublicEndpoint(originalRequest.url)) {
      
      // Tránh multiple refresh requests
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;
        
        try {
          // Thực hiện refresh token
          await useAuthStore.getState().refreshToken();
          
          // Lấy token mới
          const newToken = tokenService.getAccessToken() || '';
          
          // Thông báo cho tất cả requests đang chờ
          onTokenRefreshed(newToken);
          
          // Thêm token mới vào request ban đầu
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          } else {
            originalRequest.headers = { Authorization: `Bearer ${newToken}` };
          }
          
          // Gửi lại request ban đầu
          return axios(originalRequest);
        } catch (refreshError) {
          // Refresh thất bại, đăng xuất user
          useAuthStore.getState().logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Đang refresh, thêm request này vào queue
        return new Promise(resolve => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            } else {
              originalRequest.headers = { Authorization: `Bearer ${token}` };
            }
            resolve(axios(originalRequest));
          });
        });
      }
    }
    
    // Xử lý lỗi 403 Forbidden (không có quyền)
    if (error.response?.status === 403) {
      console.error("Authorization Error: You don't have permission to access this resource");
      // Có thể dispatch event hoặc redirect tới trang Error 403
    }
      // Logging và handling các lỗi khác
    const errorMessage = 
      error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data 
        ? error.response.data.message 
        : error.message;
        
    console.error("API Error:", errorMessage);
    
    return Promise.reject(error);
  },
);

export default instance;
