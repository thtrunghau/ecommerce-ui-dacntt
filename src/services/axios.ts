import axios from "axios";

// Tạo instance axios với config mặc định
const instance = axios.create({
  baseURL: "http://localhost:8081",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor request
instance.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Thêm interceptor response
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi response
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default instance;
