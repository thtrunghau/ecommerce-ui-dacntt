import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { CartItem } from "../components/common/CartItem";
import type { CartResDto, CartItemResDto } from "../types";
import { formatPrice } from "../utils/formatPrice";
import { mockCartData } from "../mockData/cartData";
import { getProductPriceInfo } from "../utils/helpers";

const CartPage: React.FC = () => {
  // Using mock data for UI testing
  const [cart, setCart] = useState<CartResDto>(mockCartData);
  const [loading] = useState(false);

  const calculateTotal = useCallback((items: CartItemResDto[]) => {
    return items.reduce((sum, item) => {
      // Get promotion info for each item
      const priceInfo = getProductPriceInfo(item.product.id, item.productPrice);
      return sum + priceInfo.finalPrice * item.quantity;
    }, 0);
  }, []);
  const handleQuantityChange = useCallback(
    (itemId: string, newQuantity: number) => {
      setCart((prevCart) => ({
        ...prevCart,
        cartItems: prevCart.cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item,
        ),
      }));
    },
    [],
  );

  const handleRemoveItem = useCallback((itemId: string) => {
    setCart((prevCart) => ({
      ...prevCart,
      cartItems: prevCart.cartItems.filter((item) => item.id !== itemId),
    }));
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">Giỏ hàng</h1>
        <p>Giỏ hàng của bạn đang trống</p>
      </div>
    );
  }

  const total = calculateTotal(cart.cartItems);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Giỏ hàng</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white shadow">
            {cart.cartItems.map((item) => (
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
                <span>{formatPrice(total)}</span>
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
              </div>
            </div>            <Link
              to="/review-order"
              className="mt-6 block w-full rounded-full bg-black px-4 py-3 text-center text-white transition-colors hover:bg-gray-800 hover:shadow-lg"
            >
              Tiến hành đặt hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
