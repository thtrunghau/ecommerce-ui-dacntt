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
            <h3 className="mb-4 text-lg font-bold">Samsung</h3>
            <p className="mb-4 text-sm text-gray-300">
              Công nghệ hàng đầu thế giới với những sản phẩm đa dạng từ điện
              thoại di động đến thiết bị điện tử gia dụng.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/SamsungVietnam"
                className="text-gray-300 transition-colors hover:text-white"
              >
                <FiFacebook size={20} />
              </a>
              <a
                href="https://instagram.com/samsungvietnam"
                className="text-gray-300 transition-colors hover:text-white"
              >
                <FiInstagram size={20} />
              </a>
              <a
                href="https://youtube.com/SamsungVietnam"
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
            <h3 className="mb-4 text-lg font-bold">Sản phẩm</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/di-dong"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Di động
                </Link>
              </li>
              <li>
                <Link
                  to="/tv-av"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  TV & AV
                </Link>
              </li>
              <li>
                <Link
                  to="/gia-dung"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Gia dụng
                </Link>
              </li>
              <li>
                <Link
                  to="/it"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  IT
                </Link>
              </li>
              <li>
                <Link
                  to="/phu-kien"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Phụ kiện
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
                  Tòa nhà Samsung, 10 Nguyễn Huệ, Quận 1, TP.HCM
                </span>
              </li>
              <li className="flex items-center">
                <FiPhone className="mr-2 text-gray-400" />
                <span className="text-gray-300">1800-588-889</span>
              </li>
              <li className="flex items-center">
                <FiMail className="mr-2 text-gray-400" />
                <span className="text-gray-300">support@samsung.com.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-6 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Samsung Electronics Vietnam. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
