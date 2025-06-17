import React, { useState } from "react";
import RoundedButton from "../../components/common/RoundedButton";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";

interface Order {
  id: string;
  user: string;
  total: number;
  status: string;
  date: string;
}

// Giả lập dữ liệu đơn hàng
const mockOrders: Order[] = [
  {
    id: "ORD001",
    user: "Nguyễn Văn A",
    total: 2500000,
    status: "Đã giao",
    date: "2025-06-15",
  },
  {
    id: "ORD002",
    user: "Trần Thị B",
    total: 1200000,
    status: "Đang xử lý",
    date: "2025-06-16",
  },
  {
    id: "ORD003",
    user: "Lê Văn C",
    total: 3000000,
    status: "Đã hủy",
    date: "2025-06-14",
  },
];

const AdminOrders: React.FC = () => {
  const [orders] = useState<Order[]>(mockOrders);
  const [search, setSearch] = useState("");
  const [showDetail, setShowDetail] = useState<Order | null>(null);
  // TODO: Thêm filter, phân trang, cập nhật trạng thái thực tế
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.user.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-5xl px-2 py-8">
      <Toaster position="top-right" />
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">
        Quản lý đơn hàng
      </h1>
      {loading ? (
        <LoadingSpinner size={40} className="my-8" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setError(null)} />
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              className="w-full rounded-full border border-gray-300 bg-white px-5 py-2 text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-black focus:ring-2 focus:ring-black/20 sm:w-80"
              placeholder="Tìm kiếm mã đơn hoặc tên khách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="text-base text-gray-500">
                  <th className="py-2">Mã đơn</th>
                  <th className="py-2">Khách hàng</th>
                  <th className="py-2">Tổng tiền</th>
                  <th className="py-2">Trạng thái</th>
                  <th className="py-2">Ngày</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr
                    key={o.id}
                    className="border-t text-base transition hover:bg-gray-50"
                  >
                    <td className="py-2">{o.id}</td>
                    <td className="py-2">{o.user}</td>
                    <td className="py-2">{o.total.toLocaleString()}₫</td>
                    <td className="py-2">{o.status}</td>
                    <td className="py-2">{o.date}</td>
                    <td className="py-2">
                      <RoundedButton
                        text="Xem chi tiết"
                        onClick={() => setShowDetail(o)}
                        size="small"
                        sx={{
                          minWidth: 0,
                          fontWeight: 500,
                          fontSize: "0.75rem",
                          padding: "2px 12px",
                          backgroundColor: "white",
                          color: "black",
                          border: "1px solid black",
                          "&:hover": {
                            backgroundColor: "black",
                            color: "white",
                          },
                        }}
                        variant="contained"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Modal chi tiết đơn hàng */}
          {showDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                <button
                  type="button"
                  className="absolute right-2 top-2 text-xl"
                  onClick={() => setShowDetail(null)}
                >
                  &times;
                </button>
                <h2 className="mb-4 text-lg font-semibold">
                  Chi tiết đơn hàng {showDetail.id}
                </h2>
                <div className="mb-2">
                  Khách hàng: <b>{showDetail.user}</b>
                </div>
                <div className="mb-2">
                  Tổng tiền: <b>{showDetail.total.toLocaleString()}₫</b>
                </div>
                <div className="mb-2">
                  Trạng thái: <b>{showDetail.status}</b>
                </div>
                <div className="mb-2">
                  Ngày đặt: <b>{showDetail.date}</b>
                </div>
                {/* TODO: Thêm chi tiết sản phẩm, cập nhật trạng thái, lịch sử giao hàng */}
                <div className="mt-4 flex gap-2">
                  <button className="rounded-full border bg-black px-4 py-2 font-semibold text-white transition hover:bg-white hover:text-black hover:shadow-lg">
                    Cập nhật trạng thái
                  </button>
                  <button
                    onClick={() => setShowDetail(null)}
                    className="rounded-full border px-4 py-2"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminOrders;
