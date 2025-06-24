/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AccountResponseDTO,
  AccountRequestDTO,
  AuthRequestDTO,
  GoogleAuthRequestDTO,
  UUID,
} from "../types/api";

// Import the API services and tokenService
import { authApi, accountApi } from "../services/apiService";
import tokenService from "../services/tokenService";

// Define User interface
interface User {
  id: UUID;
  username: string;
  email: string;
  birthYear?: number;
  phoneNumber?: string;
  avatar?: string;
}

// Define the Auth State
interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  tokenExpiry: Date | null;
  authorities: string[];
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: AuthRequestDTO) => Promise<void>;
  loginWithGoogle: (idToken: GoogleAuthRequestDTO) => Promise<void>;
  logout: () => void;
  register: (userData: AccountRequestDTO) => Promise<AccountResponseDTO>;
  updateUser: (userData: Partial<User>) => void;
  refreshToken: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
}

// Create the auth store with persistence
const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      token: null,
      tokenExpiry: null,
      authorities: [],
      isLoading: false,
      error: null, // Actions
      login: async (credentials: AuthRequestDTO) => {
        set({ isLoading: true, error: null });
        try {
          // Call the real API endpoint
          const response = await authApi.login(credentials);

          // Hỗ trợ cả response.accessToken (backend mới) và response.token.tokenValue (backend cũ)
          const tokenValue = response.accessToken || response.token?.tokenValue;
          if (!tokenValue)
            throw new Error("Invalid token received from server");

          tokenService.setAccessToken(tokenValue);

          // Lấy authorities từ tokenService (decode JWT)
          const authorities = tokenService.getAuthorities();
          const tokenInfo = tokenService.getUserInfo();

          // Extract expiry date nếu có
          let expiryDate: Date | null = null;
          const token = tokenService.getAccessToken();
          if (token) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const decoded: any = tokenService.decodeToken(token);
              if (decoded.exp) {
                expiryDate = new Date(decoded.exp * 1000);
              }
            } catch {
              /* empty */
            }
          }

          // User info
          const user: User = {
            id: tokenInfo?.userId || "",
            username:
              tokenInfo?.username || tokenInfo?.email?.split("@")[0] || "user",
            email: tokenInfo?.email || credentials.email || "",
            phoneNumber: tokenInfo?.phoneNumber, // Đã đồng bộ phoneNumber
            birthYear: tokenInfo?.birthYear, // Thêm dòng này để đồng bộ birthYear
          };

          // Đồng bộ: clear cart-storage, address-book-storage, user khi login
          localStorage.removeItem("cart-storage");
          localStorage.removeItem("address-book-storage");
          localStorage.removeItem("user");

          set({
            isAuthenticated: true,
            user: user,
            token: tokenValue,
            tokenExpiry: expiryDate,
            authorities,
            isLoading: false,
          });

          // Sau khi login thành công, đồng bộ cart từ backend
          try {
            const useCartStore = (await import("./cartStore")).default;
            await useCartStore.getState().syncWithServer();
          } catch (cartSyncError) {
            // Nếu đồng bộ cart lỗi, chỉ log warning, không chặn login
            console.warn(
              "[authStore] Sync cart after login failed:",
              cartSyncError,
            );
          }
          // Đồng bộ địa chỉ từ BE về store sau login
          try {
            const { useAddressBookStore } = await import("./addressBookStore");
            const { addressApi } = await import("../services/apiService");
            if (user.id) {
              const addressesFromBE = await addressApi.getByAccountId(user.id);
              useAddressBookStore.getState().setAddresses(addressesFromBE);
            }
          } catch (addressSyncError) {
            console.warn(
              "[authStore] Sync address after login failed:",
              addressSyncError,
            );
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Login failed",
          });
        }
      },
      loginWithGoogle: async (_googleAuthRequest: GoogleAuthRequestDTO) => {
        set({ isLoading: true, error: null });
        try {
          // Simulated API response
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const mockUser: User = {
            id: "550e8400-e29b-41d4-a716-446655440001",
            username: "googleuser",
            email: "googleuser@gmail.com",
            avatar: "https://lh3.googleusercontent.com/a/default-user",
          };
          const mockToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDEiLCJlbWFpbCI6Imdvb2dsZXVzZXJAZ21haWwuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
          const expiryDateGoogle = new Date();
          expiryDateGoogle.setHours(expiryDateGoogle.getHours() + 24);
          const mockAuthorities = ["ROLE_USER"];
          localStorage.setItem("accessToken", mockToken);
          set({
            isAuthenticated: true,
            user: mockUser,
            token: mockToken,
            tokenExpiry: expiryDateGoogle,
            authorities: mockAuthorities,
            isLoading: false,
          });
        } catch (e) {
          set({
            isLoading: false,
            error: e instanceof Error ? e.message : "Google login failed",
          });
        }
      },

      logout: () => {
        // Remove token from localStorage
        localStorage.removeItem("accessToken");
        // Đồng bộ: clear cart-storage, address-book-storage, user khi logout
        localStorage.removeItem("cart-storage");
        localStorage.removeItem("address-book-storage");
        localStorage.removeItem("user");

        set({
          isAuthenticated: false,
          user: null,
          token: null,
          tokenExpiry: null,
          authorities: [],
          error: null,
        });
      },
      register: async (userData: AccountRequestDTO) => {
        set({ isLoading: true, error: null });
        try {
          // Gọi API BE để đăng ký tài khoản
          const res = await accountApi.signup(userData);
          set({ isLoading: false });
          return res;
        } catch (e) {
          set({
            isLoading: false,
            error: e instanceof Error ? e.message : "Registration failed",
          });
          throw e;
        }
      },
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({
          user: {
            ...currentUser,
            ...userData,
          },
        });
      },
      refreshToken: async () => {
        if (!get().isAuthenticated || !get().token) {
          return;
        }
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const mockToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyLCJyZWZyZXNoZWQiOnRydWV9.4pcPyMD-V_ddkjf93-k4kA2XzQyZvkLvH9tQ-_QQ0b0";
          const expiryDateRefresh = new Date();
          expiryDateRefresh.setHours(expiryDateRefresh.getHours() + 24);
          set({
            token: mockToken,
            tokenExpiry: expiryDateRefresh,
            isLoading: false,
          });
        } catch (e) {
          console.error("Token refresh failed:", e);
          get().logout();
        }
      },
      checkAuthStatus: async () => {
        const tokenExpiry = get().tokenExpiry;
        const now = new Date();
        if (tokenExpiry && now > tokenExpiry) {
          try {
            await get().refreshToken();
            return true;
          } catch (e) {
            get().logout();
            return false;
          }
        }
        return get().isAuthenticated;
      },
    }),
    {
      name: "auth-storage", // unique name for localStorage
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        tokenExpiry: state.tokenExpiry,
        authorities: state.authorities,
      }),
    },
  ),
);

// Middleware to check token expiration on app startup
const checkAuthOnInit = () => {
  const { checkAuthStatus, user, isAuthenticated } = useAuthStore.getState();
  checkAuthStatus()
    .then(async (isAuth) => {
      if (isAuth && user?.id) {
        try {
          const { useAddressBookStore } = await import("./addressBookStore");
          const { addressApi } = await import("../services/apiService");
          const addressesFromBE = await addressApi.getByAccountId(user.id);
          useAddressBookStore.getState().setAddresses(addressesFromBE);
        } catch (err) {
          console.warn("[authStore] Sync address on app init failed:", err);
        }
      }
      console.log(
        "Auth status checked:",
        isAuth ? "Authenticated" : "Not authenticated",
      );
    })
    .catch((err) => {
      console.error("Error checking auth status:", err);
    });
};

checkAuthOnInit(); // Run the check when the module is imported

export default useAuthStore;
