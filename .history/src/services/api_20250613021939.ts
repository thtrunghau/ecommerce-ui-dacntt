import axios from "./axios";
import type {
  CategoryResDto,
  ProductResDto,
  PromotionResDto,
  PaginatedResponse,
  CartResDto,
  CartItemResDto,
} from "../types";
import type { AxiosResponse } from "axios";

// Định nghĩa interface cho response
interface ApiResponse<T> {
  data: T;
  [key: string]: unknown;
}

// Trích xuất dữ liệu từ phản hồi API
const extractData = <T>(response: AxiosResponse<T> | ApiResponse<T> | T): T => {
  // Kiểm tra xem response có property data và có type AxiosResponse hoặc ApiResponse
  if (
    typeof response === "object" &&
    response !== null &&
    "data" in response &&
    response.data !== undefined
  ) {
    return response.data as T;
  }
  return response as T;
};

// Interface cho phản hồi phân trang
interface ApiPaginatedResponse<T> {
  data?: PaginatedResponse<T> | T[];
  [key: string]: unknown;
}

// Trích xuất dữ liệu từ phản hồi API được phân trang
const extractPaginatedData = <T>(
  response:
    | AxiosResponse<PaginatedResponse<T> | T[]>
    | ApiPaginatedResponse<T>
    | PaginatedResponse<T>
    | T[],
): PaginatedResponse<T> => {
  // Xử lý trường hợp response là AxiosResponse hoặc ApiResponse
  let apiResponse: PaginatedResponse<T> | T[];

  if (
    typeof response === "object" &&
    response !== null &&
    "data" in response &&
    response.data !== undefined
  ) {
    apiResponse = response.data as PaginatedResponse<T> | T[];
  } else {
    apiResponse = response as PaginatedResponse<T> | T[];
  }

  // Nếu apiResponse là mảng (không có pagination), tự tạo pagination response
  if (Array.isArray(apiResponse)) {
    return {
      currentPage: 1,
      pageSize: apiResponse.length,
      totalPages: 1,
      totalElements: apiResponse.length,
      data: apiResponse,
      first: true,
      last: true,
    };
  }

  // Trường hợp apiResponse là PaginatedResponse
  return apiResponse;
};

// Thêm field key cho category dựa vào categoryName (nếu cần)
const addKeyToCategory = (category: CategoryResDto): CategoryResDto => {
  if (!category || !category.categoryName) {
    console.warn("[API] Received invalid category without name", category);
    return category;
  }
  // Tạo key từ categoryName bằng cách chuyển đổi thành lowercase và thay thế khoảng trắng bằng dấu gạch ngang
  const key = category.categoryName.toLowerCase().replace(/\s+/g, "-");
  return { ...category, key };
};

// API Categories
export const getCategories = async (
  page = 0,
  size = 10,
  sort = "createdAt,DESC",
) => {
  console.log("[API] Fetching categories with pagination:", {
    page,
    size,
    sort,
  });
  try {
    const response = await axios.get(
      `/api/v1/categories?page=${page}&size=${size}&sort=${sort}`,
    );
    const paginatedResponse = extractPaginatedData<CategoryResDto>(response);

    // Đảm bảo paginatedResponse.data luôn là mảng
    if (!paginatedResponse.data) {
      console.warn(
        "[API] No data field in categories response, using empty array",
      );
      paginatedResponse.data = [];
    }

    // Thêm key cho mỗi category
    paginatedResponse.data = paginatedResponse.data.map(addKeyToCategory);
    console.log(`[API] Fetched ${paginatedResponse.data.length} categories`);

    return paginatedResponse;
  } catch (error) {
    console.error("[API] Error fetching categories:", error);
    throw error;
  }
};

export const getCategoryById = async (id: string) => {
  console.log(`[API] Fetching category by id: ${id}`);
  const response = await axios.get(`/api/v1/categories/${id}`);
  const category = extractData<CategoryResDto>(response);
  return addKeyToCategory(category);
};

