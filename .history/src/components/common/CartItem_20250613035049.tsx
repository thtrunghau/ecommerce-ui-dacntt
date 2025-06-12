import type { CartItemResDto } from "../../types";
i              <div className="mt-1 text-sm text-red-600">
                {priceInfo.promotionInfo && (
                  <>
                    {priceInfo.promotionInfo.promotionName}
                    {priceInfo.promotionInfo.isPercentage 
                      ? ` - Giảm ${priceInfo.promotionInfo.discountAmount}%`
                      : ` - Giảm ${formatPrice(priceInfo.promotionInfo.discountAmount)}`}
                  </>
                )}
              </div>{ useCallback } from "react";
import { formatPrice } from "../../utils/formatPrice";
import { getProductPriceInfo } from "../../utils/helpers";

interface CartItemProps {
  item: CartItemResDto;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
}

export const CartItem = ({
  item,
  onQuantityChange,
  onRemove,
}: CartItemProps) => {
  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      if (newQuantity >= 1) {
        onQuantityChange(item.id, newQuantity);
      }
    },
    [item.id, onQuantityChange],
  );

  // Get promotion info
  const priceInfo = getProductPriceInfo(item.product.id, item.productPrice);
  const finalPrice = priceInfo.finalPrice;
  const hasPromotion = priceInfo.hasActivePromotion;

  return (
    <div className="flex items-center gap-4 border-b p-4">
      {/* Product Image */}
      <div className="h-24 w-24 flex-shrink-0">
        <img
          src={item.product.image}
          alt={item.product.productName}
          className="h-full w-full rounded-lg object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-grow">
        <h3 className="text-lg font-medium">{item.product.productName}</h3>
        <div className="mt-1">
          {hasPromotion ? (
            <>
              <span className="text-gray-500 line-through">
                {formatPrice(item.productPrice)}
              </span>
              <span className="ml-2 text-lg font-semibold text-black">
                {formatPrice(finalPrice)}
              </span>
              <div className="mt-1 text-sm text-red-600">
                {priceInfo.promotionInfo?.promotionName}
                {priceInfo.promotionInfo?.isPercentage
                  ? ` - Giảm ${priceInfo.promotionInfo.discountAmount}%`
                  : ` - Giảm ${formatPrice(priceInfo.promotionInfo.discountAmount)}`}
              </div>
            </>
          ) : (
            <span className="text-lg font-semibold text-black">
              {formatPrice(item.productPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="rounded-full border border-gray-300 px-3 py-1 text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={item.quantity <= 1}
        >
          -
        </button>
        <span className="w-12 text-center">{item.quantity}</span>
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="rounded-full border border-gray-300 px-3 py-1 text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-100"
        >
          +
        </button>
      </div>

      {/* Total Price */}
      <div className="w-32 text-right">
        <p className="text-lg font-semibold">
          {formatPrice(finalPrice * item.quantity)}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.id)}
        className="ml-4 rounded-full border border-red-500 px-4 py-2 text-red-500 transition-colors hover:bg-red-50"
      >
        Xóa
      </button>
    </div>
  );
};
