import React from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { accountApi } from "../../services/apiService";
import useAuthStore from "../../store/authStore";

// User type copied from authStore (not exported)
type User = {
  id: string;
  username: string;
  email: string;
  birthYear?: number;
  phoneNumber?: string;
  avatar?: string;
};

interface GoogleLoginButtonProps {
  type?: "login" | "signup"; // login: đăng nhập, signup: đăng ký
  onSuccess: (res: {
    idToken: string;
    user: User | null;
    token: string | null;
  }) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError?: (err: any) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  type = "login",
  onSuccess,
  onError,
}) => {
  const handleGoogleLogin = async (idToken: string) => {
    console.log("[GoogleLoginButton] handleGoogleLogin CALLED", idToken);
    try {
      await useAuthStore.getState().loginWithGoogle({ idToken });
      const { user, token } = useAuthStore.getState();
      onSuccess({ idToken, user, token });
    } catch (err: unknown) {
      let message = "";
      if (
        typeof err === "object" &&
        err &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        message = (err as { message: string }).message;
      } else {
        message = String(err);
      }
      if (
        message.includes("401") ||
        message.toLowerCase().includes("unauthorized")
      ) {
        try {
          await accountApi.signupWithGoogle({ idToken });
          await useAuthStore.getState().loginWithGoogle({ idToken });
          const { user, token } = useAuthStore.getState();
          onSuccess({ idToken, user, token });
        } catch (signupErr) {
          onError?.(signupErr);
        }
      } else {
        onError?.(err);
      }
    }
  };

  return (
    <GoogleLogin
      onSuccess={(credentialResponse: CredentialResponse) => {
        console.log(
          "[GoogleLoginButton] onSuccess callback",
          credentialResponse,
        );
        if (credentialResponse.credential) {
          handleGoogleLogin(credentialResponse.credential);
        } else {
          onError?.(new Error("Không nhận được idToken từ Google"));
        }
      }}
      onError={() => {
        onError?.(new Error("Đăng nhập Google thất bại."));
      }}
      text={type === "signup" ? "signup_with" : "signin_with"}
      width="100%"
      locale="vi"
      theme="outline"
      size="large"
      shape="rectangular"
      logo_alignment="left"
    />
  );
};

export default GoogleLoginButton;
