import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice";
import AddressBookSelector from "../components/common/AddressBookSelector";
import { useAddressBookStore } from "../store/addressBookStore";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import type { AddressResDto } from "../types/api";
import {
  getProductPriceInfo,
  filterValidPromotionsForOrder,
} from "../utils/helpers";
import type { PromotionResDto } from "../types/api";
import { addressApi, orderApi, paymentApi } from "../services/apiService";

const AddressForm: React.FC<{
  address: AddressResDto;
  onUpdate: (address: AddressResDto) => void;
}> = ({ address, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(address);

  // Đồng bộ formData mỗi khi address prop thay đổi
  useEffect(() => {
    setFormData(address);
  }, [address]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Địa chỉ giao hàng</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Thay đổi
          </button>
        </div>
        <div className="mt-4 space-y-2 text-gray-600">
          <p className="font-medium">{address.buildingName}</p>
          <p>{address.street}</p>
          <p>
            {address.city}, {address.state}
          </p>
          <p>
            {address.country}, {address.pincode}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-semibold">Cập nhật địa chỉ</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tên tòa nhà/Số nhà
          </label>
          <input
            type="text"
            value={formData.buildingName}
            onChange={(e) =>
              setFormData({ ...formData, buildingName: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Đường
          </label>
          <input
            type="text"
            value={formData.street}
            onChange={(e) =>
              setFormData({ ...formData, street: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Thành phố
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tỉnh/Thành
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quốc gia
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mã bưu điện
            </label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) =>
                setFormData({ ...formData, pincode: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-full border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="rounded-full bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </form>
  );
};

const ReviewOrder: React.FC = () => {
  const cartStore = useCartStore();
  const cartItems = cartStore.items;
  const addresses = useAddressBookStore((s) => s.addresses);
  const addAddress = useAddressBookStore((s) => s.addAddress);
  const editAddress = useAddressBookStore((s) => s.editAddress);
  const deleteAddress = useAddressBookStore((s) => s.deleteAddress);
  const account = useAuthStore((s) => s.user);
  const [showAddressBook, setShowAddressBook] = useState(false);
  // Lấy địa chỉ mặc định (đầu tiên)
  const [selectedAddress, setSelectedAddress] = useState<AddressResDto | null>(
    () => addresses[0] || null,
  );
  // Giả định có state lưu các promotion user đã chọn
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedPromotions, setSelectedPromotions] = useState<
    PromotionResDto[]
  >([]); // TODO: tích hợp UI chọn mã
  const [shipCOD, setShipCOD] = useState(false);

  // Khi addresses thay đổi, cập nhật selectedAddress nếu cần
  useEffect(() => {
    if (!selectedAddress && addresses.length > 0)
      setSelectedAddress(addresses[0]);
  }, [addresses, selectedAddress]);

  // Tính toán tổng tiền và giảm giá đồng bộ với Cart
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0,
  );
  const total = cartItems.reduce((sum, item) => {
    const priceInfo = getProductPriceInfo(item.product.id, item.productPrice);
    return sum + priceInfo.finalPrice * item.quantity;
  }, 0);
  const totalDiscount = subtotal - total;

  const handleUpdateAddress = useCallback((newAddress: AddressResDto) => {
    setSelectedAddress(newAddress);
    toast.success("Đã cập nhật địa chỉ!");
  }, []);

  const handleSelectAddress = (addr: AddressResDto) => {
    setSelectedAddress(addr);
    setShowAddressBook(false);
  };
  const handleAddAddress = async (addr: Omit<AddressResDto, "id">) => {
    if (!account) {
      toast.error("Bạn cần đăng nhập để thêm địa chỉ.");
      return;
    }
    try {
      // Gọi API tạo địa chỉ, nhận về AddressResDto (có id)
      const newAddr = await addressApi.create({
        ...addr,
        accountId: account.id,
      });
      addAddress(newAddr);
      setSelectedAddress(newAddr);
      setShowAddressBook(false);
      toast.success("Đã thêm địa chỉ mới!");
    } catch {
      toast.error("Không thể thêm địa chỉ. Vui lòng thử lại.");
    }
  };
  const handleEditAddress = (addr: AddressResDto) => {
    editAddress(addr);
    if (selectedAddress?.id === addr.id) setSelectedAddress(addr);
  };
  const handleDeleteAddress = (id: string) => {
    deleteAddress(id);
    if (selectedAddress?.id === id && addresses.length > 1) {
      setSelectedAddress(addresses.find((a) => a.id !== id) || null);
    }
  };

  const validateOrderInfo = () => {
    if (!account || !account.email || !account.phoneNumber) {
      toast.error(
        "Vui lòng đăng nhập và bổ sung đầy đủ email, số điện thoại trước khi đặt hàng.",
      );
      return false;
    }
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng.");
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateOrderInfo()) return;
    const validPromotionIds = filterValidPromotionsForOrder(
      selectedPromotions,
      cartItems,
      total,
    );
    const payload = {
      cartId: cartStore.id!,
      addressId: selectedAddress ? selectedAddress.id : "", // Không dùng ?.id!
      promotionIds: validPromotionIds,
      shipCOD, // lấy từ state
    };
    try {
      const orderRes = await orderApi.placeOrder(payload);
      toast.success("Đặt hàng thành công!");
      cartStore.clearCart();
      if (!payload.shipCOD && orderRes.id) {
        const { paymentUrl } = await paymentApi.createStripePaymentSession(
          orderRes.id,
        );
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
        }
      }
      // Nếu là shipCOD hoặc không lấy được paymentUrl, chuyển hướng sang trang đơn hàng
      // window.location.href = `/orders/${orderRes.id}`;
    } catch (err) {
      toast.error(
        (err as Error)?.message || "Đặt hàng thất bại. Vui lòng thử lại.",
      );
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold">Xác nhận đơn hàng</h1>
        <div className="rounded-lg bg-white p-6 text-center text-gray-500 shadow">
          Giỏ hàng của bạn đang trống.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Xác nhận đơn hàng</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Address Section */}
          <div className="mb-6">
            {selectedAddress && (
              <AddressForm
                address={selectedAddress}
                onUpdate={handleUpdateAddress}
              />
            )}
            <button
              className="mt-2 rounded-full border px-4 py-2 text-sm transition hover:bg-black hover:text-white"
              onClick={() => setShowAddressBook(true)}
            >
              Chọn địa chỉ khác
            </button>
            {showAddressBook && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="relative w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
                  <button
                    className="absolute right-2 top-2 text-xl"
                    onClick={() => setShowAddressBook(false)}
                  >
                    &times;
                  </button>
                  <AddressBookSelector
                    addresses={addresses}
                    onSelect={handleSelectAddress}
                    onAdd={handleAddAddress}
                    onEdit={handleEditAddress}
                    onDelete={handleDeleteAddress}
                    selectedId={selectedAddress?.id}
                  />
                </div>
              </div>
            )}
          </div>
          {/* Order Items */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Sản phẩm</h3>
            <div className="divide-y">
              {cartItems.map((item) => {
                const priceInfo = getProductPriceInfo(
                  item.product.id,
                  item.productPrice,
                );
                const hasDiscount = priceInfo.finalPrice < item.productPrice;
                return (
                  <div key={item.id} className="flex py-4">
                    <div className="h-24 w-24 flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.productName}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">
                            {item.product.productName}
                          </h4>
                          <p className="mt-1 text-sm text-gray-500">
                            Số lượng: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-red-600">
                            {formatPrice(priceInfo.finalPrice)}
                          </p>
                          {hasDiscount && (
                            <p className="text-sm text-gray-500 line-through">
                              {formatPrice(item.productPrice)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Tổng quan đơn hàng</h3>
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
              </div>
            </div>
            {/* Payment Method Selection */}
            <div className="mb-4 flex items-center gap-4">
              <span className="font-semibold">Phương thức thanh toán:</span>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="payment-method"
                  value="online"
                  checked={!shipCOD}
                  onChange={() => setShipCOD(false)}
                />
                <span>Thanh toán online</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="payment-method"
                  value="cod"
                  checked={shipCOD}
                  onChange={() => setShipCOD(true)}
                />
                <span>Thanh toán khi nhận hàng (COD)</span>
              </label>
            </div>
            <div className="mt-6 space-y-3">
              <button
                className="block w-full rounded-full bg-black px-4 py-3 text-center text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-lg active:scale-95"
                onClick={handlePlaceOrder}
              >
                Tiến hành thanh toán
              </button>
              <Link
                to="/cart"
                className="block w-full rounded-full border border-black bg-white px-4 py-3 text-center text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-black hover:text-white hover:shadow-lg active:scale-95"
              >
                Quay lại giỏ hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewOrder;
