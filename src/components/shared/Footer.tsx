import { Link } from "react-router-dom";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiFacebook,
  FiInstagram,
  FiYoutube,
} from "react-icons/fi";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Tech Zone</h3>
            <p className="mb-4 text-sm text-gray-300">
              Nơi hội tụ công nghệ hàng đầu với đa dạng sản phẩm từ điện thoại,
              laptop đến các thiết bị công nghệ hiện đại, mang đến trải nghiệm
              mua sắm tuyệt vời nhất.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/TechZoneVN"
                className="text-gray-300 transition-colors hover:text-white"
              >
                <FiFacebook size={20} />
              </a>
              <a
                href="https://instagram.com/techzonevn"
                className="text-gray-300 transition-colors hover:text-white"
              >
                <FiInstagram size={20} />
              </a>
              <a
                href="https://youtube.com/TechZoneVN"
                className="text-gray-300 transition-colors hover:text-white"
              >
                <FiYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Trung tâm hỗ trợ
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Danh mục sản phẩm</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/smartphones"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Điện thoại
                </Link>
              </li>
              <li>
                <Link
                  to="/laptops"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Laptop
                </Link>
              </li>
              <li>
                <Link
                  to="/tablets"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Máy tính bảng
                </Link>
              </li>
              <li>
                <Link
                  to="/accessories"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Phụ kiện
                </Link>
              </li>
              <li>
                <Link
                  to="/smartwatch"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Đồng hồ thông minh
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Liên hệ</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start">
                <FiMapPin className="mr-2 mt-1 text-gray-400" />
                <span className="text-gray-300">
                  Tầng 12, Tòa nhà Tech Tower, 123 Nguyễn Văn Cừ, Q.5, TP.HCM
                </span>
              </li>
              <li className="flex items-center">
                <FiPhone className="mr-2 text-gray-400" />
                <span className="text-gray-300">1900-1234</span>
              </li>
              <li className="flex items-center">
                <FiMail className="mr-2 text-gray-400" />
                <span className="text-gray-300">support@techzone.com.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-6 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Tech Zone Vietnam. Tất cả các
            quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
