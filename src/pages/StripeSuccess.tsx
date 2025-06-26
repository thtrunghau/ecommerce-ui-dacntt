import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const StripeSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.success("Thanh toán thành công! Đang chuyển về trang chủ...");
    const timeout = setTimeout(() => {
      navigate("/");
    }, 2000);
    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: 80,
        fontSize: 20,
      }}
    >
      Thanh toán thành công! Đang chuyển về trang chủ...
    </div>
  );
};

export default StripeSuccess;
