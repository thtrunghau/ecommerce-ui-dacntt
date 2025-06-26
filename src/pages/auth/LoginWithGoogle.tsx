/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";
import { useNavigate } from "react-router-dom";

const LoginWithGoogle: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSuccess = (token: unknown) => {
    // Lưu accessToken vào localStorage nếu có
    if (token && typeof token === "object" && "accessToken" in token) {
      localStorage.setItem("accessToken", (token as any).accessToken);
      navigate("/"); // Chuyển hướng về trang chủ hoặc dashboard
    } else {
      setError("Đăng nhập thành công nhưng không lấy được token.");
    }
  };

  const handleError = (err: unknown) => {
    setError("Đăng nhập Google thất bại.");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          maxWidth: 360,
          width: "100%",
          padding: 32,
          border: "1px solid #eee",
          borderRadius: 12,
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#111", marginBottom: 24 }}>
          Đăng nhập với Google
        </h2>
        <GoogleLoginButton
          type="login"
          onSuccess={handleSuccess}
          onError={handleError}
        />
        {error && (
          <div style={{ color: "#d32f2f", marginTop: 16, textAlign: "center" }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginWithGoogle;
