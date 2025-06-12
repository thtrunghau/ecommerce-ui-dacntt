import { createContext, useContext, useState, type ReactNode, useMemo } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  register: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Kiểm tra trạng thái xác thực từ localStorage khi khởi động
  const isAuthenticated = Boolean(user);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const register = (userData: User) => {
    // Trong thực tế, đây là nơi bạn sẽ gọi API đăng ký
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      login,
      logout,
      register
    }),
    [isAuthenticated, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
