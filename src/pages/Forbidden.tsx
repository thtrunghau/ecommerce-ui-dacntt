import { Link } from "react-router-dom";
import ErrorState from "../components/common/ErrorState";

/**
 * Trang Forbidden (403)
 *
 * Hiển thị khi user không có đủ quyền để truy cập một trang
 */
const Forbidden = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-6 py-12">
      <div className="w-full max-w-md text-center">
        <ErrorState
          message="Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn tin rằng đây là lỗi."
          className="mb-8"
        />
        <div className="flex justify-center space-x-4">
          <Link
            to="/"
            className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white transition duration-150 hover:bg-blue-700"
          >
            Trở về trang chủ
          </Link>
          <Link
            to="/auth/login"
            className="rounded-md bg-gray-200 px-6 py-3 font-medium text-gray-800 transition duration-150 hover:bg-gray-300"
          >
            Đăng nhập lại
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
