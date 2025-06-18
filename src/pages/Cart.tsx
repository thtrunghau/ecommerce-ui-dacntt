import { useCallback } from "react";
import { Link } from "react-router-dom";
import { CartItem } from "../components/common/CartItem";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorState from "../components/common/ErrorState";
import type { CartItemResDto } from "../types";
import { formatPrice } from "../utils/formatPrice";
import { getProductPriceInfo } from "../utils/helpers";
import useCartStore from "../store/cartStore";
import toast from "react-hot-toast";

const CartPage: React.FC = () => {
  const cartStore = useCartStore();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { items: cartItems, totalPrice, isLoading } = cartStore;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const calculateTotal = useCallback((items: CartItemResDto[]) => {
    return items.reduce((sum, item) => {
      const priceInfo = getProductPriceInfo(item.product.id, item.productPrice);
      return sum + priceInfo.finalPrice * item.quantity;
    }, 0);
  }, []);

  const handleQuantityChange = useCallback(
    async (itemId: string, newQuantity: number) => {
      await cartStore.updateQuantity(itemId, newQuantity);
      toast.success("Đã cập nhật số lượng!");
    },
    [cartStore],
  );

  const handleRemoveItem = useCallback(
    async (itemId: string) => {
      await cartStore.removeItem(itemId);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
    },
    [cartStore],
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner className="min-h-[120px]" />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">Giỏ hàng</h1>
        <ErrorState
          message="Giỏ hàng của bạn đang trống"
          className="min-h-[120px]"
        />
      </div>
    );
  }

  // Tính tạm tính, giảm giá, tổng tiền
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0,
  );
  const total = cartItems.reduce((sum, item) => {
    const priceInfo = getProductPriceInfo(item.product.id, item.productPrice);
    return sum + priceInfo.finalPrice * item.quantity;
  }, 0);
  const totalDiscount = subtotal - total;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Giỏ hàng</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white shadow">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Thông tin đơn hàng</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Giảm giá</span>
                <span>-{formatPrice(totalDiscount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Tổng tiền</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  (Đã bao gồm VAT nếu có)
                </p>
              </div>{" "}
            </div>{" "}
            <Link
              to="/review-order"
              className="mt-6 block w-full rounded-full bg-black px-4 py-3 text-center text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-lg active:scale-95"
            >
              Tiến hành đặt hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
