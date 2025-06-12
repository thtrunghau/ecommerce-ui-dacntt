import * as api from "./api";
import {
  mockCategories,
  mockProducts,
  mockPromotions,
  mockCart,
  createPaginatedResponse,
} from "../mockData/mockData";
import type { ProductResDto } from "../types";
import { isUUID } from "../utils/urlUtils";

// Cấu hình sử dụng API thực tế hay mock data
const config = {
  useRealApi: false, // Đặt thành true để sử dụng API thực tế
  mockNetworkDelay: 300, // Giả lập độ trễ mạng (ms)
};

// Wrap response trong Promise với độ trễ để giả lập API call
const mockResponse = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), config.mockNetworkDelay);
  });
};

// Categories API
export const getCategories = async (
  page = 0,
  size = 10,
  sort = "createdAt,DESC",
) => {
  console.log("[API Utils] Getting categories", {
    useRealApi: config.useRealApi,
  });

  if (config.useRealApi) {
    return api.getCategories(page, size, sort);
  }

  // Khi dùng mock data
  const response = createPaginatedResponse(mockCategories, page, size);
  return mockResponse(response);
};

export const getCategoryById = async (id: string) => {
  console.log("[API Utils] Getting category by id", {
    id,
    useRealApi: config.useRealApi,
  });

  if (config.useRealApi) {
    return api.getCategoryById(id);
  }

  const category = mockCategories.find((cat) => cat.id === id);
  if (!category) throw new Error(`Category with id ${id} not found`);

  return mockResponse(category);
};

// Products API
export const getProducts = async (
  page = 0,
  size = 10,
  sort = "createdAt,DESC",
) => {
  console.log("[API Utils] Getting products", {
    useRealApi: config.useRealApi,
  });

  if (config.useRealApi) {
    return api.getProducts(page, size, sort);
  }

  const response = createPaginatedResponse(mockProducts, page, size);
  return mockResponse(response);
};

import { isUUID } from "../utils/urlUtils";

// Product Utils
export const getProductById = async (idOrSlug: string) => {
  console.log("[API Utils] Getting product by id or slug", {
    idOrSlug,
    useRealApi: config.useRealApi,
  });

  if (!idOrSlug) {
    console.error("[API Utils] Invalid product identifier:", idOrSlug);
    throw new Error("Product identifier is required");
  }

  if (config.useRealApi) {
    try {
      // If it's a UUID, use direct API call
      if (isUUID(idOrSlug)) {
        return await api.getProductById(idOrSlug);
      }

      // For slugs, get all products and find by slug
      const productsResponse = await api.getProducts();
      const product = productsResponse.data.find(
        (p: ProductResDto) => p.slug === idOrSlug || p.id === idOrSlug,
      );
      if (!product)
        throw new Error(`Product with identifier ${idOrSlug} not found`);
      return product;
    } catch (error) {
      console.error("[API Utils] Error fetching product:", error);
      throw error;
    }
  }

  // For mock data
  const product = mockProducts.find(
    (p) => p.id === idOrSlug || p.slug === idOrSlug,
  );
  if (!product)
    throw new Error(`Product with identifier ${idOrSlug} not found`);

  return mockResponse(product);
};

export const getProductsByCategory = async (
  categoryId: string,
  page = 0,
  size = 10,
) => {
  console.log("[API Utils] Getting products by category", {
    categoryId,
    useRealApi: config.useRealApi,
  });

  if (config.useRealApi) {
    return api.getProductsByCategory(categoryId, page, size);
  }

  const filteredProducts = mockProducts.filter(
    (product) => product.categoryId === categoryId,
  );
  const response = createPaginatedResponse(filteredProducts, page, size);
  return mockResponse(response);
};

// Promotions API
export const getPromotions = async (page = 0, size = 10) => {
  console.log("[API Utils] Getting promotions", {
    useRealApi: config.useRealApi,
  });

  if (config.useRealApi) {
    return api.getPromotions(page, size);
  }

  const response = createPaginatedResponse(mockPromotions, page, size);
  return mockResponse(response);
};

export const getPromotionById = async (id: string) => {
  console.log("[API Utils] Getting promotion by id", {
    id,
    useRealApi: config.useRealApi,
  });

  if (config.useRealApi) {
    return api.getPromotionById(id);
  }

  const promotion = mockPromotions.find((promo) => promo.id === id);
  if (!promotion) throw new Error(`Promotion with id ${id} not found`);

  return mockResponse(promotion);
};

// Cart API
export const getCart = async () => {
  console.log("[API Utils] Getting cart", { useRealApi: config.useRealApi });

  if (config.useRealApi) {
    return api.getCart();
  }

  return mockResponse(mockCart);
};

