import React, { useState } from "react";
import { mockOrders } from "../mockData/ordersMock";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorState from "../components/common/ErrorState";
import OrderCard from "../components/common/OrderCard";

const MyOrders: React.FC = () => {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const orders = mockOrders;

  if (loading) return <LoadingSpinner className="min-h-screen" />;
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
