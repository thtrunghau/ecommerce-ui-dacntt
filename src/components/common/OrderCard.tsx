import React from "react";
import type { OrderResDto } from "../../types/api";

const statusColor: Record<string, string> = {
  DELIVERED: "bg-green-100 text-green-700 border-green-400",
  SHIPPED: "bg-blue-100 text-blue-700 border-blue-400",
  PENDING: "bg-gray-100 text-gray-700 border-gray-400",
  CANCELLED: "bg-gray-300 text-gray-500 border-gray-400",
  FAILED: "bg-red-100 text-red-700 border-red-400",
};

const statusLabel: Record<string, string> = {
  DELIVERED: "Đã giao",
  SHIPPED: "Đang giao",
  PENDING: "Chờ xác nhận",
  CANCELLED: "Đã huỷ",
  FAILED: "Thất bại",
};

interface OrderCardProps {
  order: OrderResDto;
  action?: React.ReactNode;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, action }) => (
  <div className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-6 shadow transition-all hover:shadow-lg">
    <div className="mb-2 flex items-center justify-between">
      <span className="font-mono text-xs text-gray-400">#{order.id}</span>
      <span
        className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${
          statusColor[order.deliveryStatus?.toUpperCase?.()] ||
          "border-gray-400 bg-gray-100 text-gray-700"
        }`}
      >
        {statusLabel[order.deliveryStatus?.toUpperCase?.()] ||
          order.deliveryStatus}
      </span>
    </div>
    <div className="mb-2 text-sm text-gray-600">
      Ngày đặt: {new Date(order.orderDate).toLocaleDateString()}
    </div>
    <div className="mb-2 text-sm text-gray-600">
      Thanh toán:{" "}
      <span
        className={
          order.paymentStatus?.toUpperCase?.() === "COMPLETED"
            ? "text-green-600"
            : order.paymentStatus?.toUpperCase?.() === "FAILED"
              ? "text-red-600"
              : "text-yellow-600"
        }
      >
        {order.paymentStatus?.toUpperCase?.() === "COMPLETED"
          ? "Đã thanh toán"
          : order.paymentStatus?.toUpperCase?.() === "FAILED"
            ? "Thất bại"
            : "Chờ thanh toán"}
      </span>
    </div>
    <div className="mb-4 text-lg font-bold text-blue-700">
      {order.totalPrice.toLocaleString()}₫
    </div>
    <div className="flex-1" />
    {action ? (
      <div className="mt-4">{action}</div>
    ) : (
      <a
        href={`/orders/${order.id}`}
        className="mt-4 inline-block w-full rounded-full bg-black px-4 py-3 text-center font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-lg active:scale-95"
      >
        Xem chi tiết
      </a>
    )}
  </div>
);

export default OrderCard;
