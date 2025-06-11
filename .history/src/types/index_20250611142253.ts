// Product Types
export interface ProductResDto {
  id: string;
  productName: string;
  image: string;
  description: string;
  quantity: number;
  price: number;
  categoryId: string;
  path?: string;
  isNew?: boolean;
}

// Category Types
export interface CategoryResDto {
  id: string;
  categoryName: string;
  products: ProductResDto[];
}

// Promotion Types
export interface PromotionResDto {
  id: string;
  promotionName: string;
  promotionCode: string;
  description: string;
  startDate: string;
  endDate: string;
  discountAmount: number;
  promotionType: "ALL_PRODUCTS" | "ORDER_TOTAL" | "SPECIFIC_PRODUCTS";
  proportionType: "PERCENTAGE" | "ABSOLUTE";
  minOrderValue: number;
  productIds: string[];
}

// Cart Item Types
export interface CartItemResDto {
  id: string;
  productPrice: number;
  quantity: number;
  cartId: string;
  product: ProductResDto;
}

// Cart Types
export interface CartResDto {
  id: string;
  cartItems: CartItemResDto[];
}

// Address Types
export interface AddressResDto {
  id: string;
  street: string;
  buildingName: string;
  city: string;
  country: string;
  state: string;
  pincode: string;
  accountId: string;
}

// Order Types
export interface OrderResDto {
  id: string;
  totalPrice: number;
  paymentStatus: string;
  deliveryStatus: string;
  isShipCOD: boolean;
  orderDate: string;
  accountId: string;
  address: AddressResDto;
  usedPromotions: PromotionResDto[];
  orderItems: CartItemResDto[];
}