export const addToCart = async (productId: string, quantity: number) => {
  console.log("[API Utils] Adding to cart", {
    productId,
    quantity,
    useRealApi: config.useRealApi,
  });

  if (!productId) {
    console.error("[API Utils] Invalid product ID for add to cart");
    throw new Error("Product ID is required to add to cart");
  }

  if (quantity <= 0) {
    console.error("[API Utils] Invalid quantity for add to cart:", quantity);
    throw new Error("Quantity must be positive to add to cart");
  }

  if (config.useRealApi) {
    return api.addToCart(productId, quantity);
  }

  // Giả lập thêm vào giỏ hàng
  const product = mockProducts.find((p) => p.id === productId);
  if (!product) throw new Error(`Product with id ${productId} not found`);

  // Kiểm tra số lượng tồn kho
  if (product.quantity < quantity) {
    console.error("[API Utils] Not enough stock");
    throw new Error(`Chỉ còn ${product.quantity} sản phẩm trong kho`);
  }

  // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
  const existingItem = mockCart.cartItems.find(
    (item) => item.product.id === productId,
  );

  if (existingItem) {
    // Nếu sản phẩm đã có, cập nhật số lượng
    // Cũng cần kiểm tra số lượng tồn kho
    if (product.quantity < existingItem.quantity + quantity) {
      console.error("[API Utils] Not enough stock for additional items");
      throw new Error(
        `Giỏ hàng đã có ${existingItem.quantity} sản phẩm, chỉ có thể thêm ${product.quantity - existingItem.quantity} sản phẩm nữa`,
      );
    }

    existingItem.quantity += quantity;
    return mockResponse(existingItem);
  } else {
    // Nếu sản phẩm chưa có, thêm mới
    const cartItem = {
      id: `mock-item-${Date.now()}`,
      productPrice: product.price,
      quantity,
      cartId: mockCart.id,
      product,
    };

    // Giả lập cập nhật mockCart (cần được thay thế bằng state management thực tế)
    mockCart.cartItems.push(cartItem);

    return mockResponse(cartItem);
  }
};

export const updateCartItem = async (cartItemId: string, quantity: number) => {
  console.log("[API Utils] Updating cart item", {
    cartItemId,
    quantity,
    useRealApi: config.useRealApi,
  });

  // Xử lý trường hợp số lượng <= 0, chuyển sang xóa khỏi giỏ hàng
  if (quantity <= 0) {
    console.log("[API Utils] Quantity <= 0, removing item from cart");
    return removeFromCart(cartItemId);
  }

  if (config.useRealApi) {
    return api.updateCartItem(cartItemId, quantity);
  }

  // Giả lập cập nhật giỏ hàng
  const cartItem = mockCart.cartItems.find((item) => item.id === cartItemId);
  if (!cartItem) throw new Error(`Cart item with id ${cartItemId} not found`);

  // Kiểm tra số lượng tồn kho
  const product = mockProducts.find((p) => p.id === cartItem.product.id);
  if (product && product.quantity < quantity) {
    console.error("[API Utils] Not enough stock");
    throw new Error(`Chỉ còn ${product.quantity} sản phẩm trong kho`);
  }

  cartItem.quantity = quantity;

  return mockResponse(cartItem);
};

export const removeFromCart = async (cartItemId: string) => {
  console.log("[API Utils] Removing from cart", {
    cartItemId,
    useRealApi: config.useRealApi,
  });

  if (config.useRealApi) {
    return api.removeFromCart(cartItemId);
  }

  // Giả lập xóa khỏi giỏ hàng
  const index = mockCart.cartItems.findIndex((item) => item.id === cartItemId);
  if (index === -1)
    throw new Error(`Cart item with id ${cartItemId} not found`);

  mockCart.cartItems.splice(index, 1);

  return mockResponse(true);
};

// URL Format Utils
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUUID = (str: string): boolean => {
  return UUID_REGEX.test(str);
};

export const getProductByIdOrSlug = async (idOrSlug: string) => {
  console.log("[API Utils] Getting product by id or slug", {
    idOrSlug,
    useRealApi: config.useRealApi,
  });

  if (!idOrSlug) {
    throw new Error("Product ID or slug is required");
  }

  if (config.useRealApi) {
    // If it's a UUID, use direct API call
    if (isUUID(idOrSlug)) {
      return api.getProductById(idOrSlug);
    }

    // For real API with slug, we need to fetch products and find by slug
    const allProducts = await api.getProducts(0, 1000);
    const product = allProducts.content.find(
      (p) => p.slug === idOrSlug || p.id === idOrSlug,
    );
    if (!product)
      throw new Error(`Product with identifier ${idOrSlug} not found`);
    return product;
  }

  // For mock data
  const product = mockProducts.find(
    (p) => p.id === idOrSlug || p.slug === idOrSlug,
  );
  if (!product)
    throw new Error(`Product with identifier ${idOrSlug} not found`);

  return mockResponse(product);
};
