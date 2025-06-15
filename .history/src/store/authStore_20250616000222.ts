import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AccountResponseDTO,
  AuthRequestDTO,
  GoogleAuthRequestDTO,
  Token,
  UUID,
  GrantedAuthority,
} from "../types/api";

// In a real app, we would import these API services
// import { authApi, accountApi } from "../services/apiService";

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
  register: (userData: AccountResponseDTO) => Promise<void>;
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
      error: null,

      // Actions
      login: async (credentials: AuthRequestDTO) => {
        set({ isLoading: true, error: null });

        try {
          // In a real app, this would call the API
          // const response = await authApi.login(credentials);

          // Simulated API response
          await new Promise((resolve) => setTimeout(resolve, 800));

          // Mock successful login
          if (
            credentials.email === "admin@example.com" &&
            credentials.password === "password"
          ) {
            const mockUser: User = {
              id: "550e8400-e29b-41d4-a716-446655440000",
              username: "admin",
              email: credentials.email,
              phoneNumber: "0987654321",
            };

            const mockToken =
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 24); // Token expires in 24 hours

            const mockAuthorities = ["ROLE_ADMIN", "ROLE_USER"];

            // Save token to localStorage for API calls
            localStorage.setItem("accessToken", mockToken);

            set({
              isAuthenticated: true,
              user: mockUser,
              token: mockToken,
              tokenExpiry: expiryDate,
              authorities: mockAuthorities,
              isLoading: false,
            });
          } else {
            throw new Error("Invalid credentials");
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
          // In a real app, this would call the API
          // const response = await authApi.loginWithGoogle(googleAuthRequest);

          // Simulated API response
          await new Promise((resolve) => setTimeout(resolve, 1000));

          if (googleAuthRequest.idToken) {
            // Mock successful login
            const mockUser: User = {
              id: "550e8400-e29b-41d4-a716-446655440001",
              username: "googleuser",
              email: "googleuser@gmail.com",
              avatar: "https://lh3.googleusercontent.com/a/default-user",
            };

            const mockToken =
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDEiLCJlbWFpbCI6Imdvb2dsZXVzZXJAZ21haWwuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 24); // Token expires in 24 hours

            const mockAuthorities = ["ROLE_USER"];

            // Save token to localStorage for API calls
            localStorage.setItem("accessToken", mockToken);

            set({
              isAuthenticated: true,
              user: mockUser,
              token: mockToken,
              tokenExpiry: expiryDate,
              authorities: mockAuthorities,
              isLoading: false,
            });
          } else {
            throw new Error("Invalid Google token");
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

        set({
          isAuthenticated: false,
          user: null,
          token: null,
          tokenExpiry: null,
          authorities: [],
          error: null,
        });
      },

      register: async (userData: AccountResponseDTO) => {
        set({ isLoading: true, error: null });

        try {
          // In a real app, this would call the API
          // const response = await accountApi.signup(userData);

          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Mock successful registration and login
          const mockUser: User = {
            id: userData.id || "550e8400-e29b-41d4-a716-446655440002",
            username: userData.username || "newuser",
            email: userData.email || "newuser@example.com",
            birthYear: userData.birthYear,
            phoneNumber: userData.phoneNumber,
          };

          const mockToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDIiLCJlbWFpbCI6Im5ld3VzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

          const expiryDate = new Date();
          expiryDate.setHours(expiryDate.getHours() + 24); // Token expires in 24 hours

          const mockAuthorities = ["ROLE_USER"];

          // Save token to localStorage for API calls
          localStorage.setItem("accessToken", mockToken);

          set({
            isAuthenticated: true,
            user: mockUser,
            token: mockToken,
            tokenExpiry: expiryDate,
            authorities: mockAuthorities,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Registration failed",
          });
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
        // Only try to refresh if we're authenticated and have a token
        if (!get().isAuthenticated || !get().token) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // In a real app, this would call the API
          // const response = await authApi.refreshToken();

          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Mock token refresh
          const mockToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyLCJyZWZyZXNoZWQiOnRydWV9.4pcPyMD-V_ddkjf93-k4kA2XzQyZvkLvH9tQ-_QQ0b0";

          const expiryDate = new Date();
          expiryDate.setHours(expiryDate.getHours() + 24); // New token expires in 24 hours

          // Save new token to localStorage
          localStorage.setItem("accessToken", mockToken);

          set({
            token: mockToken,
            tokenExpiry: expiryDate,
            isLoading: false,
          });
        } catch (error) {
          // If token refresh fails, log the user out
          console.error("Token refresh failed:", error);
          get().logout();
        }
      },

      checkAuthStatus: async () => {
        // Check if the token is expired
        const tokenExpiry = get().tokenExpiry;
        const now = new Date();

        if (tokenExpiry && now > tokenExpiry) {
          try {
            // Try to refresh the token if it's expired
            await get().refreshToken();
            return true;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
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
        // Be careful about what auth data we store in localStorage
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        tokenExpiry: state.tokenExpiry,
        authorities: state.authorities,
        // Don't persist loading state or errors
      }),
    },
  ),
);

// Middleware to check token expiration on app startup
const checkAuthOnInit = () => {
  const { checkAuthStatus } = useAuthStore.getState();
  checkAuthStatus()
    .then((isAuth) => {
      console.log(
        "Auth status checked:",
        isAuth ? "Authenticated" : "Not authenticated",
      );
    })
    .catch((err) => {
      console.error("Error checking auth status:", err);
    });
};

// Run the check when the module is imported
checkAuthOnInit();

export default useAuthStore;
