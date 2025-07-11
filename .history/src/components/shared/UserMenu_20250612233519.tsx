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
              </div>              {/* Menu Items */}
              <div className="py-2">
                <Link
                  to="/account"
                  className="group flex items-center px-5 py-3.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 hover:text-blue-700 transition-all duration-200 relative overflow-hidden"
                  onClick={handleMenuItemClick}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all duration-300"></div>
                  <FiUser className="mr-3 w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-200" />
                  <span className="font-medium relative z-10">Tài khoản của tôi</span>
                </Link>
                
                <Link
                  to="/orders"
                  className="group flex items-center px-5 py-3.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100/50 hover:text-orange-700 transition-all duration-200 relative overflow-hidden"
                  onClick={handleMenuItemClick}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-orange-500/10 transition-all duration-300"></div>
                  <FiShoppingBag className="mr-3 w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:scale-110 transition-all duration-200" />
                  <span className="font-medium relative z-10">Đơn hàng</span>
                </Link>
                
                <Link
                  to="/wishlist"
                  className="group flex items-center px-5 py-3.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-pink-100/50 hover:text-pink-700 transition-all duration-200 relative overflow-hidden"
                  onClick={handleMenuItemClick}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 to-pink-500/0 group-hover:from-pink-500/5 group-hover:to-pink-500/10 transition-all duration-300"></div>
                  <FiHeart className="mr-3 w-5 h-5 text-gray-400 group-hover:text-pink-600 group-hover:scale-110 transition-all duration-200" />
                  <span className="font-medium relative z-10">Danh sách yêu thích</span>
                </Link>
                
                <Link
                  to="/settings"
                  className="group flex items-center px-5 py-3.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 hover:text-gray-700 transition-all duration-200 relative overflow-hidden"
                  onClick={handleMenuItemClick}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-500/0 to-gray-500/0 group-hover:from-gray-500/5 group-hover:to-gray-500/10 transition-all duration-300"></div>
                  <FiSettings className="mr-3 w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:scale-110 group-hover:rotate-45 transition-all duration-200" />
                  <span className="font-medium relative z-10">Cài đặt</span>
                </Link>
              </div>              {/* Logout Section */}
              <div className="border-t border-gray-100/70 pt-2">
                <button
                  className={`group flex w-full items-center px-5 py-3.5 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 hover:text-red-700 transition-all duration-200 relative overflow-hidden ${
                    isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-red-500/10 transition-all duration-300"></div>
                  <FiLogOut className={`mr-3 w-5 h-5 text-gray-400 group-hover:text-red-600 transition-all duration-200 ${
                    isLoggingOut ? 'animate-spin' : 'group-hover:scale-110'
                  }`} />
                  <span className="font-medium relative z-10">
                    {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                  </span>
                </button>
              </div>
            </>          ) : (
            <>
              <div className="py-2">
                <div className="px-5 py-3 text-center border-b border-gray-100/70">
                  <p className="text-sm font-semibold text-gray-700">Chào mừng bạn!</p>
                  <p className="text-xs text-gray-500 mt-1">Đăng nhập để trải nghiệm đầy đủ</p>
                </div>
                
                <Link
                  to="/login/standalone"
                  className="group flex items-center px-5 py-4 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 hover:text-blue-700 transition-all duration-200 relative overflow-hidden"
                  onClick={handleMenuItemClick}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all duration-300"></div>
                  <FiLogIn className="mr-3 w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-200" />
                  <span className="font-semibold relative z-10">Đăng nhập</span>
                  <FiChevronRight className="ml-auto w-4 h-4 text-gray-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200" />
                </Link>
                
                <Link
                  to="/register/standalone"
                  className="group flex items-center px-5 py-4 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 hover:text-green-700 transition-all duration-200 relative overflow-hidden"
                  onClick={handleMenuItemClick}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-green-500/10 transition-all duration-300"></div>
                  <FiUserPlus className="mr-3 w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:scale-110 transition-all duration-200" />
                  <span className="font-semibold relative z-10">Đăng ký tài khoản</span>
                  <FiChevronRight className="ml-auto w-4 h-4 text-gray-300 group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-200" />
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
