import type { ProductResDto, PromotionResDto } from "./index";

export interface AddressDto {
  id: string;
  street: string;
  buildingName: string;
  city: string;
  country: string;
  state: string;
  pincode: string;
  accountId: string | null;
}

export interface OrderItemDto {
  id: string;
  totalPriceProduct: number;
  updatePriceProduct: number;
  quantity: number;
  product: ProductResDto;
}

export interface OrderDto {
  id: string;
  totalPrice: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  deliveryStatus: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";
  orderDate: string;
  accountId: string;
  address: AddressDto;
  usedPromotions: PromotionResDto[];
  orderItems: OrderItemDto[];
  shipCOD: boolean;
}
