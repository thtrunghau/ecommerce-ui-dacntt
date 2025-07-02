import React, { useEffect, useState } from "react";
import { orderApi, productApi, accountApi } from "../../services/apiService";

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState([
    { label: "Tổng đơn hàng", value: "..." },
    { label: "Doanh thu (VNĐ)", value: "..." },
    { label: "Người dùng", value: "..." },
    { label: "Sản phẩm", value: "..." },
  ]);
  const [recentOrders, setRecentOrders] = useState<
    {
      id: string;
      user: string;
      total: string;
      status: string;
      date: string;
    }[]
  >([]);
  const [topProducts, setTopProducts] = useState<
    {
      name: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Lấy tổng đơn hàng và doanh thu
        const orderRes = await orderApi.getList({
          page: 0,
          size: 1000,
          sort: ["createdAt,DESC"],
        });
        const orders = orderRes.data || [];
        const totalOrders = orderRes.totalElements || 0;
        const totalRevenue = orders
          .filter(
            (o) =>
              o.paymentStatus === "COMPLETED" &&
              o.deliveryStatus === "DELIVERED" &&
              o.totalPrice,
          )
          .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        // Lấy danh sách accountId từ 10 đơn hàng gần nhất
        const recentOrdersRaw = orders.slice(0, 10);
        const accountIds = Array.from(
          new Set(recentOrdersRaw.map((o) => o.accountId).filter(Boolean)),
        );
        const accountMap: Record<string, string> = {};
        if (accountIds.length > 0) {
          // Gọi API lấy thông tin user theo từng id (song song)
          const userResults = await Promise.all(
            accountIds.map((id) => accountApi.getById(id)),
          );
          userResults.forEach((u) => {
            accountMap[u.id] = u.username || u.email || u.id;
          });
        }

        // Lấy tổng người dùng
        const userRes = await accountApi.getList({ page: 0, size: 1 });
        const totalUsers = userRes.totalElements || 0;

        // Lấy tổng sản phẩm và 10 sản phẩm mới nhất
        const productRes = await productApi.getList({
          page: 0,
          size: 10,
          sort: ["createdAt,DESC"],
        });
        const products = productRes.data || [];
        const totalProducts = productRes.totalElements || 0;
        // 10 sản phẩm mới nhất
        const newest10 = products.map((p) => ({
          name: p.productName,
        }));

        // Lấy 10 đơn hàng gần nhất, map tên user
        const recent10 = recentOrdersRaw.map((o) => ({
          id: o.id,
          user: accountMap[o.accountId] || o.accountId || "-",
          total: (o.totalPrice || 0).toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          }),
          status: `${o.paymentStatus} / ${o.deliveryStatus}`,
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "",
        }));

        setStats([
          { label: "Tổng đơn hàng", value: totalOrders.toString() },
          {
            label: "Doanh thu (VNĐ)",
            value: totalRevenue.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            }),
          },
          { label: "Người dùng", value: totalUsers.toString() },
          { label: "Sản phẩm", value: totalProducts.toString() },
        ]);
        setRecentOrders(recent10);
        setTopProducts(newest10);
      } catch {
        setError("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading)
    return <div className="p-8 text-center text-lg">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

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
            Sản phẩm mới nhất
          </h2>
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="text-base text-gray-500">
                  <th className="py-2">Sản phẩm</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr
                    key={p.name}
                    className="border-t text-base transition hover:bg-gray-50"
                  >
                    <td className="py-2">{p.name}</td>
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
