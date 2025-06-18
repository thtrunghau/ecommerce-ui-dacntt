import React from "react";

const ProductDetailSkeleton: React.FC = () => (
  <div className="flex min-h-[400px] animate-pulse flex-col gap-8 rounded-2xl bg-white p-8 shadow md:flex-row">
    {/* Image skeleton */}
    <div className="flex w-full flex-shrink-0 items-center justify-center md:w-1/3">
      <div className="h-64 w-64 rounded-xl bg-gray-200" />
    </div>
    {/* Info skeleton */}
    <div className="flex flex-1 flex-col gap-4">
      <div className="h-8 w-2/3 rounded bg-gray-200" />
      <div className="h-6 w-1/3 rounded bg-gray-100" />
      <div className="h-6 w-1/4 rounded bg-gray-100" />
      <div className="h-4 w-1/2 rounded bg-gray-100" />
      <div className="h-4 w-1/3 rounded bg-gray-100" />
      <div className="h-4 w-1/4 rounded bg-gray-100" />
      <div className="mt-8 flex gap-4">
        <div className="h-12 w-32 rounded-full bg-gray-200" />
        <div className="h-12 w-32 rounded-full bg-gray-100" />
      </div>
    </div>
  </div>
);

export default ProductDetailSkeleton;
