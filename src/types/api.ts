// ===========================
// API Types based on OpenAPI Specification
// ===========================

// Common Types
export type UUID = string; // UUID format validation should be handled by backend
export type ISODateString = string; // ISO 8601 date-time format
export type PromotionCode = string; // Pattern: ^[A-Z0-9]+$
export type VietnamesePhoneNumber = string; // Pattern: ^0\d{9}$

// Enums from API specification
export type PromotionType =
  | "ALL_PRODUCTS"
  | "ORDER_TOTAL"
  | "SPECIFIC_PRODUCTS";
export type ProportionType = "PERCENTAGE" | "ABSOLUTE";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
export type DeliveryStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";
export type ContentDisposition = "inline" | "attachment";
export type S3ACL =
  | "private"
  | "public-read"
  | "public-read-write"
  | "authenticated-read"
  | "aws-exec-read"
  | "bucket-owner-read"
  | "bucket-owner-full-control"
  | "null";

// ===========================
// Request DTOs (from API spec)
// ===========================

export interface ProductReqDto {
  productName?: string; // min 5 chars
  image?: string;
  description?: string; // min 5 chars
  quantity: number; // int32, required
  price: number; // double, required
  categoryId: UUID; // required
}

export interface PromotionReqDto {
  promotionName?: string; // min 5 chars
  promotionCode?: PromotionCode; // min 5 chars, pattern: ^[A-Z0-9]+$
  description?: string; // min 10 chars
  startDate: ISODateString; // required
  endDate: ISODateString; // required
  discountAmount?: number; // double
  promotionType: PromotionType; // required
  proportionType: ProportionType; // required
  minOrderValue?: number; // double
  productIds?: UUID[]; // unique items
}

export interface CategoryReqDto {
  categoryName?: string; // min 5 chars
}

export interface AddressReqDto {
  street?: string; // min 5 chars
  buildingName?: string; // min 5 chars
  city?: string; // min 4 chars
  country?: string; // min 2 chars
  state?: string; // min 2 chars
  pincode?: string; // min 6 chars
  accountId: UUID; // required
}

export interface AccountRequestDTO {
  username?: string; // min 1 char
  email?: string; // min 1 char
  password?: string;
  birthYear?: number; // int32
  phoneNumber?: VietnamesePhoneNumber; // pattern: ^0\d{9}$
  groupId?: UUID;
}

export interface PlaceOrderReqDto {
  cartId: UUID; // required
  addressId: UUID; // required
  promotionIds?: UUID[];
  isShipCOD?: boolean;
}

export interface CartQuantityReqDto {
  cartId?: UUID;
  productId: UUID; // required
  delta: number; // required, int32
}

export interface AuthRequestDTO {
  email: string; // min 1 char
  password: string; // min 1 char
}

export interface GoogleAuthRequestDTO {
  idToken: string; // min 1 char
}

export interface GroupRequestDTO {
  name?: string; // min 1 char
}

// ===========================
// Response DTOs (inferred from API spec)
// ===========================

export interface AccountResponseDTO {
  id: UUID;
  username?: string;
  email?: string;
  birthYear?: number; // int32
  phoneNumber?: string;
  // Chuẩn hóa: backend có thể trả về group (object) hoặc groupId (string)
  group?: { id: UUID } | null;
  groupId?: UUID;
}

export interface GroupResponseDTO {
  id: UUID;
  name?: string;
}

export interface ExtGroupResponseDTO {
  id: UUID;
  name?: string;
  accounts?: AccountResponseDTO[];
}

export interface S3PresignedResponseDTO {
  url?: string;
  key?: string;
  expiration?: ISODateString;
  signedHeaders?: Record<string, string>;
}

// JWT Token Structure
export interface Jwt {
  tokenValue?: string;
  issuedAt?: ISODateString;
  expiresAt?: ISODateString;
  headers?: Record<string, unknown>;
  claims?: Record<string, unknown>;
  id?: string;
  subject?: string;
  issuer?: string; // URL format
  audience?: string[];
  notBefore?: ISODateString;
}

export interface GrantedAuthority {
  authority?: string;
}

export interface Token {
  token?: Jwt;
  authorities?: GrantedAuthority[];
  accessToken?: string; // Thêm trường này để hỗ trợ backend trả về accessToken
}

// ===========================
// API Pagination (exact match with backend)
// ===========================

export interface ApiPageableResponse<T = object> {
  currentPage: number; // int32
  pageSize: number; // int32
  totalPages: number; // int32
  totalElements: number; // int64
  data: T[];
  first: boolean;
  last: boolean;
}

// ===========================
// Query Parameters for API calls
// ===========================

