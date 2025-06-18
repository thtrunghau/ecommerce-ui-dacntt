import React from "react";

const OrderCardSkeleton: React.FC = () => (
  <div className="flex min-h-[120px] animate-pulse flex-col gap-3 rounded-xl bg-white p-6 shadow">
    <div className="h-5 w-1/3 rounded bg-gray-200" />
    <div className="h-4 w-1/2 rounded bg-gray-100" />
    <div className="h-4 w-1/4 rounded bg-gray-100" />
    <div className="h-4 w-1/3 rounded bg-gray-100" />
  </div>
);

export default OrderCardSkeleton;
