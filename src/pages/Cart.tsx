import { Link } from "react-router-dom";
import { CartItem } from "../components/common/CartItem";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorState from "../components/common/ErrorState";
import { formatPrice } from "../utils/formatPrice";
import { getProductPriceInfo } from "../utils/helpers";
import useCartStore, { useCartUserSync } from "../store/cartStore";
import toast from "react-hot-toast";
import { debounce } from "../utils/debounce";
import { useQuery } from "@tanstack/react-query";
import { promotionApi } from "../services/apiService";

const CartPage: React.FC = () => {
  useCartUserSync();
  // Lấy lại totalItems bằng selector trực tiếp từ items để Zustand luôn theo dõi đúng dependencies
  const cartItems = useCartStore((state) => state.items);
  const isLoading = useCartStore((state) => state.isLoading);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  // Lấy promotions từ API thật
  const { data: promotionPage } = useQuery({
    queryKey: ["promotions"],
    queryFn: () => promotionApi.getList(),
  });
  const promotions = promotionPage?.data || [];
  // Đảm bảo debounce nhận đúng kiểu callback (...args: unknown[])
  const debouncedHandleQuantityChange = debounce((...args: unknown[]) => {
    const [itemId, newQuantity] = args as [string, number];
    updateQuantity(itemId, newQuantity)
      .then(() => toast.success("Đã cập nhật số lượng!"))
      .catch((err) =>
        toast.error((err as Error)?.message || "Cập nhật số lượng thất bại!"),
      );
  }, 300);
  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId)
      .then(() => toast.success("Đã xóa sản phẩm khỏi giỏ hàng!"))
      .catch((err) =>
        toast.error((err as Error)?.message || "Xóa sản phẩm thất bại!"),
      );
  };

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

  // Tính toán subtotal, total, totalDiscount như cũ
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0,
  );
  const total = cartItems.reduce((sum, item) => {
    const priceInfo = getProductPriceInfo(
      item.product.id,
      item.productPrice,
      promotions,
    );
    return sum + priceInfo.finalPrice * item.quantity;
  }, 0);
  const totalDiscount = subtotal - total;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Giỏ hàng</h1>
      {cartItems.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          promotions={promotions}
          onQuantityChange={debouncedHandleQuantityChange}
          onRemove={handleRemoveItem}
        />
      ))}
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
  );
};

export default CartPage;
