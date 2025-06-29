import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorState from "../components/common/ErrorState";
import { orderApi } from "../services/apiService";
import { getProductImageUrl } from "../utils/imageUtils";
import type { OrderResDto } from "../types/api";

const statusColor: Record<string, string> = {
  DELIVERED: "bg-green-100 text-green-700 border-green-400",
  PROCESSING: "bg-yellow-100 text-yellow-700 border-yellow-400",
  PENDING: "bg-gray-100 text-gray-700 border-gray-400",
  FAILED: "bg-red-100 text-red-700 border-red-400",
  SHIPPED: "bg-blue-100 text-blue-700 border-blue-400",
};
const statusLabel: Record<string, string> = {
  DELIVERED: "Đã giao",
  PROCESSING: "Đang xử lý",
  PENDING: "Chờ xác nhận",
  FAILED: "Thất bại",
  SHIPPED: "Đang giao",
};

const buildImageUrl = (imagePath: string | null) => {
  return imagePath
    ? `https://${import.meta.env.VITE_IMAGE_URL_BUCKET_NAME}.s3.${import.meta.env.VITE_IMAGE_URL_AREA}.amazonaws.com/${imagePath}`
    : "/images/products/placeholder.png";
};

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderResDto | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!orderId) throw new Error("Không tìm thấy đơn hàng.");
        const res = await orderApi.getById(orderId);
        setOrder(res);
      } catch {
        setError("Không tìm thấy đơn hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const normalizedPaymentStatus = order?.paymentStatus?.toUpperCase?.();

  if (loading) return <LoadingSpinner className="min-h-screen" />;
  if (error) return <ErrorState message={error} className="min-h-screen" />;
  if (!order)
    return (
      <ErrorState message="Không tìm thấy đơn hàng." className="min-h-screen" />
    );

  return (
    <div className="container mx-auto px-2 py-8 md:px-4">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Chi tiết đơn hàng #{order.id}
      </h1>
      {/* Tổng quan đơn hàng */}
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-400">#{order.id}</span>
            <span
              className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${statusColor[order.deliveryStatus] || "border-gray-400 bg-gray-100 text-gray-700"}`}
            >
              {statusLabel[order.deliveryStatus] || order.deliveryStatus}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Ngày đặt: {new Date(order.orderDate).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            Thanh toán:{" "}
            <span
              className={
                normalizedPaymentStatus === "COMPLETED"
                  ? "text-green-600"
                  : normalizedPaymentStatus === "FAILED"
                    ? "text-red-600"
                    : "text-yellow-600"
              }
            >
              {normalizedPaymentStatus === "COMPLETED"
                ? "Đã thanh toán"
                : normalizedPaymentStatus === "FAILED"
                  ? "Thất bại"
                  : "Chờ thanh toán"}
            </span>
          </div>
          <div className="text-lg font-bold text-blue-700">
            Tổng tiền: {order.totalPrice.toLocaleString()}₫
          </div>
        </div>
        {/* Địa chỉ giao hàng */}
        <div className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-6 shadow">
          <div className="mb-1 font-semibold text-gray-900">
            Địa chỉ giao hàng
          </div>
          <div className="text-sm text-gray-700">
            {order.address.buildingName}, {order.address.street}
          </div>
          <div className="text-sm text-gray-700">
            {order.address.city}, {order.address.state}, {order.address.country}
          </div>
          <div className="text-xs text-gray-500">
            Mã bưu điện: {order.address.pincode}
          </div>
        </div>
      </div>
      {/* Sản phẩm */}
      <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Sản phẩm</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {order.orderItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 shadow-sm"
            >
              <img
                src={getProductImageUrl(item.product.image)}
                alt={item.product.productName}
                className="h-16 w-16 rounded border object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/products/placeholder.png";
                }}
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {item.product.productName}
                </div>
                <div className="text-xs text-gray-500">x{item.quantity}</div>
                <div className="mt-1 text-sm font-semibold text-blue-700">
                  {item.updatePriceProduct.toLocaleString()}₫
                </div>
                {item.totalPriceProduct > item.updatePriceProduct && (
                  <div className="text-xs text-gray-400 line-through">
                    {item.totalPriceProduct.toLocaleString()}₫
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Khuyến mãi áp dụng */}
      {order.usedPromotions.length > 0 && (
        <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Khuyến mãi áp dụng</h2>
          <ul className="space-y-2">
            {order.usedPromotions.map((promo) => (
              <li
                key={promo.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
              >
                <div>
                  <div className="font-medium">{promo.promotionName}</div>
                  <div className="text-xs text-gray-500">
                    {promo.description}
                  </div>
                </div>
                <span className="font-semibold text-green-600">
                  {promo.proportionType === "PERCENTAGE"
                    ? `-${promo.discountAmount ?? 0}%`
                    : `-${promo.discountAmount !== undefined ? promo.discountAmount.toLocaleString() : 0}₫`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Link
        to="/orders"
        className="mt-6 inline-block rounded-full bg-black px-4 py-3 text-center font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-lg active:scale-95"
      >
        Quay lại danh sách đơn hàng
      </Link>
    </div>
  );
};

export default OrderDetail;
