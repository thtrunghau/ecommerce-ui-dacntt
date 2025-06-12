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
  }, [open, onClose, anchorEl]);  // Xử lý vị trí của dropdown - Improved positioning với animation
  const getDropdownPosition = () => {
    if (!anchorEl) return { top: 0, left: 0 };
    
    const rect = anchorEl.getBoundingClientRect();
    const menuWidth = 280; // Increased width for better UX
    const menuHeight = isAuthenticated ? 320 : 140; // Estimate height
    
    // Check if menu would go off-screen on the right
    let left = rect.right - menuWidth + window.scrollX;
    if (left < 10) { // Add padding from screen edge
      left = rect.left + window.scrollX;
    }
    
    // Check if menu would go off-screen at the bottom
    let top = rect.bottom + 12 + window.scrollY; // Increased gap
    if (top + menuHeight > window.innerHeight + window.scrollY) {
      top = rect.top - menuHeight - 12 + window.scrollY; // Show above
    }
    
    return {
      top: Math.max(10, top), // Ensure menu doesn't go off-screen at top
      left: Math.max(10, Math.min(left, window.innerWidth - menuWidth - 10)), // Keep within bounds
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
    <>
      {/* Backdrop overlay for better UX */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
        <div
        ref={menuRef}
        className={`absolute z-50 min-w-[280px] rounded-2xl bg-white/95 backdrop-blur-lg shadow-2xl border border-gray-200/50 focus:outline-none transform transition-all duration-300 ease-out ${
          open 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
        }`}
        style={{ 
          top: `${position.top}px`, 
          left: `${position.left}px`,
          transformOrigin: 'top right',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="py-2">
          {isAuthenticated ? (
            <>              {/* User Info Section */}
              <div className="px-5 py-4 border-b border-gray-100/70 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <FiUser className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Đăng nhập với
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-gray-900 truncate">
                      {user?.email}
                    </p>
                    {user?.phone && (
                      <p className="mt-1 text-xs text-gray-600 truncate flex items-center">
                        <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                        {user.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  to="/account"
                  className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                  onClick={handleMenuItemClick}
                >
                  <FiUser className="mr-3 w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  <span className="font-medium">Tài khoản của tôi</span>
                </Link>
                
                <Link
                  to="/orders"
                  className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                  onClick={handleMenuItemClick}
                >
                  <FiShoppingBag className="mr-3 w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  <span className="font-medium">Đơn hàng</span>
                </Link>
                
                <Link
                  to="/wishlist"
                  className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                  onClick={handleMenuItemClick}
                >
                  <FiHeart className="mr-3 w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  <span className="font-medium">Danh sách yêu thích</span>
                </Link>
                
                <Link
                  to="/settings"
                  className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                  onClick={handleMenuItemClick}
                >
                  <FiSettings className="mr-3 w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  <span className="font-medium">Cài đặt</span>
                </Link>
              </div>

              {/* Logout Section */}
              <div className="border-t border-gray-100 pt-1">
                <button
                  className={`group flex w-full items-center px-4 py-3 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 ${
                    isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <FiLogOut className="mr-3 w-4 h-4 text-gray-400 group-hover:text-red-600" />
                  <span className="font-medium">
                    {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="py-1">
                <Link
                  to="/login/standalone"
                  className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                  onClick={handleMenuItemClick}
                >
                  <FiLogIn className="mr-3 w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  <span className="font-medium">Đăng nhập</span>
                  <FiChevronRight className="ml-auto w-4 h-4 text-gray-300 group-hover:text-blue-400" />
                </Link>
                
                <Link
                  to="/register/standalone"
                  className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-150"
                  onClick={handleMenuItemClick}
                >
                  <FiUserPlus className="mr-3 w-4 h-4 text-gray-400 group-hover:text-green-600" />
                  <span className="font-medium">Đăng ký</span>
                  <FiChevronRight className="ml-auto w-4 h-4 text-gray-300 group-hover:text-green-400" />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UserMenu;
