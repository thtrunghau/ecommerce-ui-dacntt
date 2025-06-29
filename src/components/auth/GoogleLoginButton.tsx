import React, { useCallback } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { accountApi, authApi } from "../../services/apiService";
import type { GoogleLoginResult, GoogleSignupResult } from "../../types/google";

interface GoogleLoginButtonProps {
  /**
   * Loại thao tác: 'login' cho đăng nhập, 'signup' cho đăng ký
   * @default 'login'
   */
  type?: "login" | "signup";

  /**
   * Callback khi đăng nhập/đăng ký thành công
   */
  onSuccess?: (result: GoogleLoginResult | GoogleSignupResult) => void;

  /**
   * Callback khi có lỗi xảy ra
   */
  onError?: (error: unknown) => void;

  /**
   * Có sử dụng One Tap không
   * @default true
   */
  useOneTap?: boolean;

  /**
   * Văn bản hiển thị trên nút
   */
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";

  /**
   * Custom className cho wrapper
   */
  className?: string;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  type = "login",
  onSuccess,
  onError,
  useOneTap = true,
  text = "signin_with",
  className = "",
}) => {
  /**
   * Xử lý đăng nhập Google
   */
  const handleLogin = useCallback(
    async (idToken: string) => {
      try {
        const token = await authApi.loginWithGoogle({ idToken });
        onSuccess?.({ accessToken: token.accessToken ?? "" });
      } catch (error) {
        throw new Error(`Đăng nhập thất bại: ${error}`);
      }
    },
    [onSuccess],
  );

  /**
   * Xử lý đăng ký Google
   */
  const handleSignup = useCallback(
    async (idToken: string) => {
      try {
        // Đăng ký tài khoản mới
        const user = await accountApi.signupWithGoogle({ idToken });

        // Tự động đăng nhập sau khi đăng ký thành công
        const token = await authApi.loginWithGoogle({ idToken });

        onSuccess?.({
          id: user.id,
          email: user.email,
          username: user.username,
          birthYear: user.birthYear,
          phoneNumber: user.phoneNumber,
          groupId: user.groupId,
          accessToken: token.accessToken ?? "",
        });
      } catch (error) {
        throw new Error(`Đăng ký thất bại: ${error}`);
      }
    },
    [onSuccess],
  );

  /**
   * Xử lý phản hồi thành công từ Google
   */
  const handleSuccess = useCallback(
    async (credentialResponse: { credential?: string }) => {
      const idToken = credentialResponse.credential;

      if (!idToken) {
        const error = new Error("Không nhận được idToken từ Google");
        onError?.(error);
        return;
      }

      try {
        if (type === "login") {
          await handleLogin(idToken);
        } else {
          await handleSignup(idToken);
        }
      } catch (error) {
        onError?.(error);
      }
    },
    [type, handleLogin, handleSignup, onError],
  );

  /**
   * Xử lý lỗi từ Google
   */
  const handleError = useCallback(() => {
    const error = new Error("Google authentication failed");
    onError?.(error);
  }, [onError]);

  return (
    <div className={`mb-4 w-full ${className}`}>
      {/* Custom styled button wrapper để match với nút đăng nhập */}
      <div className="relative flex h-10 w-full items-center justify-center overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm transition-colors focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:bg-gray-50">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={useOneTap}
          text={text}
          theme="outline"
          size="large"
          width="100%"
          shape="rectangular"
        />
      </div>
    </div>
  );
};

export default GoogleLoginButton;
