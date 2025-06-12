import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import {
  FiUser,
  FiLogIn,
  FiLogOut,
  FiUserPlus,
  FiShoppingBag,
  FiHeart,
  FiSettings,
  FiChevronRight,
} from "react-icons/fi";

interface UserMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ anchorEl, open, onClose }) => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Xử lý click ra ngoài để đóng menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose, anchorEl]);
  // Xử lý vị trí của dropdown - Improved positioning
  const getDropdownPosition = () => {
    if (!anchorEl) return { top: 0, left: 0 };
    
    const rect = anchorEl.getBoundingClientRect();
    const menuWidth = 240; // Updated menu width
    
    // Check if menu would go off-screen on the right
    let left = rect.right - menuWidth + window.scrollX;
    if (left < 10) { // Add padding from screen edge
      left = rect.left + window.scrollX;
    }
    
    return {
      top: rect.bottom + 8 + window.scrollY, // Add gap between anchor and menu
      left: Math.max(10, left), // Ensure menu doesn't go off-screen
    };
  };

  const position = getDropdownPosition();

  if (!open) return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Add small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      logout();
      onClose();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleMenuItemClick = () => {
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="absolute z-50 min-w-[200px] rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <div className="py-1">
        {isAuthenticated ? (
          <>
            {" "}
            <div className="px-4 py-3">
              <p className="text-sm">Đăng nhập với</p>
              <p className="truncate text-sm font-medium text-gray-900">
                {user?.email}
              </p>
              {user?.phone && (
                <p className="mt-1 truncate text-xs text-gray-600">
                  {user.phone}
                </p>
              )}
            </div>
            <hr />
            <Link
              to="/account"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleMenuItemClick}
            >
              <FiUser className="mr-3" /> Tài khoản của tôi
            </Link>
            <Link
              to="/orders"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleMenuItemClick}
            >
              <FiShoppingBag className="mr-3" /> Đơn hàng
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleMenuItemClick}
            >
              <FiHeart className="mr-3" /> Danh sách yêu thích
            </Link>
            <Link
              to="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleMenuItemClick}
            >
              <FiSettings className="mr-3" /> Cài đặt
            </Link>
            <hr />
            <button
              className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleLogout}
            >
              <FiLogOut className="mr-3" /> Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login/standalone"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleMenuItemClick}
            >
              <FiLogIn className="mr-3" /> Đăng nhập
            </Link>
            <Link
              to="/register/standalone"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleMenuItemClick}
            >
              <FiUserPlus className="mr-3" /> Đăng ký
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default UserMenu;
