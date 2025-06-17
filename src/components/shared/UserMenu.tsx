import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import {
  FiUser,
  FiLogIn,
  FiLogOut,
  FiUserPlus,
  FiShoppingBag,
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
  }, [open, onClose, anchorEl]); // Xử lý vị trí của dropdown - Positioned right below avatar and close to header
  const getDropdownPosition = () => {
    if (!anchorEl) return { top: 0, left: 0 };
    const rect = anchorEl.getBoundingClientRect();
    const menuWidth = 260; // Reduced width
    const menuHeight = isAuthenticated ? 350 : 160;
    const margin = 24; // Margin from the right edge

    // Use viewport-relative positioning
    let top = rect.bottom + 4; // Minimal gap for clean look

    // Position from right edge with margin
    let left = window.innerWidth - menuWidth - margin;

    // Ensure menu doesn't go off-screen horizontally
    if (left < 10) {
      left = rect.left + window.scrollX; // Align to left edge of avatar
    }
    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }

    // If menu would go below viewport, show it above the avatar
    if (top + menuHeight > window.innerHeight + window.scrollY - 20) {
      top = rect.top - menuHeight - 4 + window.scrollY;
    }

    return {
      top: Math.max(10, top),
      left: Math.max(10, left),
    };
  };

  const position = getDropdownPosition();

  if (!open) return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Add small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));
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
      <div className="fixed inset-0 z-40" onClick={onClose} />{" "}
      <div
        ref={menuRef}
        className={`fixed z-50 w-[260px] transform rounded-2xl border border-gray-200/50 bg-white/95 shadow-2xl backdrop-blur-lg transition-all duration-300 ease-out focus:outline-none ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        }`}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transformOrigin: "top right",
          boxShadow:
            "0 20px 40px -12px rgba(0, 0, 0, 0.25), 0 8px 16px -8px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="relative py-2">
          {isAuthenticated ? (
            <>
              {" "}
              {/* User Info Section */}
              <div className="border-b border-gray-100/70 bg-gradient-to-r from-blue-50/50 to-purple-50/50 px-5 py-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                      <FiUser className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Đăng nhập với
                    </p>
                    <p className="mt-0.5 truncate text-sm font-bold text-gray-900">
                      {user?.email}
                    </p>
                    {user?.phoneNumber && (
                      <p className="mt-1 flex items-center truncate text-xs text-gray-600">
                        <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-400"></span>
                        {user.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>{" "}
              {/* Menu Items */}
              <div className="py-2">
                <Link
                  to="/account"
                  className="group relative flex items-center overflow-hidden px-5 py-3.5 text-sm text-gray-700 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 hover:text-blue-700"
                  onClick={handleMenuItemClick}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 transition-all duration-300 group-hover:from-blue-500/5 group-hover:to-blue-500/10"></div>
                  <FiUser className="mr-3 h-5 w-5 text-gray-400 transition-all duration-200 group-hover:scale-110 group-hover:text-blue-600" />
                  <span className="relative z-10 font-medium">
                    Tài khoản của tôi
                  </span>
                </Link>

                <Link
                  to="/orders"
                  className="group relative flex items-center overflow-hidden px-5 py-3.5 text-sm text-gray-700 transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100/50 hover:text-orange-700"
                  onClick={handleMenuItemClick}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-500/0 transition-all duration-300 group-hover:from-orange-500/5 group-hover:to-orange-500/10"></div>
                  <FiShoppingBag className="mr-3 h-5 w-5 text-gray-400 transition-all duration-200 group-hover:scale-110 group-hover:text-orange-600" />
                  <span className="relative z-10 font-medium">Đơn hàng</span>
                </Link>
              </div>{" "}
              {/* Logout Section */}
              <div className="border-t border-gray-100/70 pt-2">
                <button
                  className={`group relative flex w-full items-center overflow-hidden px-5 py-3.5 text-left text-sm text-gray-700 transition-all duration-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 hover:text-red-700 ${
                    isLoggingOut ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/0 transition-all duration-300 group-hover:from-red-500/5 group-hover:to-red-500/10"></div>
                  <FiLogOut
                    className={`mr-3 h-5 w-5 text-gray-400 transition-all duration-200 group-hover:text-red-600 ${
                      isLoggingOut ? "animate-spin" : "group-hover:scale-110"
                    }`}
                  />
                  <span className="relative z-10 font-medium">
                    {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="py-2">
                <div className="border-b border-gray-100/70 px-5 py-3 text-center">
                  <p className="text-sm font-semibold text-gray-700">
                    Chào mừng bạn!
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Đăng nhập để trải nghiệm đầy đủ
                  </p>
                </div>{" "}
                <Link
                  to="/auth/login"
                  className="group relative flex items-center overflow-hidden px-5 py-4 text-sm text-gray-700 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 hover:text-blue-700"
                  onClick={handleMenuItemClick}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 transition-all duration-300 group-hover:from-blue-500/5 group-hover:to-blue-500/10"></div>
                  <FiLogIn className="mr-3 h-5 w-5 text-gray-400 transition-all duration-200 group-hover:scale-110 group-hover:text-blue-600" />
                  <span className="relative z-10 font-semibold">Đăng nhập</span>
                  <FiChevronRight className="ml-auto h-4 w-4 text-gray-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-blue-400" />
                </Link>
                <Link
                  to="/auth/register"
                  className="group relative flex items-center overflow-hidden px-5 py-4 text-sm text-gray-700 transition-all duration-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 hover:text-green-700"
                  onClick={handleMenuItemClick}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-green-500/0 transition-all duration-300 group-hover:from-green-500/5 group-hover:to-green-500/10"></div>
                  <FiUserPlus className="mr-3 h-5 w-5 text-gray-400 transition-all duration-200 group-hover:scale-110 group-hover:text-green-600" />
                  <span className="relative z-10 font-semibold">
                    Đăng ký tài khoản
                  </span>
                  <FiChevronRight className="ml-auto h-4 w-4 text-gray-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-green-400" />
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
