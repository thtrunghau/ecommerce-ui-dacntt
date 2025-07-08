import React from "react";
import { useNavigate } from "react-router-dom";
import ErrorState from "../components/common/ErrorState";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16">
      <ErrorState
        message="Không tìm thấy trang. Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển."
        className="min-h-[400px] rounded-xl bg-white p-12 shadow-sm"
        onRetry={() => navigate("/")}
        buttonText="Quay lại trang chủ"
      />
    </div>
  );
};

export default NotFound;
