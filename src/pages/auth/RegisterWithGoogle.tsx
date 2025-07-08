import React, { useState } from "react";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../../store/authStore";
import type { GoogleSignupResult } from "../../types/google";

const RegisterWithGoogle: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  // Lưu idToken tạm thời trong state
  const [idToken, setIdToken] = useState<string | null>(null);

  const handleSuccess = async (
    result: GoogleSignupResult & { idToken?: string },
  ) => {
    setLoading(true);
    setError(null);
    try {
      if (result.idToken) setIdToken(result.idToken);
      // Đăng nhập luôn sau khi đăng ký thành công sử dụng authStore
      try {
        await loginWithGoogle({
          idToken: result.idToken || idToken || "",
        });
        toast.success("Đăng ký & đăng nhập Google thành công!");
        navigate("/profile");
      } catch (err) {
        toast.error("Không thể đăng nhập sau khi đăng ký Google.");
        console.error("Login error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  function getErrorMessage(err: unknown): string {
    if (typeof err === "object" && err && "message" in err) {
      const msg = (err as { message?: string }).message;
      if (typeof msg === "string") {
        if (msg.includes("Conflict"))
          return "Email hoặc tài khoản Google đã tồn tại.";
        return msg;
      }
    }
    return "Đăng ký Google thất bại.";
  }

  const handleError = (err: unknown) => {
    const msg = getErrorMessage(err);
    setError(msg);
    toast.error(msg);
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
          Đăng ký với Google
        </h2>
        {loading ? (
          <div
            style={{ color: "#388e3c", textAlign: "center", margin: "24px 0" }}
          >
            Đang xử lý đăng ký & đăng nhập Google...
          </div>
        ) : (
          <GoogleLoginButton
            type="signup"
            onSuccess={(res) =>
              handleSuccess(res as GoogleSignupResult & { idToken?: string })
            }
            onError={handleError}
          />
        )}
        {error && (
          <div style={{ color: "#d32f2f", marginTop: 16, textAlign: "center" }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterWithGoogle;
