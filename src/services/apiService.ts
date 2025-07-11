// API service layer based on OpenAPI specification
import type {
  ProductReqDto,
  ProductResDto,
  CategoryResDto,
  PromotionReqDto,
  PromotionResDto,
  CartResDto,
  CartQuantityReqDto,
  OrderResDto,
  PlaceOrderReqDto,
  AddressReqDto,
  AddressResDto,
  AccountRequestDTO,
  AccountResponseDTO,
  AuthRequestDTO,
  GoogleAuthRequestDTO,
  ApiPageableResponse,
  PaginationParams,
  Token,
  UUID,
  GroupResponseDTO,
  PaymentStatus,
  DeliveryStatus,
} from "../types/api";

// Base API configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API_VERSION = "/api/v1";

// Helper function to build API URLs
const buildUrl = (path: string): string =>
  `${API_BASE_URL}${API_VERSION}${path}`;
const buildAuthUrl = (path: string): string => `${API_BASE_URL}${path}`;

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Network error" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
};

// Helper function to build query string
const buildQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  return searchParams.toString();
};

// ===========================
// PRODUCT API
// ===========================
export const productApi = {
  // GET /api/v1/products
  getList: async (
    params?: PaginationParams,
  ): Promise<ApiPageableResponse<ProductResDto>> => {
    const queryString = params ? buildQueryString(params) : "";
    const url = `${buildUrl("/products")}${queryString ? `?${queryString}` : ""}`;
    console.log(`Fetching products from: ${url}`);
    try {
      const response = await fetch(url);
      const result =
        await handleResponse<ApiPageableResponse<ProductResDto>>(response);
      console.log(
        `Fetched ${result.data.length} products out of ${result.totalElements} total`,
      );
      return result;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // GET /api/v1/products/{id}
  getById: async (id: UUID): Promise<ProductResDto> => {
    const response = await fetch(buildUrl(`/products/${id}`));
    return handleResponse<ProductResDto>(response);
  },

  // POST /api/v1/products
  create: async (data: ProductReqDto): Promise<ProductResDto> => {
    const response = await fetch(buildUrl("/products"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<ProductResDto>(response);
  },

  // PUT /api/v1/products/{id}
  update: async (id: UUID, data: ProductReqDto): Promise<ProductResDto> => {
    const response = await fetch(buildUrl(`/products/${id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<ProductResDto>(response);
  },

  // DELETE /api/v1/products/{id}
  delete: async (id: UUID): Promise<void> => {
    const response = await fetch(buildUrl(`/products/${id}`), {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    await handleResponse<void>(response);
  },

  // GET /api/v1/products/similar/{id}
  getSimilar: async (id: UUID): Promise<ProductResDto[]> => {
    const response = await fetch(buildUrl(`/products/similar/${id}`));
    return handleResponse<ProductResDto[]>(response);
  },
};

// ===========================
// CATEGORY API
// ===========================
export const categoryApi = {
  // GET /api/v1/categories
  getList: async (
    params?: PaginationParams,
  ): Promise<ApiPageableResponse<CategoryResDto>> => {
    const queryString = params ? buildQueryString(params) : "";
    const url = `${buildUrl("/categories")}${queryString ? `?${queryString}` : ""}`;
    const response = await fetch(url);
    return handleResponse<ApiPageableResponse<CategoryResDto>>(response);
  },

  // GET /api/v1/categories/{id}
  getById: async (id: UUID): Promise<CategoryResDto> => {
    const response = await fetch(buildUrl(`/categories/${id}`));
    return handleResponse<CategoryResDto>(response);
  },

  // POST /api/v1/categories
  create: async (data: { categoryName: string }): Promise<CategoryResDto> => {
    const response = await fetch(buildUrl("/categories"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<CategoryResDto>(response);
  },

  // PUT /api/v1/categories/{id}
  update: async (
    id: UUID,
    data: { categoryName: string },
  ): Promise<CategoryResDto> => {
    const response = await fetch(buildUrl(`/categories/${id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<CategoryResDto>(response);
  },

  // DELETE /api/v1/categories/{id}
  delete: async (id: UUID): Promise<void> => {
    const response = await fetch(buildUrl(`/categories/${id}`), {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return;
  },
};

// ===========================
// PROMOTION API
// ===========================
export const promotionApi = {
  // GET /api/v1/promotions
  getList: async (
    params?: PaginationParams,
  ): Promise<ApiPageableResponse<PromotionResDto>> => {
    const queryString = params ? buildQueryString(params) : "";
    const url = `${buildUrl("/promotions")}${queryString ? `?${queryString}` : ""}`;
    const response = await fetch(url);
    return handleResponse<ApiPageableResponse<PromotionResDto>>(response);
  },

  // GET /api/v1/promotions/{id}
  getById: async (id: UUID): Promise<PromotionResDto> => {
    const response = await fetch(buildUrl(`/promotions/${id}`));
    return handleResponse<PromotionResDto>(response);
  },

  // GET /api/v1/promotions/get-by-code/{code}
  getByCode: async (code: string): Promise<PromotionResDto> => {
    const response = await fetch(buildUrl(`/promotions/get-by-code/${code}`));
    return handleResponse<PromotionResDto>(response);
  },

  // POST /api/v1/promotions
  create: async (data: PromotionReqDto): Promise<PromotionResDto> => {
    const response = await fetch(buildUrl("/promotions"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<PromotionResDto>(response);
  },

  // PUT /api/v1/promotions/{id}
  update: async (id: UUID, data: PromotionReqDto): Promise<PromotionResDto> => {
    const response = await fetch(buildUrl(`/promotions/${id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<PromotionResDto>(response);
  },

  // DELETE /api/v1/promotions/{id}
  delete: async (id: UUID): Promise<void> => {
    const response = await fetch(buildUrl(`/promotions/${id}`), {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return;
  },
};

// ===========================
// CART API
// ===========================
export const cartApi = {
  // GET /api/v1/carts/get-by-token
  getCurrentCart: async (): Promise<CartResDto> => {
    const response = await fetch(buildUrl("/carts/get-by-token"), {
      headers: getAuthHeaders(),
    });
    return handleResponse<CartResDto>(response);
  },

  // GET /api/v1/carts/{id}
  getById: async (id: UUID): Promise<CartResDto> => {
    const response = await fetch(buildUrl(`/carts/${id}`), {
      headers: getAuthHeaders(),
    });
    return handleResponse<CartResDto>(response);
  },

  // POST /api/v1/carts
  create: async (): Promise<CartResDto> => {
    const response = await fetch(buildUrl("/carts"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
    return handleResponse<CartResDto>(response);
  },

  // POST /api/v1/carts/update-item-quantity
  updateItemQuantity: async (data: CartQuantityReqDto): Promise<CartResDto> => {
    const response = await fetch(buildUrl("/carts/update-item-quantity"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<CartResDto>(response);
  },

  // POST /api/v1/carts/refresh-cart/{cartId}
  refreshCart: async (cartId: UUID): Promise<CartResDto> => {
    const response = await fetch(buildUrl(`/carts/refresh-cart/${cartId}`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
    return handleResponse<CartResDto>(response);
  },
};

// ===========================
// ORDER API
// ===========================
export const orderApi = {
  // GET /api/v1/orders
  getList: async (
    params?: PaginationParams,
  ): Promise<ApiPageableResponse<OrderResDto>> => {
    const queryString = params ? buildQueryString(params) : "";
    const url = `${buildUrl("/orders")}${queryString ? `?${queryString}` : ""}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ApiPageableResponse<OrderResDto>>(response);
  },

  // GET /api/v1/orders/{id}
  getById: async (id: UUID): Promise<OrderResDto> => {
    const response = await fetch(buildUrl(`/orders/${id}`), {
      headers: getAuthHeaders(),
    });
    return handleResponse<OrderResDto>(response);
  },

  // GET /api/v1/orders/get-by-account/{accountId}
  getByAccountId: async (accountId: UUID): Promise<OrderResDto[]> => {
    const response = await fetch(
      buildUrl(`/orders/get-by-account/${accountId}`),
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse<OrderResDto[]>(response);
  },

  // POST /api/v1/orders
  placeOrder: async (data: PlaceOrderReqDto): Promise<OrderResDto> => {
    const response = await fetch(buildUrl("/orders"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<OrderResDto>(response);
  },

  // POST /api/v1/orders/cal-temp-total-price
  calculateTotalPrice: async (
    data: PlaceOrderReqDto,
  ): Promise<{ totalPrice: number }> => {
    const response = await fetch(buildUrl("/orders/cal-temp-total-price"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<{ totalPrice: number }>(response);
  },

  // POST /api/v1/orders/take-available-coupon
  takeAvailableCoupon: async (
    promotionIds: UUID[],
  ): Promise<PromotionResDto[]> => {
    const response = await fetch(buildUrl("/orders/take-available-coupon"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(promotionIds),
    });
    return handleResponse<PromotionResDto[]>(response);
  },

  // PUT /api/v1/orders/{id}?paymentStatus=...&deliveryStatus=...
  updateStatus: async (
    id: UUID,
    paymentStatus?: PaymentStatus,
    deliveryStatus?: DeliveryStatus,
  ): Promise<OrderResDto> => {
    const params = [];
    if (paymentStatus) params.push(`paymentStatus=${paymentStatus}`);
    if (deliveryStatus) params.push(`deliveryStatus=${deliveryStatus}`);
    const query = params.length ? `?${params.join("&")}` : "";
    const response = await fetch(buildUrl(`/orders/${id}${query}`), {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
      },
    });
    return handleResponse<OrderResDto>(response);
  },
};

// ===========================
// ADDRESS API
// ===========================
export const addressApi = {
  // GET /api/v1/addresses
  getList: async (
    params?: PaginationParams,
  ): Promise<ApiPageableResponse<AddressResDto>> => {
    const queryString = params ? buildQueryString(params) : "";
    const url = `${buildUrl("/addresses")}${queryString ? `?${queryString}` : ""}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ApiPageableResponse<AddressResDto>>(response);
  },

  // GET /api/v1/addresses/get-by-account/{accountId}
  getByAccountId: async (accountId: UUID): Promise<AddressResDto[]> => {
    const response = await fetch(
      buildUrl(`/addresses/get-by-account/${accountId}`),
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse<AddressResDto[]>(response);
  },

  // POST /api/v1/addresses
  create: async (data: AddressReqDto): Promise<AddressResDto> => {
    const response = await fetch(buildUrl("/addresses"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<AddressResDto>(response);
  },

  // PUT /api/v1/addresses/{id}
  update: async (id: UUID, data: AddressReqDto): Promise<AddressResDto> => {
    const response = await fetch(buildUrl(`/addresses/${id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<AddressResDto>(response);
  },

  // DELETE /api/v1/addresses/{id}
  delete: async (id: UUID): Promise<void> => {
    const response = await fetch(buildUrl(`/addresses/${id}`), {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    await handleResponse<void>(response);
  },
};

// ===========================
// AUTHENTICATION API
// ===========================
export const authApi = {
  // POST /api/token
  login: async (data: AuthRequestDTO): Promise<Token> => {
    const response = await fetch(buildAuthUrl("/api/token"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Token>(response);
  },

  // POST /api/google/token
  loginWithGoogle: async (data: GoogleAuthRequestDTO): Promise<Token> => {
    const response = await fetch(buildAuthUrl("/api/google/token"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Token>(response);
  },

  // GET /api/token/details
  getTokenDetails: async (): Promise<Token> => {
    const response = await fetch(buildAuthUrl("/api/token/details"), {
      headers: getAuthHeaders(),
    });
    return handleResponse<Token>(response);
  },
};

// ===========================
// ACCOUNT API
// ===========================
export const accountApi = {
  // GET /api/v1/accounts (admin lấy danh sách user)
  getList: async (
    params?: PaginationParams,
  ): Promise<ApiPageableResponse<AccountResponseDTO>> => {
    const queryString = params ? buildQueryString(params) : "";
    const url = `${buildUrl("/accounts")}${queryString ? `?${queryString}` : ""}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ApiPageableResponse<AccountResponseDTO>>(response);
  },
  // POST /api/v1/accounts (admin tạo user mới)
  create: async (data: AccountRequestDTO): Promise<AccountResponseDTO> => {
    const response = await fetch(buildUrl("/accounts"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<AccountResponseDTO>(response);
  },
  // POST /api/v1/webapp/account/signup
  signup: async (data: AccountRequestDTO): Promise<AccountResponseDTO> => {
    const response = await fetch(buildUrl("/webapp/account/signup"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse<AccountResponseDTO>(response);
  },

  // POST /api/v1/webapp/account/google/signup
  signupWithGoogle: async (
    data: GoogleAuthRequestDTO,
  ): Promise<AccountResponseDTO> => {
    const response = await fetch(buildUrl("/webapp/account/google/signup"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse<AccountResponseDTO>(response);
  },

  // GET /api/v1/accounts/{id}
  getById: async (id: UUID): Promise<AccountResponseDTO> => {
    const response = await fetch(buildUrl(`/accounts/${id}`), {
      headers: getAuthHeaders(),
    });
    return handleResponse<AccountResponseDTO>(response);
  },

  // PUT /api/v1/accounts/{id}
  update: async (
    id: UUID,
    data: AccountRequestDTO,
  ): Promise<AccountResponseDTO> => {
    const response = await fetch(buildUrl(`/accounts/${id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<AccountResponseDTO>(response);
  },

  // DELETE /api/v1/accounts/{id} (admin xóa user)
  delete: async (id: UUID): Promise<void> => {
    const response = await fetch(buildUrl(`/accounts/${id}`), {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    await handleResponse<void>(response);
  },
};

// ===========================
// DATA INITIALIZATION API
// ===========================
export const dataApi = {
  // POST /api/v1/webapp/data/init-data
  initData: async (): Promise<unknown> => {
    const response = await fetch(buildUrl("/webapp/data/init-data"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse<unknown>(response);
  },

  // POST /api/v1/webapp/data/delete-data
  deleteData: async (): Promise<unknown> => {
    const response = await fetch(buildUrl("/webapp/data/delete-data"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse<unknown>(response);
  },
};

// ===========================
// GROUP API
// ===========================
export const groupApi = {
  // GET /api/v1/groups
  getList: async (): Promise<ApiPageableResponse<GroupResponseDTO>> => {
    const response = await fetch(buildUrl("/groups"), {
      headers: getAuthHeaders(),
    });
    return handleResponse<ApiPageableResponse<GroupResponseDTO>>(response);
  },
};

// ===========================
// S3 PRESIGNED URL & FILE UPLOAD SERVICE
// ===========================

/**
 * Lấy presigned PUT URL từ backend để upload file lên S3
 * @param fileName Tên file (có đuôi)
 * @param contentType Kiểu MIME của file (vd: 'image/png')
 * @returns { url, key }
 */
export const getPresignedPutUrl = async (
  fileName: string,
  contentType: string,
): Promise<{
  url: string;
  key: string;
  signedHeaders: Record<string, string>;
}> => {
  // Truyền thêm acl=public-read vào query string và gửi body rỗng để đúng contract backend hiện tại
  const url = `${API_BASE_URL}/api/s3/presigned-url?filename=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(contentType)}&acl=public-read`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}), // Gửi body rỗng
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await handleResponse<any>(response);
  if (!data.url || !data.key)
    throw new Error("Không lấy được presigned PUT URL");
  // Đảm bảo luôn trả về signedHeaders là object (có thể rỗng)
  return {
    url: data.url,
    key: data.key,
    signedHeaders: data.signedHeaders || {},
  };
};

/**
 * Upload file ảnh lên S3 qua presigned PUT URL
 * @param presignedUrl URL trả về từ backend
 * @param file File ảnh
 * @param signedHeaders Header cần thiết (nếu có)
 * @returns Promise<void>
 */
export const uploadFileToS3 = async (
  presignedUrl: string,
  file: File,
  signedHeaders: Record<string, string> = {},
): Promise<void> => {
  // Merge signedHeaders, but do NOT override Content-Type if BE signed it
  const headers: Record<string, string> = { ...signedHeaders };
  if (!headers["Content-Type"]) {
    headers["Content-Type"] = file.type;
  }
  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers,
    body: file,
  });
  if (!response.ok) throw new Error("Upload ảnh thất bại");
};

/**
 * Lấy presigned GET URL từ backend để truy xuất file ảnh từ S3
 * @param key key của file trên S3
 * @param contentDisposition kiểu hiển thị: 'inline' (mặc định) hoặc 'attachment'
 * @returns { url, key, expiration, signedHeaders }
 */
export const getPresignedGetUrl = async (
  key: string,
  contentDisposition: string = "inline",
): Promise<{
  url: string;
  key: string;
  expiration: string;
  signedHeaders: Record<string, string>;
}> => {
  const url = `${API_BASE_URL}/api/s3/presigned-url?key=${encodeURIComponent(key)}&contentDisposition=${encodeURIComponent(contentDisposition)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await handleResponse<any>(response);
  if (!data.url || !data.key)
    throw new Error("Không lấy được presigned GET URL");
  return data;
};

// ===========================
// STRIPE PAYMENT API
// ===========================
export const paymentApi = {
  /**
   * Gọi Stripe API để tạo session thanh toán
   * @param orderId UUID của order vừa tạo
   * @returns { paymentUrl: string }
   */
  createStripePaymentSession: async (
    orderId: UUID,
  ): Promise<{ paymentUrl: string }> => {
    // Gửi orderId qua query string thay vì body
    const response = await fetch(
      `${API_BASE_URL}/api/stripe/charges?orderId=${orderId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        // Không cần body nữa
      },
    );
    // BE trả về plain text (URL), không phải JSON
    const paymentUrl = await response.text();
    if (!response.ok || !paymentUrl.startsWith("http")) {
      throw new Error("Không lấy được link thanh toán Stripe");
    }
    return { paymentUrl };
  },
};

// Export all APIs
export const api = {
  product: productApi,
  category: categoryApi,
  promotion: promotionApi,
  cart: cartApi,
  order: orderApi,
  address: addressApi,
  auth: authApi,
  account: accountApi,
  data: dataApi,
  group: groupApi, // Thêm groupApi vào export chung
  payment: paymentApi,
};
