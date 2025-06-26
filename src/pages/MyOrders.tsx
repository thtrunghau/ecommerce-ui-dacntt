/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import ErrorState from "../components/common/ErrorState";
import OrderCard from "../components/common/OrderCard";
import OrderCardSkeleton from "../components/common/OrderCardSkeleton";
import { orderApi } from "../services/apiService";
import type { OrderResDto } from "../types/api";
import useAuthStore from "../store/authStore";

const MyOrders: React.FC = () => {
  const authUser = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderResDto[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!authUser?.id) {
          setOrders([]);
          setLoading(false);
          return;
        }
        // Gọi API lấy đơn hàng theo accountId (chuẩn hóa theo BE)
        const res = await orderApi.getByAccountId(authUser.id);
        setOrders(Array.isArray(res) ? res : []);
      } catch (err) {
        setError("Không thể tải danh sách đơn hàng.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [authUser?.id]);

  if (loading)
    return (
      <div className="container mx-auto px-2 py-8 md:px-4">
        <h1 className="mb-8 text-2xl font-bold text-gray-900">
          Đơn hàng của tôi
        </h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  if (error) return <ErrorState message={error} className="min-h-screen" />;
  if (!orders || orders.length === 0)
    return (
      <ErrorState
        message="Bạn chưa có đơn hàng nào."
        className="min-h-screen"
      />
    );

  return (
    <div className="container mx-auto px-2 py-8 md:px-4">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Đơn hàng của tôi
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
