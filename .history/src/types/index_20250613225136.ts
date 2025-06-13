// Main types file - combines API types with frontend-specific types
// Re-export all API types
export * from "./api";

// Re-export order types with explicit naming to avoid conflicts
export type {
  OrderDto,
  AddressDto,
  OrderItemDto as LegacyOrderItemDto,
} from "./order";

// Frontend-specific types that extend API types
export type HeroSlideDto = import("./api").ProductResDto;

// Legacy compatibility - alias API types for existing code
export type { ApiPageableResponse as PaginatedResponse } from "./api";
