import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const StripeSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (orderId) {
      toast.success(
        "Thanh toán thành công! Đang chuyển về chi tiết đơn hàng...",
      );
      navigate(`/orders/${orderId}`);
    } else {
      toast.success("Thanh toán thành công! Đang chuyển về trang chủ...");
      navigate("/");
    }
  }, [navigate, searchParams]);

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: 80,
        fontSize: 20,
      }}
    >
      Thanh toán thành công! Đang xử lý...
    </div>
  );
};

export default StripeSuccess;
