import React from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

interface GoogleLoginButtonProps {
  type?: "login" | "signup"; // login: đăng nhập, signup: đăng ký
  onSuccess: (res: { idToken: string }) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError?: (err: any) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  type = "login",
  onSuccess,
  onError,
}) => {
  return (
    <GoogleLogin
      onSuccess={(credentialResponse: CredentialResponse) => {
        if (credentialResponse.credential) {
          onSuccess({ idToken: credentialResponse.credential });
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
    />
  );
};

export default GoogleLoginButton;
