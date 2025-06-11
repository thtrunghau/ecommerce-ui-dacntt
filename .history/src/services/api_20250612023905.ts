import axios from "./axios";
import type {
  CategoryResDto,
  ProductResDto,
  PromotionResDto,
  PaginatedResponse,
  CartResDto,
  CartItemResDto,
} from "../types";

// Trích xuất dữ liệu từ phản hồi API
const extractData = <T>(response: any): T => {
  // Kiểm tra xem response có property data không, nếu có thì lấy từ response.data
  // Ngược lại trả về response trực tiếp, giả định API đã trả về đúng định dạng
  return response.data ? response.data : response;
};

// Trích xuất dữ liệu từ phản hồi API được phân trang
const extractPaginatedData = <T>(response: any): PaginatedResponse<T> => {
  // Phần lớn các API framework trả về response bọc trong .data
  const apiResponse = response.data || response;

  // Nếu không có property data trong response, giả định toàn bộ response là paginated data
  if (!apiResponse.data && Array.isArray(apiResponse)) {
    // Trường hợp API trả về mảng trực tiếp, tự tạo pagination response
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

// API Products
export const getProducts = async (
  page = 0,
  size = 10,
  sort = "createdAt,DESC",
) => {
  console.log("[API] Fetching products with pagination:", { page, size, sort });
  const response = await axios.get(
    `/api/v1/products?page=${page}&size=${size}&sort=${sort}`,
  );
  const paginatedResponse = extractPaginatedData<ProductResDto>(response);
  console.log(`[API] Fetched ${paginatedResponse.data.length} products`);
  return paginatedResponse;
};

export const getProductById = async (id: string) => {
  console.log(`[API] Fetching product by id: ${id}`);
  const response = await axios.get(`/api/v1/products/${id}`);
  return extractData<ProductResDto>(response);
};

export const getProductsByCategory = async (
  categoryId: string,
  page = 0,
  size = 10,
) => {
  console.log(`[API] Fetching products by categoryId: ${categoryId}`);
  const response = await axios.get(
    `/api/v1/categories/${categoryId}/products?page=${page}&size=${size}`,
  );
  const paginatedResponse = extractPaginatedData<ProductResDto>(response);
  console.log(
    `[API] Fetched ${paginatedResponse.data.length} products for category ${categoryId}`,
  );
  return paginatedResponse;
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
  const response = await axios.post("/api/v1/cart-items", {
    productId,
    quantity,
  });
  return extractData<CartItemResDto>(response);
};

export const updateCartItem = async (cartItemId: string, quantity: number) => {
  console.log(`[API] Updating cart item:`, { cartItemId, quantity });
  const response = await axios.put(`/api/v1/cart-items/${cartItemId}`, {
    quantity,
  });
  return extractData<CartItemResDto>(response);
};

export const removeFromCart = async (cartItemId: string) => {
  console.log(`[API] Removing item from cart: ${cartItemId}`);
  await axios.delete(`/api/v1/cart-items/${cartItemId}`);
  return true;
};
