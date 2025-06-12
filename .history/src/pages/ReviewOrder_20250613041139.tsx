import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import type { OrderDto, AddressDto } from "../types/order";
import { formatPrice } from "../utils/formatPrice";
import { mockOrderData } from "../mockData/orderData";

interface AddressFormProps {
  address: AddressDto;
  onUpdate: (address: AddressDto) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ address, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(address);

  const handleSubmit = (e: React.FormEvent) => {
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
  const [order, setOrder] = useState<OrderDto>(mockOrderData);

  const handleUpdateAddress = useCallback(
    (newAddress: AddressDto) => {
      setOrder({
        ...order,
        address: newAddress,
      });
      // TODO: Call API to update address
    },
    [order]
  );

  // Calculate total without discounts
  const subtotal = order.orderItems.reduce(
    (sum, item) => sum + item.totalPriceProduct,
    0
  );

  // Calculate total discounts
  const totalDiscount = order.orderItems.reduce(
    (sum, item) => sum + (item.totalPriceProduct - item.updatePriceProduct),
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Xác nhận đơn hàng</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Section */}
          <AddressForm address={order.address} onUpdate={handleUpdateAddress} />

          {/* Order Items */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Sản phẩm</h3>
            <div className="divide-y">
              {order.orderItems.map((item) => (
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
                        <h4 className="font-medium">{item.product.productName}</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatPrice(item.updatePriceProduct)}
                        </p>
                        {item.totalPriceProduct > item.updatePriceProduct && (
                          <p className="text-sm text-gray-500 line-through">
                            {formatPrice(item.totalPriceProduct)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Applied Promotions */}
          {order.usedPromotions.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold">Khuyến mãi áp dụng</h3>
              <div className="space-y-3">
                {order.usedPromotions.map((promo) => (
                  <div
                    key={promo.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                  >
                    <div>
                      <p className="font-medium">{promo.promotionName}</p>
                      <p className="text-sm text-gray-600">{promo.description}</p>
                    </div>
                    <span className="text-green-600">
                      {promo.proportionType === "PERCENTAGE"
                        ? `-${promo.discountAmount}%`
                        : `-${formatPrice(promo.discountAmount)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                  <span>{formatPrice(order.totalPrice)}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  (Đã bao gồm VAT nếu có)
                </p>
              </div>
            </div>            <div className="mt-6 space-y-3">
              <Link
                to="/payment"
                className="block w-full rounded-full bg-black px-4 py-3 text-center text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-lg active:scale-95"
              >
                Tiến hành thanh toán
              </Link>
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