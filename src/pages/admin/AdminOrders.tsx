/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import RoundedButton from "../../components/common/RoundedButton";
import { Toaster } from "react-hot-toast";
import ErrorState from "../../components/common/ErrorState";
import AdminOrderRowSkeleton from "../../components/common/AdminOrderRowSkeleton";
import { orderApi, accountApi } from "../../services/apiService";
import type {
  OrderResDto,
  PaymentStatus,
  DeliveryStatus,
  AccountResponseDTO,
} from "../../types/api";

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderResDto[]>([]);
  const [accounts, setAccounts] = useState<AccountResponseDTO[]>([]);
  const [search, setSearch] = useState("");
  const [showDetail, setShowDetail] = useState<OrderResDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await orderApi.getList({
          page,
          size: pageSize,
          sort: ["orderDate,DESC"],
        });
        setOrders(res.data);
        setTotalPages(res.totalPages);
      } catch (err) {
        setError("Không thể tải danh sách đơn hàng.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page, pageSize]);

  // Fetch accounts for mapping accountId to user info
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await accountApi.getList();
        setAccounts(res.data || []);
      } catch (e) {
        // Không cần báo lỗi, chỉ fallback sang accountId nếu không lấy được
      }
    };
    fetchAccounts();
  }, []);

  // Lọc theo mã đơn hoặc tên khách (email)
  const filtered = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.accountId &&
        o.accountId.toLowerCase().includes(search.toLowerCase())) ||
      (o.address?.fullAddress &&
        o.address.fullAddress.toLowerCase().includes(search.toLowerCase())),
  );

  // Hàm cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (
    orderId: string,
    paymentStatus?: PaymentStatus,
    deliveryStatus?: DeliveryStatus,
  ) => {
    try {
      setLoading(true);
      await orderApi.updateStatus(orderId, paymentStatus, deliveryStatus);
      // Refresh lại danh sách
      const res = await orderApi.getList({
        page,
        size: pageSize,
        sort: ["orderDate,DESC"],
      });
      setOrders(res.data);
    } catch (err) {
      setError("Cập nhật trạng thái thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = (accountId?: string) => {
    const acc = accounts.find((a) => a.id === accountId);
    if (!acc) return accountId || "";
    return acc.username
      ? acc.email
        ? `${acc.username} (${acc.email})`
        : acc.username
      : acc.email || accountId;
  };

  return (
    <div className="mx-auto max-w-5xl px-2 py-8">
      <Toaster position="top-right" />
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">
        Quản lý đơn hàng
      </h1>
      {loading ? (
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="text-base text-gray-500">
                <th className="py-2">Mã đơn</th>
                <th className="py-2">Khách hàng (ID)</th>
                <th className="py-2">Tổng tiền</th>
                <th className="py-2">Thanh toán</th>
                <th className="py-2">Giao hàng</th>
                <th className="py-2">Ngày</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <AdminOrderRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => setError(null)} />
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              className="w-full rounded-full border border-gray-300 bg-white px-5 py-2 text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-black focus:ring-2 focus:ring-black/20 sm:w-80"
              placeholder="Tìm kiếm mã đơn, ID khách, địa chỉ..."
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
                  <th className="py-2">Thanh toán</th>
                  <th className="py-2">Giao hàng</th>
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
                    <td className="py-2">{getUserInfo(o.accountId)}</td>
                    <td className="py-2">{o.totalPrice.toLocaleString()}₫</td>
                    <td className="py-2">
                      <span
                        className={
                          o.paymentStatus === "PAID"
                            ? "font-semibold text-green-600"
                            : o.paymentStatus === "FAILED"
                              ? "font-semibold text-red-600"
                              : "font-semibold text-yellow-600"
                        }
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-2">
                      <span
                        className={
                          o.deliveryStatus === "DELIVERED"
                            ? "font-semibold text-green-600"
                            : o.deliveryStatus === "CANCELLED"
                              ? "font-semibold text-red-600"
                              : "font-semibold text-blue-600"
                        }
                      >
                        {o.deliveryStatus}
                      </span>
                    </td>
                    <td className="py-2">
                      {new Date(o.orderDate).toLocaleString()}
                    </td>
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
                  Khách hàng: <b>{getUserInfo(showDetail.accountId)}</b>
                </div>
                <div className="mb-2">
                  Địa chỉ: <b>{showDetail.address?.fullAddress}</b>
                </div>
                <div className="mb-2">
                  Tổng tiền: <b>{showDetail.totalPrice.toLocaleString()}₫</b>
                </div>
                <div className="mb-2">
                  Trạng thái thanh toán: <b>{showDetail.paymentStatus}</b>
                </div>
                <div className="mb-2">
                  Trạng thái giao hàng: <b>{showDetail.deliveryStatus}</b>
                </div>
                <div className="mb-2">
                  Ngày đặt:{" "}
                  <b>{new Date(showDetail.orderDate).toLocaleString()}</b>
                </div>
                {/* Hiển thị danh sách sản phẩm */}
                <div className="mb-2">
                  <b>Sản phẩm:</b>
                  <ul className="ml-4 list-disc">
                    {showDetail.orderItems?.map((item) => (
                      <li key={item.id}>
                        {item.product.productName} x {item.quantity} (
                        {item.updatePriceProduct.toLocaleString()}₫)
                      </li>
                    ))}
                  </ul>
                </div>
                {/* UI cập nhật trạng thái */}
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <label className="font-medium">Thanh toán:</label>
                    <select
                      className="rounded border px-2 py-1"
                      value={showDetail.paymentStatus}
                      onChange={(e) =>
                        setShowDetail({
                          ...showDetail,
                          paymentStatus: e.target.value as PaymentStatus,
                        })
                      }
                    >
                      <option value="PENDING">Chờ thanh toán</option>
                      <option value="PAID">Đã thanh toán</option>
                      <option value="FAILED">Thất bại</option>
                      <option value="REFUNDED">Hoàn tiền</option>
                    </select>
                    <label className="ml-4 font-medium">Giao hàng:</label>
                    <select
                      className="rounded border px-2 py-1"
                      value={showDetail.deliveryStatus}
                      onChange={(e) =>
                        setShowDetail({
                          ...showDetail,
                          deliveryStatus: e.target.value as DeliveryStatus,
                        })
                      }
                    >
                      <option value="PENDING">Chờ giao</option>
                      <option value="PROCESSING">Đang xử lý</option>
                      <option value="SHIPPED">Đã gửi</option>
                      <option value="DELIVERED">Đã giao</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      className="rounded-full border bg-black px-4 py-2 font-semibold text-white transition hover:bg-white hover:text-black hover:shadow-lg disabled:opacity-60"
                      disabled={loading}
                      onClick={async () => {
                        await handleUpdateStatus(
                          showDetail.id,
                          showDetail.paymentStatus as PaymentStatus,
                          showDetail.deliveryStatus as DeliveryStatus,
                        );
                        setShowDetail(null);
                      }}
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setShowDetail(null)}
                      className="rounded-full border px-4 py-2"
                      disabled={loading}
                    >
                      Đóng
                    </button>
                  </div>
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
