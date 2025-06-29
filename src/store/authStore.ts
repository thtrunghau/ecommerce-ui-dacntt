/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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
import useCartStore from "./cartStore";

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
      loginWithGoogle: async (googleAuthRequest: GoogleAuthRequestDTO) => {
        set({ isLoading: true, error: null });
        try {
          const token = await (
            await import("../services/apiService")
          ).authApi.loginWithGoogle(googleAuthRequest);
          // Ưu tiên lấy accessToken, nếu không có thì lấy token.tokenValue
          const accessToken = token.accessToken || token.token?.tokenValue;
          if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
            tokenService.setAccessToken(accessToken);
          }

          // Decode user info từ JWT accessToken
          type DecodedToken = {
            sub?: string;
            userId?: string;
            username?: string;
            email?: string;
            phoneNumber?: string;
            birthYear?: number;
            authorities?: string | { authority?: string }[];
            exp?: number;
            [key: string]: unknown;
          };
          let tokenInfo: DecodedToken | null = null;
          let expiryDate: Date | null = null;
          if (accessToken) {
            try {
              const decoded = tokenService.decodeToken(
                accessToken,
              ) as DecodedToken;
              tokenInfo = decoded;
              if (decoded.exp) {
                expiryDate = new Date(decoded.exp * 1000);
              }
            } catch (decodeErr) {
              // ignore decode error
            }
          }

          // User info từ claims
          const user: User = {
            id: tokenInfo?.sub || tokenInfo?.userId || "",
            username:
              tokenInfo?.username ||
              tokenInfo?.email?.split("@")?.[0] ||
              "user",
            email: tokenInfo?.email || "",
            phoneNumber: tokenInfo?.phoneNumber,
            birthYear: tokenInfo?.birthYear,
          };

          // Đồng bộ: clear cart-storage, address-book-storage, user khi login
          localStorage.removeItem("cart-storage");
          localStorage.removeItem("address-book-storage");
          localStorage.removeItem("user");

          // authorities: chuẩn hóa về mảng string
          let authorities: string[] = [];
          if (Array.isArray(tokenInfo?.authorities)) {
            authorities = (
              tokenInfo.authorities as { authority?: string }[]
            ).map((a) => (typeof a === "string" ? a : a.authority || ""));
          } else if (typeof tokenInfo?.authorities === "string") {
            authorities = [tokenInfo.authorities];
          } else if (Array.isArray(token.authorities)) {
            authorities = token.authorities.map(
              (a: { authority?: string } | string) =>
                typeof a === "string" ? a : a.authority || "",
            );
          }

          set({
            isAuthenticated: true,
            user: user,
            token: accessToken || null,
            tokenExpiry: expiryDate,
            authorities,
            isLoading: false,
            error: null,
          });
          // Thêm log debug trạng thái auth sau khi set
          console.log("[authStore] Auth state after Google login:", get());

          // Sau khi login thành công, đồng bộ cart từ backend
          try {
            const useCartStore = (await import("./cartStore")).default;
            await useCartStore.getState().syncWithServer();
          } catch (cartSyncError) {
            console.warn(
              "[authStore] Sync cart after Google login failed:",
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
              "[authStore] Sync address after Google login failed:",
              addressSyncError,
            );
          }
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Google login failed",
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
        // Clear cart state
        useCartStore.getState().resetCart();
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
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          try {
            tokenService.setAccessToken(accessToken);
            type DecodedToken = {
              sub?: string;
              userId?: string;
              username?: string;
              email?: string;
              phoneNumber?: string;
              birthYear?: number;
              authorities?: string | { authority?: string }[];
              exp?: number;
              [key: string]: unknown;
            };
            const decoded = tokenService.decodeToken(
              accessToken,
            ) as DecodedToken;
            const user: User = {
              id: decoded.sub || decoded.userId || "",
              username:
                decoded.username || decoded.email?.split("@")?.[0] || "user",
              email: decoded.email || "",
              phoneNumber: decoded.phoneNumber,
              birthYear: decoded.birthYear,
            };
            let authorities: string[] = [];
            if (Array.isArray(decoded.authorities)) {
              authorities = (
                decoded.authorities as { authority?: string }[]
              ).map((a) => (typeof a === "string" ? a : a.authority || ""));
            } else if (typeof decoded.authorities === "string") {
              authorities = [decoded.authorities];
            }
            set({
              isAuthenticated: true,
              user,
              token: accessToken,
              tokenExpiry: decoded.exp ? new Date(decoded.exp * 1000) : null,
              authorities,
              isLoading: false,
              error: null,
            });
            return true;
          } catch {
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              tokenExpiry: null,
              authorities: [],
              isLoading: false,
              error: null,
            });
            return false;
          }
        } else {
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            tokenExpiry: null,
            authorities: [],
            isLoading: false,
            error: null,
          });
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
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
