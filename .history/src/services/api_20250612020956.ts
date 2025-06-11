import axios from './axios';
import type { 
  CategoryResDto, 
  ProductResDto, 
  PromotionResDto, 
  PaginatedResponse,
  CartResDto, 
  CartItemResDto 
} from '../types';

// Trích xuất dữ liệu từ phản hồi API
const extractData = <T>(response: any): T => response.data;

// Trích xuất dữ liệu từ phản hồi API được phân trang
const extractPaginatedData = <T>(response: any): PaginatedResponse<T> => response.data;

// Thêm field key cho category dựa vào categoryName (nếu cần)
const addKeyToCategory = (category: CategoryResDto): CategoryResDto => {
  // Tạo key từ categoryName bằng cách chuyển đổi thành lowercase và thay thế khoảng trắng bằng dấu gạch ngang
  const key = category.categoryName.toLowerCase().replace(/\s+/g, '-');
  return { ...category, key };
};

// API Categories
export const getCategories = async (page = 0, size = 10, sort = 'createdAt,DESC') => {
  console.log('[API] Fetching categories with pagination:', { page, size, sort });
  const response = await axios.get(`/api/v1/categories?page=${page}&size=${size}&sort=${sort}`);
  const paginatedResponse = extractPaginatedData<CategoryResDto>(response);
  
  // Thêm key cho mỗi category
  paginatedResponse.data = paginatedResponse.data.map(addKeyToCategory);
  console.log(`[API] Fetched ${paginatedResponse.data.length} categories`);
  
  return paginatedResponse;
};

export const getCategoryById = async (id: string) => {
  console.log(`[API] Fetching category by id: ${id}`);
  const response = await axios.get(`/api/v1/categories/${id}`);
  const category = extractData<CategoryResDto>(response);
  return addKeyToCategory(category);
};

// API Products
export const getProducts = async (page = 0, size = 10, sort = 'createdAt,DESC') => {
  console.log('[API] Fetching products with pagination:', { page, size, sort });
  const response = await axios.get(`/api/v1/products?page=${page}&size=${size}&sort=${sort}`);
  const paginatedResponse = extractPaginatedData<ProductResDto>(response);
  console.log(`[API] Fetched ${paginatedResponse.data.length} products`);
  return paginatedResponse;
};

export const getProductById = async (id: string) => {
  console.log(`[API] Fetching product by id: ${id}`);
  const response = await axios.get(`/api/v1/products/${id}`);
  return extractData<ProductResDto>(response);
};

export const getProductsByCategory = async (categoryId: string, page = 0, size = 10) => {
  console.log(`[API] Fetching products by categoryId: ${categoryId}`);
  const response = await axios.get(`/api/v1/categories/${categoryId}/products?page=${page}&size=${size}`);
  const paginatedResponse = extractPaginatedData<ProductResDto>(response);
  console.log(`[API] Fetched ${paginatedResponse.data.length} products for category ${categoryId}`);
  return paginatedResponse;
};

// API Promotions
export const getPromotions = async (page = 0, size = 10) => {
  console.log('[API] Fetching promotions with pagination:', { page, size });
  const response = await axios.get(`/api/v1/promotions?page=${page}&size=${size}`);
  return extractPaginatedData<PromotionResDto>(response);
};

export const getPromotionById = async (id: string) => {
  console.log(`[API] Fetching promotion by id: ${id}`);
  const response = await axios.get(`/api/v1/promotions/${id}`);
  return extractData<PromotionResDto>(response);
};

// API Cart
export const getCart = async () => {
  console.log('[API] Fetching current cart');
  const response = await axios.get('/api/v1/carts/current');
  return extractData<CartResDto>(response);
};

export const addToCart = async (productId: string, quantity: number) => {
  console.log(`[API] Adding product to cart:`, { productId, quantity });
  const response = await axios.post('/api/v1/cart-items', { productId, quantity });
  return extractData<CartItemResDto>(response);
};

export const updateCartItem = async (cartItemId: string, quantity: number) => {
  console.log(`[API] Updating cart item:`, { cartItemId, quantity });
  const response = await axios.put(`/api/v1/cart-items/${cartItemId}`, { quantity });
  return extractData<CartItemResDto>(response);
};

export const removeFromCart = async (cartItemId: string) => {
  console.log(`[API] Removing item from cart: ${cartItemId}`);
  await axios.delete(`/api/v1/cart-items/${cartItemId}`);
  return true;
};