// Product APIs
export const getProductById = async (id: string): Promise<ProductResDto> => {
  const response = await axios.get<ProductResDto>(`/products/${id}`);
  return extractData(response);
};

export const getProducts = async (params?: {
  page?: number;
  size?: number;
  categoryId?: string;
}): Promise<PaginatedResponse<ProductResDto>> => {
  const response = await axios.get<PaginatedResponse<ProductResDto>>('/products', {
    params,
  });
  return extractData(response);
};

// API Promotions
export const getPromotions = async (page = 0, size = 10) => {
  console.log("[API] Fetching promotions with pagination:", { page, size });
  const response = await axios.get(
    `/api/v1/promotions?page=${page}&size=${size}`,
  );
  return extractPaginatedData<PromotionResDto>(response);
};

export const getPromotionById = async (id: string) => {
  console.log(`[API] Fetching promotion by id: ${id}`);
  const response = await axios.get(`/api/v1/promotions/${id}`);
  return extractData<PromotionResDto>(response);
};

// API Cart
export const getCart = async () => {
  console.log("[API] Fetching current cart");
  try {
    // Lấy tất cả giỏ hàng của tài khoản hiện tại (API sẽ lọc theo token)
    const response = await axios.get("/api/v1/carts");
    const paginatedResponse = extractPaginatedData<CartResDto>(response);

    // Thông thường, mỗi account chỉ có một cart, nên lấy cart đầu tiên
    if (paginatedResponse.data && paginatedResponse.data.length > 0) {
      console.log(`[API] Found cart with id: ${paginatedResponse.data[0].id}`);
      return paginatedResponse.data[0];
    } else {
      console.warn("[API] No cart found for current account");
      // Trả về cart trống nếu không tìm thấy (có thể thay bằng tạo cart mới)
      return {
        id: "",
        accountId: "",
        cartItems: [],
      };
    }
  } catch (error) {
    console.error("[API] Error fetching cart:", error);
    throw error;
  }
};

export const addToCart = async (productId: string, quantity: number) => {
  console.log(`[API] Adding product to cart:`, { productId, quantity });
  try {
    // Trước hết cần lấy cartId của user hiện tại
    const currentCart = await getCart();
    if (!currentCart || !currentCart.id) {
      throw new Error("Không tìm thấy giỏ hàng, vui lòng đăng nhập");
    }

    // Sau đó thêm sản phẩm vào cart đó
    const response = await axios.post("/api/v1/cart-items", {
      productId,
      quantity,
      cartId: currentCart.id,
    });

    console.log(`[API] Successfully added product ${productId} to cart`);
    return extractData<CartItemResDto>(response);
  } catch (error) {
    console.error("[API] Error adding product to cart:", error);
    throw error;
  }
};

export const updateCartItem = async (cartItemId: string, quantity: number) => {
  console.log(`[API] Updating cart item:`, { cartItemId, quantity });
  try {
    if (quantity <= 0) {
      console.warn(
        `[API] Invalid quantity ${quantity}, removing item from cart instead`,
      );
      return removeFromCart(cartItemId);
    }

    const response = await axios.put(`/api/v1/cart-items/${cartItemId}`, {
      quantity,
    });
    console.log(
      `[API] Successfully updated cart item ${cartItemId} quantity to ${quantity}`,
    );
    return extractData<CartItemResDto>(response);
  } catch (error) {
    console.error("[API] Error updating cart item:", error);
    throw error;
  }
};

export const removeFromCart = async (cartItemId: string) => {
  console.log(`[API] Removing item from cart: ${cartItemId}`);
  try {
    await axios.delete(`/api/v1/cart-items/${cartItemId}`);
    console.log(`[API] Successfully removed cart item ${cartItemId}`);
    return true;
  } catch (error) {
    console.error("[API] Error removing cart item:", error);
    throw error;
  }
};