export interface PaginationParams {
  page?: number; // Zero-based page index (0..N), default: 0
  size?: number; // The size of the page to be returned, default: 10
  sort?: string[]; // Sorting criteria, default: ["createdAt,DESC"]
  filter?: string[]; // Filtering criteria, default: []
  [key: string]: unknown; // Allow additional parameters
}

export interface S3PresignedGetParams {
  key: string;
  contentDisposition: ContentDisposition;
}

export interface S3PresignedPutParams {
  filename: string; // pattern: ^[\w\s\-()]+\.[a-zA-Z]{2,4}$
  acl: S3ACL;
  metadata?: Record<string, string>;
}

// ===========================
// API Error Response Structure (common patterns)
// ===========================

export interface ApiError {
  message?: string;
  status?: number;
  timestamp?: string;
  path?: string;
  error?: string;
  details?: string[];
}

// ===========================
// Product Description JSON Structure
// ===========================

// New structure for parsed product description
export interface ProductDescriptionJson {
  summary: string;
  description: string;
  link_video?: string; // Optional video link
  color?: string[]; // Array of hex color codes (e.g., ["#FF0000", "#00FF00"])
  attribute?: Record<string, string>; // Key-value pairs for product attributes

  // Product variants support
  variants?: {
    type: "color" | "size" | "storage" | "model";
    label: string; // "Màu sắc", "Dung lượng", "Kích thước"
    options: Array<{
      value: string; // "red", "128gb", "large"
      label: string; // "Đỏ", "128GB", "Lớn"
      productId?: UUID; // Link to variant product (if exists)
      price?: number; // Price difference (+1000000 for 256GB)
      image?: string; // Variant-specific image
      available?: boolean; // Stock availability
    }>;
  }[];
}

// Extended Product type with parsed description
export interface ProductWithParsedDescription
  extends Omit<ProductResDto, "description"> {
  description: string; // Raw description string from backend
  parsedDescription: ProductDescriptionJson; // Parsed description object
}

// ===========================
// Frontend-specific types (extend API types)
// ===========================

// Product with frontend-specific fields
export interface ProductResDto extends Omit<ProductReqDto, "categoryId"> {
  id: UUID;
  productName: string;
  image: string;
  description: string;
  categoryId: UUID;
  isNew?: boolean; // Frontend-specific
  slug?: string; // Frontend-specific for SEO
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

// Category with products populated
export interface CategoryResDto {
  id: UUID;
  categoryName: string;
  key?: string; // Frontend-specific for routing
  products?: ProductResDto[];
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

// Promotion with additional computed fields
export interface PromotionResDto extends PromotionReqDto {
  id: UUID;
  promotionName: string;
  promotionCode: PromotionCode;
  description: string;
  isActive?: boolean; // Computed based on dates
  isExpired?: boolean; // Computed based on endDate
  applicableProducts?: ProductResDto[]; // Populated products
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

// Cart Item with price at time of adding
export interface CartItemResDto {
  id: UUID;
  productPrice: number; // Price when added to cart
  quantity: number;
  cartId: UUID;
  product: ProductResDto;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

// Cart with items populated
export interface CartResDto {
  id: UUID;
  accountId: UUID;
  cartItems: CartItemResDto[];
  totalItems?: number; // Computed
  totalPrice?: number; // Computed
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

// Address with optional fields for display
export interface AddressResDto extends AddressReqDto {
  id: UUID;
  street: string;
  buildingName: string;
  city: string;
  country: string;
  state: string;
  pincode: string;
  isDefault?: boolean; // Frontend-specific
  fullAddress?: string; // Computed for display
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

// Order item with pricing details
export interface OrderItemDto {
  id: UUID;
  totalPriceProduct: number; // Original price * quantity
  updatePriceProduct: number; // After promotions
  quantity: number;
  product: ProductResDto;
}

// Complete order structure
export interface OrderResDto {
  id: UUID;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  isShipCOD: boolean;
  orderDate: ISODateString;
  accountId: UUID;
  address: AddressResDto;
  usedPromotions: PromotionResDto[];
  orderItems: OrderItemDto[];
  trackingNumber?: string; // Optional tracking
  estimatedDelivery?: ISODateString; // Estimated delivery date
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

// ===========================
// API Response Wrappers
// ===========================

export type ApiResponse<T> = T | ApiError;
export type PaginatedApiResponse<T> = ApiPageableResponse<T> | ApiError;

// Helper type for API calls
export interface ApiCallOptions extends PaginationParams {
  signal?: AbortSignal; // For request cancellation
  timeout?: number; // Request timeout in ms
}
