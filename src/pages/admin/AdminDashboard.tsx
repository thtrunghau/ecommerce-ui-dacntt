import React from "react";

const AdminDashboard: React.FC = () => {
  // TODO: fetch real stats, use mock for now
  const stats = [
    { label: "Tổng đơn hàng", value: 1280 },
    { label: "Doanh thu (VNĐ)", value: "₫1,200,000,000" },
    { label: "Người dùng", value: 320 },
    { label: "Sản phẩm", value: 210 },
  ];
  const recentOrders = [
    {
      id: "ORD001",
      user: "Nguyễn Văn A",
      total: "₫2,500,000",
      status: "Đã giao",
      date: "2025-06-15",
    },
    {
      id: "ORD002",
      user: "Trần Thị B",
      total: "₫1,200,000",
      status: "Đang xử lý",
      date: "2025-06-16",
    },
    {
      id: "ORD003",
      user: "Lê Văn C",
      total: "₫3,000,000",
      status: "Đã hủy",
      date: "2025-06-14",
    },
  ];
  const topProducts = [
    { name: "iPhone 15 Pro Max", sold: 120 },
    { name: "Samsung S24 Ultra", sold: 98 },
    { name: "MacBook Air M3", sold: 75 },
  ];
  return (
    <div className="mx-auto max-w-6xl px-2 py-8">
      <h1 className="mb-10 text-3xl font-bold tracking-tight text-gray-900">
        Dashboard tổng quan
      </h1>
      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-6 text-center text-white shadow-lg transition hover:scale-105"
          >
            <div className="text-3xl font-extrabold">{s.value}</div>
            <div className="text-base text-gray-300">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Đơn hàng gần nhất
          </h2>
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="text-base text-gray-500">
                  <th className="py-2">Mã đơn</th>
                  <th className="py-2">Khách hàng</th>
                  <th className="py-2">Tổng tiền</th>
                  <th className="py-2">Trạng thái</th>
                  <th className="py-2">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-t text-base transition hover:bg-gray-50"
                  >
                    <td className="py-2">{o.id}</td>
                    <td className="py-2">{o.user}</td>
                    <td className="py-2">{o.total}</td>
                    <td className="py-2">{o.status}</td>
                    <td className="py-2">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Sản phẩm bán chạy
          </h2>
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="text-base text-gray-500">
                  <th className="py-2">Sản phẩm</th>
                  <th className="py-2">Đã bán</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr
                    key={p.name}
                    className="border-t text-base transition hover:bg-gray-50"
                  >
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">{p.sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
