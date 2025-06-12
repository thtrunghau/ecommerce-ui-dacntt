import { create } from "zustand";

interface User {
  id: string;
  username: string;
  email: string;
  phone?: string; // Thêm trường số điện thoại
  name?: string;
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  register: (user: User) => Promise<void>;
}

// Tạo Auth Store với Zustand
const useAuthStore = create<AuthState>((set) => {
  // Kiểm tra user từ localStorage
  const savedUser = localStorage.getItem("user");
  const parsedUser = savedUser ? JSON.parse(savedUser) : null;

  return {
    isAuthenticated: Boolean(parsedUser),
    user: parsedUser,

    login: (user) => {
      localStorage.setItem("user", JSON.stringify(user));
      set({ isAuthenticated: true, user });
    },

    logout: () => {
      localStorage.removeItem("user");
      set({ isAuthenticated: false, user: null });
    },    register: async (user) => {
      // Simulate an API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem("user", JSON.stringify(user));
      set({ isAuthenticated: true, user });
    },
  };
});

export default useAuthStore;
