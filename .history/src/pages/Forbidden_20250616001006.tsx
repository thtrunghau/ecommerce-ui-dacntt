import { Link } from "react-router-dom";

/**
 * Trang Forbidden (403)
 * 
 * Hiển thị khi user không có đủ quyền để truy cập một trang
 */
const Forbidden = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-6 py-12">
      <div className="max-w-md w-full text-center">
        <div className="text-9xl font-bold text-red-500 mb-4">403</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Truy cập bị từ chối</h1>
        <p className="text-gray-600 mb-8">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn tin rằng đây là lỗi.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-150"
          >
            Trở về trang chủ
          </Link>
          <Link
            to="/auth/login"
            className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition duration-150"
          >
            Đăng nhập lại
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
