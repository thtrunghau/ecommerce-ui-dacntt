import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const StripeCancel: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.error("Thanh toán thất bại hoặc bị hủy. Đang chuyển về trang chủ...");
    const timeout = setTimeout(() => {
      navigate("/");
    }, 2500);
    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: 80,
        fontSize: 20,
        color: "#d32f2f",
      }}
    >
      Thanh toán thất bại hoặc bị hủy. Đang chuyển về trang chủ...
    </div>
  );
};

export default StripeCancel;
