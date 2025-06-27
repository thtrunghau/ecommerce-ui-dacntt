import { GoogleLogin } from "@react-oauth/google";
import { accountApi, authApi } from "../../services/apiService";
import React from "react";
import type { GoogleLoginResult, GoogleSignupResult } from "../../types/google";

interface GoogleLoginButtonProps {
  type?: "login" | "signup"; // login: đăng nhập, signup: đăng ký
  onSuccess?: (result: GoogleLoginResult | GoogleSignupResult) => void;
  onError?: (error: unknown) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  type = "login",
  onSuccess,
  onError,
}) => {
  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      onError?.(new Error("Không nhận được idToken từ Google."));
      return;
    }
    try {
      if (type === "login") {
        const token = await authApi.loginWithGoogle({ idToken });
        onSuccess?.({ accessToken: token.accessToken ?? "" });
      } else {
        // Đăng ký Google, sau đó tự động đăng nhập luôn
        const user = await accountApi.signupWithGoogle({ idToken });
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
      }
    } catch (err) {
      onError?.(err);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => onError && onError(new Error("Google login failed"))}
      useOneTap
    />
  );
};

export default GoogleLoginButton;
