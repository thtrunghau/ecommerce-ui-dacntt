// src/pages/StripeSuccess.tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const StripeSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = searchParams.get("orderId");

    if (orderId) {
      toast.success("Thanh toán thành công! Đang chuyển về chi tiết đơn hàng...");
      setTimeout(() => {
        navigate(`/orders/${orderId}`, { replace: true });
      }, 1200);
    } else {
      toast.success("Thanh toán thành công! Đang chuyển về trang chủ...");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1200);
    }
  }, [navigate, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center mt-20 text-center text-lg">
      <p>Thanh toán thành công! Đang xử lý...</p>
    </div>
  );
};

export default StripeSuccess;
