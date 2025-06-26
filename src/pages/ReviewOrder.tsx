/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice";
import AddressBookSelector from "../components/common/AddressBookSelector";
import { useAddressBookStore } from "../store/addressBookStore";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import type { AddressResDto, CartResDto } from "../types/api";
import {
  getProductPriceInfo,
  filterValidPromotionsForOrder,
} from "../utils/helpers";
import type { PromotionResDto } from "../types/api";
import { addressApi, orderApi, paymentApi } from "../services/apiService";
import { useQuery } from "@tanstack/react-query";
import { promotionApi } from "../services/apiService";

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
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const isBuyNowMode = queryParams.get("mode") === "buy-now";
  const [buyNowCartId] = useState<string | null>(
    isBuyNowMode ? localStorage.getItem("buyNowCartId") : null,
  );
  const [buyNowCart, setBuyNowCart] = useState<CartResDto | null>(null);
  const [loadingBuyNowCart, setLoadingBuyNowCart] = useState(false);
  const [buyNowError, setBuyNowError] = useState<string | null>(null);
  const cartStore = useCartStore();
  const cartItems = cartStore.items;
  const addresses = useAddressBookStore((s) => s.addresses);
  const setAddresses = useAddressBookStore((s) => s.setAddresses);
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
  const [selectedPromotionIds, setSelectedPromotionIds] = useState<string[]>(
    [],
  );
  const [shipCOD, setShipCOD] = useState(false);

  // Khi addresses thay đổi, cập nhật selectedAddress nếu cần
  useEffect(() => {
    if (!selectedAddress && addresses.length > 0)
      setSelectedAddress(addresses[0]);
  }, [addresses, selectedAddress]);

  // Fetch addresses from BE if user is logged in and store is empty
  useEffect(() => {
    const fetchAddresses = async () => {
      if (account?.id && addresses.length === 0) {
        try {
          const { addressApi } = await import("../services/apiService");
          const addressesFromBE = await addressApi.getByAccountId(account.id);
          setAddresses(addressesFromBE);
        } catch (err) {
          console.warn("[ReviewOrder] Fetch address from BE failed:", err);
        }
      }
    };
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.id]);

  // Lấy promotion từ BE (dùng getList, lấy content)
  const { data: promotionPage, isLoading: loadingPromotions } = useQuery({
    queryKey: ["promotions"],
    queryFn: () => promotionApi.getList(),
  });
  const allPromotions: PromotionResDto[] = promotionPage?.data || [];
  // Lọc promotion hợp lệ cho cart hiện tại (trả về object)
  const validPromotions: PromotionResDto[] = allPromotions.filter(
    (promo) =>
      filterValidPromotionsForOrder(
        [promo],
        cartItems,
        cartItems.reduce(
          (sum, item) => sum + item.productPrice * item.quantity,
          0,
        ),
      ).length > 0,
  );
  // Chọn promotion (nhiều hoặc 1, tuỳ BE)
  // Khi chọn promotion
  const handlePromotionChange = (id: string) => {
    setSelectedPromotionIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
  };
  // Tính lại total theo promotion đã chọn (giữ nguyên logic cũ, vì getProductPriceInfo chỉ nhận 2 tham số)
  const totalAfterPromotion = cartItems.reduce((sum, item) => {
    const priceInfo = getProductPriceInfo(item.product.id, item.productPrice);
    return sum + priceInfo.finalPrice * item.quantity;
  }, 0);
  const totalDiscount =
    cartItems.reduce(
      (sum, item) => sum + item.productPrice * item.quantity,
      0,
    ) - totalAfterPromotion;

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

  // Validate order info (tách riêng cho buy-now và cart)
  const validateOrderInfo = useCallback(() => {
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
  }, [account, selectedAddress]);

  // State để hiển thị paymentUrl nếu có
  const [stripePaymentUrl, setStripePaymentUrl] = useState<string | null>(null);

  const handlePlaceOrder = useCallback(async () => {
    if (!validateOrderInfo()) return;
    if (isBuyNowMode && buyNowCartId && buyNowCart) {
      // Đặt hàng với cart phụ (buy-now)
      const payload = {
        cartId: buyNowCartId,
        addressId: selectedAddress ? selectedAddress.id : "",
        promotionIds: selectedPromotionIds,
        shipCOD,
      };
      try {
        const orderRes = await orderApi.placeOrder(payload);
        toast.success("Đặt hàng thành công!");
        localStorage.removeItem("buyNowCartId");
        if (!payload.shipCOD && orderRes.id) {
          const { paymentUrl } = await paymentApi.createStripePaymentSession(
            orderRes.id,
          );
          if (paymentUrl) {
            window.location.href = paymentUrl;
            return;
          }
        }
        navigate("/"); // về trang chủ nếu không phải online
      } catch (err) {
        toast.error(
          (err as Error)?.message || "Đặt hàng thất bại. Vui lòng thử lại.",
        );
      }
    } else {
      // Đặt hàng với cart chính
      const payload = {
        cartId: cartStore.id!,
        addressId: selectedAddress ? selectedAddress.id : "",
        promotionIds: selectedPromotionIds,
        shipCOD,
      };
      try {
        const orderRes = await orderApi.placeOrder(payload);
        toast.success("Đặt hàng thành công!");
        useCartStore.getState().resetCart();
        if (!payload.shipCOD && orderRes.id) {
          const { paymentUrl } = await paymentApi.createStripePaymentSession(
            orderRes.id,
          );
          if (paymentUrl) {
            window.location.href = paymentUrl;
            return;
          }
        }
        navigate("/"); // về trang chủ nếu không phải online
      } catch (err) {
        toast.error(
          (err as Error)?.message || "Đặt hàng thất bại. Vui lòng thử lại.",
        );
      }
    }
  }, [
    cartStore.id,
    selectedAddress,
    selectedPromotionIds,
    shipCOD,
    validateOrderInfo,
    isBuyNowMode,
    buyNowCartId,
    buyNowCart,
    navigate,
  ]);

  // Hiển thị thông báo chứa paymentUrl nếu có
  useEffect(() => {
    if (stripePaymentUrl) {
      toast(
        (t) => (
          <span>
            Đang chuyển hướng tới trang thanh toán Stripe...
            <br />
            <a
              href={stripePaymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2563eb", wordBreak: "break-all" }}
            >
              {stripePaymentUrl}
            </a>
          </span>
        ),
        { duration: 10000 },
      );
    }
  }, [stripePaymentUrl]);

  // Nếu chưa có địa chỉ, hiển thị thông báo và nút thêm địa chỉ, disable đặt hàng
  const noAddress = addresses.length === 0 || !selectedAddress;

  // Thay cartItems thành itemsToShow để dùng chung cho cả 2 mode
  const itemsToShow: import("../types/api").CartItemResDto[] =
    isBuyNowMode && buyNowCart && buyNowCart.cartItems
      ? buyNowCart.cartItems
      : cartStore.items;

  // Khi chuyển giữa các mode, reset selectedPromotionIds
  useEffect(() => {
    if (!isBuyNowMode) setSelectedPromotionIds([]);
  }, [isBuyNowMode]);

  // Bảo vệ route: chỉ cho phép user đã đăng nhập truy cập trang này
  useEffect(() => {
    if (!account) {
      toast.error("Bạn cần đăng nhập để tiếp tục.");
      navigate(
        "/login?redirect=/review-order" + (isBuyNowMode ? "?mode=buy-now" : ""),
      );
    }
  }, [account, navigate, isBuyNowMode]);

  // Khi ở buy-now mode, fetch cart phụ từ BE
  useEffect(() => {
    if (isBuyNowMode && buyNowCartId) {
      setLoadingBuyNowCart(true);
      setBuyNowError(null);
      import("../services/apiService").then(({ cartApi }) => {
        cartApi
          .getById(buyNowCartId)
          .then((cart) => {
            setBuyNowCart(cart);
            setLoadingBuyNowCart(false);
          })
          .catch(() => {
            setBuyNowError(
              "Không tìm thấy giỏ hàng 'Mua ngay'. Vui lòng thử lại từ trang sản phẩm.",
            );
            setLoadingBuyNowCart(false);
          });
      });
    }
  }, [isBuyNowMode, buyNowCartId]);

  // UI: nếu là buy-now và lỗi lấy cart phụ, hiển thị lỗi
  if (isBuyNowMode && buyNowError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold">Xác nhận đơn hàng</h1>
        <div className="rounded-lg bg-white p-6 text-center text-red-600 shadow">
          {buyNowError}
        </div>
        <button
          className="mt-4 rounded-full bg-black px-4 py-2 text-white"
          onClick={() => navigate("/")}
        >
          Quay về trang chủ
        </button>
      </div>
    );
  }
  // UI: nếu là buy-now và đang loading cart phụ
  if (isBuyNowMode && loadingBuyNowCart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold">Xác nhận đơn hàng</h1>
        <div className="rounded-lg bg-white p-6 text-center shadow">
          Đang tải giỏ hàng "Mua ngay"...
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
            {noAddress ? (
              <div className="flex flex-col items-center rounded-lg bg-white p-6 text-center shadow">
                <p className="mb-4 font-semibold text-red-600">
                  Bạn chưa có địa chỉ giao hàng.
                </p>
                <button
                  className="rounded-full bg-black px-4 py-2 text-white transition hover:bg-gray-800"
                  onClick={() => setShowAddressBook(true)}
                >
                  Thêm địa chỉ mới
                </button>
              </div>
            ) : (
              <>
                <AddressForm
                  address={selectedAddress}
                  onUpdate={handleUpdateAddress}
                />
                <button
                  className="mt-2 rounded-full border px-4 py-2 text-sm transition hover:bg-black hover:text-white"
                  onClick={() => setShowAddressBook(true)}
                >
                  Chọn địa chỉ khác
                </button>
              </>
            )}
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
              {itemsToShow.map(
                (item: import("../types/api").CartItemResDto) => {
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
                },
              )}
            </div>
          </div>
          {/* Promotion Section */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Chọn mã khuyến mãi</h3>
            {loadingPromotions ? (
              <div>Đang tải khuyến mãi...</div>
            ) : validPromotions.length === 0 ? (
              <div className="text-gray-500">Không có khuyến mãi phù hợp</div>
            ) : (
              <div className="space-y-2">
                {validPromotions.map((promo) => (
                  <label key={promo.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedPromotionIds.includes(promo.id)}
                      onChange={() => handlePromotionChange(promo.id)}
                    />
                    <span className="font-medium text-green-700">
                      {promo.promotionName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {promo.description}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Tổng quan đơn hàng</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>
                  {formatPrice(
                    itemsToShow.reduce(
                      (sum, item) => sum + item.productPrice * item.quantity,
                      0,
                    ),
                  )}
                </span>
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
                  <span>{formatPrice(totalAfterPromotion)}</span>
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
                  disabled={noAddress}
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
                  disabled={noAddress}
                />
                <span>Thanh toán khi nhận hàng (COD)</span>
              </label>
            </div>
            <div className="mt-6 space-y-3">
              <button
                className={`block w-full rounded-full px-4 py-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 ${
                  noAddress
                    ? "cursor-not-allowed bg-gray-300 text-gray-500"
                    : "bg-black text-white hover:bg-white hover:text-black"
                }`}
                onClick={noAddress ? undefined : handlePlaceOrder}
                disabled={noAddress}
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
