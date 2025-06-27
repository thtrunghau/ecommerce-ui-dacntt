import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProductPriceInfo } from "../../utils/helpers";
import { getPresignedGetUrl } from "../../services/apiService";
import type { ProductResDto } from "../../types";

interface ProductCardProps {
  product: ProductResDto;
  isSelected?: boolean;
  onComparisonToggle?: (productId: string) => void;
  onAddToCart?: (product: ProductResDto) => void;
  onLearnMore?: (product: ProductResDto) => void;
  showComparisonCheckbox?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSelected = false,
  onComparisonToggle,
  onAddToCart,
  onLearnMore,
  showComparisonCheckbox = true,
  className = "",
}) => {
  const navigate = useNavigate();
  const priceInfo = getProductPriceInfo(product.id, product.price);
  const hasPromotion = priceInfo.hasActivePromotion;
  const finalPrice = priceInfo.finalPrice;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleLearnMore = () => {
    if (onLearnMore) {
      onLearnMore(product);
    }
    // Use slug if available, otherwise use ID
    const productPath = product.slug || product.id;
    navigate(`/products/${productPath}`);
  };

  const handleComparisonToggle = () => {
    if (onComparisonToggle) {
      onComparisonToggle(product.id);
    }
  };

  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    if (product.image) {
      getPresignedGetUrl(product.image)
        .then((res) => {
          if (isMounted) setImageUrl(res.url);
        })
        .catch(() => {
          if (isMounted) setImageUrl("/images/products/placeholder.png");
        });
    } else {
      setImageUrl("/images/products/placeholder.png");
    }
    return () => {
      isMounted = false;
    };
  }, [product.image]);

  return (
    <div
      className={`flex h-full flex-col rounded-lg bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${className}`}
    >
      {/* Product Image */}
      <div className="relative aspect-square p-4">
        <img
          src={imageUrl}
          alt={product.productName}
          className="h-full w-full rounded-lg object-contain transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/products/placeholder.png";
          }}
        />{" "}
        {hasPromotion && (
          <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-md">
            Sale
          </div>
        )}
        {product.isNew && (
          <div className="absolute right-2 top-2 rounded-full bg-black px-2 py-1 text-xs font-bold text-white shadow-md">
            Mới
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-grow flex-col p-4">
        {/* Product Name */}
        <h4 className="mb-2 line-clamp-2 h-12 cursor-pointer font-semibold text-gray-900 transition-colors hover:text-black">
          {product.productName}
        </h4>
        {/* Product Description */}
        <p className="mb-3 line-clamp-2 h-10 text-sm text-gray-600">
          {product.description}
        </p>
        {/* Price Section */}
        <div className="mb-4 h-16">
          {hasPromotion ? (
            <div className="space-y-1">
              <div className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </div>
              <div className="text-lg font-bold text-red-600">
                {formatPrice(finalPrice)}
              </div>
              <div className="text-xs font-medium text-red-600">
                Tiết kiệm {formatPrice(product.price - finalPrice)}
              </div>
            </div>
          ) : (
            <div className="text-lg font-bold text-gray-900">
              {formatPrice(finalPrice)}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-2">
          <button
            onClick={handleAddToCart}
            className="w-full rounded-full border border-black bg-black px-3 py-1.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-lg active:scale-95"
          >
            Thêm vào giỏ hàng
          </button>
          <button
            onClick={handleLearnMore}
            className="w-full rounded-full border border-black bg-white px-3 py-1.5 text-sm font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-black hover:text-white hover:shadow-lg active:scale-95"
          >
            Xem chi tiết
          </button>
        </div>

        {/* Comparison Checkbox */}
        {showComparisonCheckbox && (
          <div className="mt-3 flex items-center">
            <input
              type="checkbox"
              id={`compare-${product.id}`}
              checked={isSelected}
              onChange={handleComparisonToggle}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-black transition-colors focus:ring-black"
            />
            <label
              htmlFor={`compare-${product.id}`}
              className="cursor-pointer text-sm text-gray-600 hover:text-black"
            >
              Chọn để so sánh
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
