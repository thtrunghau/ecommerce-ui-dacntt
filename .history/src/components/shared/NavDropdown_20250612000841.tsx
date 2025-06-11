import React from "react";
import type { CategoryResDto, ProductResDto } from "../../types";
import { Link } from "react-router-dom";
import {
  getAllApplicablePromotions,
  getProductPriceInfo,
  formattedPrice,
} from "../../utils/helpers";

interface NavDropdownProps {
  category: CategoryResDto;
}

const NavDropdown: React.FC<NavDropdownProps> = ({ category }) => {
  return (
    <div className="animate-fadeIn absolute left-1/2 top-full z-50 mt-1 w-[900px] -translate-x-1/2 rounded-xl border border-gray-100 bg-white shadow-xl">
      {/* Invisible hover area at the top - tăng chiều cao để kết nối với bridge */}
      <div className="absolute left-0 top-[-12px] h-4 w-full bg-transparent" />
      <div className="px-8 py-6">
        <h3 className="mb-6 text-lg font-bold text-gray-800">
          Sản phẩm nổi bật
        </h3>
        <div className="grid grid-cols-4 gap-6">
          {" "}
          {category.products.map((product: ProductResDto) => {
            // Kiểm tra xem sản phẩm có promotion không
            const applicablePromotions = getAllApplicablePromotions(product.id);
            const hasPromotion = applicablePromotions.length > 0;
            const priceInfo = hasPromotion
              ? getProductPriceInfo(product.id, product.price)
              : null;

            return (
              <Link
                to={`/products/${product.id}`}
                key={product.id}
                className="group flex flex-col items-center rounded-xl bg-gray-50 p-4 transition-shadow hover:shadow-lg"
              >
                <div className="relative mb-3 flex h-24 w-32 items-center justify-center overflow-hidden rounded-lg bg-white">
                  <img
                    src={product.image}
                    alt={product.productName}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/products/placeholder.png";
                    }}
                  />
                  {/* Sale Badge */}
                  {hasPromotion && (
                    <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                      SALE
                    </span>
                  )}
                  {/* New Badge - chỉ hiển thị khi không có promotion để tránh overlap */}
                  {product.isNew && !hasPromotion && (
                    <span className="absolute left-2 top-2 rounded bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                      MỚI
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <span className="line-clamp-2 text-[15px] font-medium text-gray-900">
                    {product.productName}
                  </span>
                  {/* Price Information */}
                  <div className="mt-1">
                    {hasPromotion && priceInfo ? (
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-red-600">
                          {formattedPrice(priceInfo.finalPrice)}
                        </span>
                        <span className="text-xs text-gray-500 line-through">
                          {formattedPrice(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-gray-800">
                        {formattedPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NavDropdown;
