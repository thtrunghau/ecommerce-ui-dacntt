import React from "react";

const ProductCardSkeleton: React.FC = () => (
  <div className="flex min-h-[320px] animate-pulse flex-col gap-3 rounded-2xl bg-white p-4 shadow-md">
    <div className="h-40 w-full rounded-xl bg-gray-200" />
    <div className="h-5 w-2/3 rounded bg-gray-200" />
    <div className="h-4 w-1/2 rounded bg-gray-100" />
    <div className="h-4 w-1/3 rounded bg-gray-100" />
    <div className="mt-auto flex gap-2">
      <div className="h-10 w-1/2 rounded-full bg-gray-200" />
      <div className="h-10 w-1/2 rounded-full bg-gray-100" />
    </div>
  </div>
);

export default ProductCardSkeleton;
