import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const adminNav = [
  { label: "Dashboard", to: "/admin" },
  { label: "Danh mục", to: "/admin/categories" },
  { label: "Sản phẩm", to: "/admin/products" },
  { label: "Đơn hàng", to: "/admin/orders" },
  { label: "Người dùng", to: "/admin/users" },
  { label: "Khuyến mãi", to: "/admin/promotions" },
];

const AdminLayout: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-gray-100 px-4 py-6 text-gray-900">
        <button
          onClick={() => navigate("/")}
          className="mb-6 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-100"
        >
          ← Về trang chủ
        </button>
        <div className="mb-8 text-2xl font-bold tracking-wide">Admin</div>
        <nav className="flex-1 space-y-4">
          {adminNav.map((item) => {
            // Đảm bảo chỉ Dashboard active khi pathname === '/admin' đúng tuyệt đối
            const isActive =
              item.to === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold shadow-sm transition-all duration-200 ${
                  isActive
                    ? "scale-105 bg-black text-white shadow-lg"
                    : "bg-white text-gray-900 hover:scale-105 hover:bg-black hover:text-white"
                } `}
                style={{ letterSpacing: 0.5 }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
