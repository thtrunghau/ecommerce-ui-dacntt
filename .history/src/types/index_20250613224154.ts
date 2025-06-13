// Product Types
export interface ProductResDto {
  id: string; // UUID format expected by backend
  productName: string;
  image: string;
  description: string;
  quantity: number;
  price: number;
  categoryId: string; // UUID - bắt buộc, mỗi sản phẩm phải thuộc về một danh mục
  isNew?: boolean; // Optional để tương thích với frontend
  slug?: string; // Optional slug field for URL-friendly paths
}

// API Pagination Types (matches backend ApiPageableResponse)
export interface PaginatedResponse<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  data: T[];
  first: boolean;
  last: boolean;
}

// Hero Types
export type HeroSlideDto = ProductResDto;

// Category Types
export interface CategoryResDto {
  id: string; // UUID format
  categoryName: string;
  key?: string; // Optional vì không có trong API thực tế
  products: ProductResDto[];
}

// Promotion Types (matches backend PromotionReqDto structure)
export interface PromotionResDto {
  id: string; // UUID format
  promotionName: string;
  promotionCode: string; // Pattern: ^[A-Z0-9]+$ (backend validation)
  description: string;
  startDate: string; // ISO 8601 date-time format
  endDate: string; // ISO 8601 date-time format
  discountAmount: number; // Backend uses 'double'
  promotionType: "ALL_PRODUCTS" | "ORDER_TOTAL" | "SPECIFIC_PRODUCTS";
  proportionType: "PERCENTAGE" | "ABSOLUTE";
  minOrderValue: number;
  productIds: string[]; // Array of UUIDs
}

// Cart Item Types
export interface CartItemResDto {
  id: string; // UUID format
  productPrice: number; // Giá tại thời điểm thêm vào giỏ
  quantity: number;
  cartId: string; // UUID format
  product: ProductResDto;
}

// Cart Types
export interface CartResDto {
  id: string; // UUID format
  accountId: string; // UUID format
  cartItems: CartItemResDto[];
}

// Address Types (matches backend AddressReqDto)
export interface AddressResDto {
  id: string; // UUID format
  street: string;
  buildingName: string;
  city: string;
  country: string;
  state: string;
  pincode: string;
  accountId: string; // UUID format
}

// Order Types - Keeping existing structure for frontend compatibility
export interface OrderResDto {
  id: string; // UUID format
  totalPrice: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED"; // Extended enum
  deliveryStatus: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  isShipCOD: boolean; // Matches backend 'shipCOD' field
  orderDate: string; // ISO 8601 date-time format
  accountId: string; // UUID format
  address: AddressResDto;
  usedPromotions: PromotionResDto[];
  orderItems: CartItemResDto[]; // Reusing CartItemResDto for compatibility
}

// Additional backend-compatible types

// Account Types (from backend AccountResponseDTO)
export interface AccountResDto {
  id: string; // UUID format
  username: string;
  email: string;
  birthYear: number;
  phoneNumber: string;
}

// Request DTOs for API calls
export interface PlaceOrderReqDto {
  cartId: string; // UUID format
  addressId: string; // UUID format
  promotionIds: string[]; // Array of UUIDs
  shipCOD: boolean;
}

export interface CartQuantityReqDto {
  cartId?: string; // UUID format - optional for current cart
  productId: string; // UUID format
  delta: number; // Quantity change (+1, -1, etc.)
}

// Enhanced validation types
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type DeliveryStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PromotionType = "ALL_PRODUCTS" | "ORDER_TOTAL" | "SPECIFIC_PRODUCTS";
export type ProportionType = "PERCENTAGE" | "ABSOLUTE";

// Utility types for better type safety
export type UUID = string; // Could be branded type: string & { __brand: 'UUID' }
export type ISODateString = string; // ISO 8601 format
export type PromotionCode = string; // ^[A-Z0-9]+$ pattern
export type Price = number; // Always positive number
export type Quantity = number; // Always non-negative integer
