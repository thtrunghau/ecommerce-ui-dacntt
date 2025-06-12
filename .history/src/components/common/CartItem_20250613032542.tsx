import type { CartItemResDto } from "../../types";
import { useCallback } from "react";
import { formatPrice } from "../../utils/formatPrice";

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

  return (
    <div className="flex items-center gap-4 border-b p-4">
      {/* Product Image */}
      <div className="h-24 w-24 flex-shrink-0">
        <img
          src={item.product.image}
          alt={item.product.productName}
          className="h-full w-full rounded object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-grow">
        <h3 className="text-lg font-medium">{item.product.productName}</h3>
        <p className="text-gray-500">{formatPrice(item.productPrice)}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="rounded border px-2 py-1 hover:bg-gray-100"
          disabled={item.quantity <= 1}
        >
          -
        </button>
        <span className="w-12 text-center">{item.quantity}</span>
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="rounded border px-2 py-1 hover:bg-gray-100"
        >
          +
        </button>
      </div>

      {/* Total Price */}
      <div className="w-32 text-right">
        <p className="font-medium">
          {formatPrice(item.productPrice * item.quantity)}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.id)}
        className="ml-4 text-red-500 hover:text-red-700"
      >
        Remove
      </button>
    </div>
  );
};
