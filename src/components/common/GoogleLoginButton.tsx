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

const GoogleLoginButton: React.FC<
  GoogleLoginButtonProps & { forceOneTap?: boolean }
> = ({ type = "login", onSuccess, onError, forceOneTap = true }) => {
  const handleGoogleLogin = async (idToken: string) => {
    if (type === "signup") {
      // Chỉ đăng ký Google khi ở trang đăng ký
      try {
        const userRes = await accountApi.signupWithGoogle({ idToken });
        // Map về User type (ép username/email về string)
        const user = {
          id: userRes.id,
          username: userRes.username || "",
          email: userRes.email || "",
          birthYear: userRes.birthYear,
          phoneNumber: userRes.phoneNumber,
          avatar: undefined,
        };
        onSuccess({ idToken, user, token: null });
      } catch (err) {
        onError?.(err);
      }
      return;
    }
    console.log("[GoogleLoginButton] handleGoogleLogin CALLED", idToken);
    try {
      await useAuthStore.getState().loginWithGoogle({ idToken });
      const { user, token } = useAuthStore.getState();
      onSuccess({ idToken, user, token });
    } catch (err: unknown) {
      onError?.(err);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#888",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        hoặc đăng ký nhanh bằng Google
      </div>
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
        useOneTap={forceOneTap}
      />
    </div>
  );
};

export default GoogleLoginButton;
