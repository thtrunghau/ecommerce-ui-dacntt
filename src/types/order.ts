import type { ProductResDto, PromotionResDto } from "./index";
import type { AddressResDto } from "./api";

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
  address: AddressResDto;
  usedPromotions: PromotionResDto[];
  orderItems: OrderItemDto[];
}
