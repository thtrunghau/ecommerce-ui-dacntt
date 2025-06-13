import { v4 as uuidv4 } from "uuid";
import type {
  CategoryResDto,
  ProductResDto,
  PromotionResDto,
  HeroSlideDto,
  PaginatedResponse,
  CartResDto,
  CartItemResDto,
} from "../types/index";

// Mock Categories based on Header navigation
export const mockCategories: CategoryResDto[] = [
  {
    id: "di-dong-1",
    categoryName: "Di động",
    key: "di-dong",
    products: [],
  },
  {
    id: uuidv4(),
    categoryName: "TV & AV",
    key: "tv-av",
    products: [],
  },
  {
    id: uuidv4(),
    categoryName: "Gia Dụng",
    key: "gia-dung",
    products: [],
  },
  {
    id: uuidv4(),
    categoryName: "IT",
    key: "it",
    products: [],
  },
  {
    id: uuidv4(),
    categoryName: "Phụ kiện",
    key: "phu-kien",
    products: [],
  },
  {
    id: uuidv4(),
    categoryName: "SmartThings",
    key: "smartthings",
    products: [],
  },
  {
    id: uuidv4(),
    categoryName: "AI",
    key: "ai",
    products: [],
  },
];

// Mock Products with UUID format
export const mockProducts: ProductResDto[] = [
  // Di động
  {
    id: uuidv4(),
    productName: "Samsung Galaxy S24 Ultra",
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop&crop=center",
    description: "Flagship smartphone với Galaxy AI, camera 200MP, S Pen",
    quantity: 50,
    price: 31990000,
    categoryId: "di-dong-1",
    isNew: true,
    slug: "samsung-galaxy-s24-ultra",
  },
  {
    id: uuidv4(),
    productName: "Samsung Galaxy Z Fold5",
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop&crop=center",
    description: "Smartphone màn hình gập với Snapdragon 8 Gen 2",
    quantity: 30,
    price: 40990000,
    categoryId: "di-dong-1",
    slug: "samsung-galaxy-z-fold5",
  },
  // TV & AV
  {
    id: uuidv4(),
    productName: "Samsung Neo QLED 8K",
    image:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop&crop=center",
    description: "Smart TV 85 inch với AI upscaling, Quantum Matrix Technology",
    quantity: 20,
    price: 199990000,
    categoryId: mockCategories[1].id,
    isNew: true,
  },
  {
    id: uuidv4(),
    productName: "Samsung Sound Tower",
    image:
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=400&fit=crop&crop=center",
    description: "Loa tháp công suất lớn với hiệu ứng DJ",
    quantity: 40,
    price: 8990000,
    categoryId: mockCategories[1].id,
  }, // Gia Dụng
  {
    id: uuidv4(),
    productName: "Tủ lạnh Samsung Bespoke",
    image:
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop&crop=center",
    description: "Tủ lạnh thông minh với thiết kế tùy chỉnh",
    quantity: 25,
    price: 49990000,
    categoryId: mockCategories[2].id,
  },
  {
    id: uuidv4(),
    productName: "Máy giặt AI EcoBubble",
    image:
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=400&fit=crop&crop=center",
    description: "Máy giặt thông minh với công nghệ AI",
    quantity: 35,
    price: 18990000,
    categoryId: mockCategories[2].id,
  },
  // IT
  {
    id: uuidv4(),
    productName: "Samsung Galaxy Book4 Pro",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&crop=center",
    description: "Laptop cao cấp với Intel Core Ultra",
    quantity: 30,
    price: 45990000,
    categoryId: mockCategories[3].id,
  },
  {
    id: uuidv4(),
    productName: "Samsung Odyssey OLED G9",
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop&crop=center",
    description: "Màn hình gaming cong 49 inch OLED",
    quantity: 15,
    price: 49990000,
    categoryId: mockCategories[3].id,
  },
  // Phụ kiện
  {
    id: uuidv4(),
    productName: "Galaxy Buds3 Pro",
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop&crop=center",
    description: "Tai nghe không dây với ANC thế hệ mới",
    quantity: 100,
    price: 4990000,
    categoryId: mockCategories[4].id,
  },
  {
    id: uuidv4(),
    productName: "Galaxy Watch6 Pro",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center",
    description: "Đồng hồ thông minh với tính năng theo dõi sức khỏe",
    quantity: 80,
    price: 9990000,
    categoryId: mockCategories[4].id,
  }, // SmartThings
  {
    id: uuidv4(),
    productName: "SmartThings Hub",
    image:
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop&crop=center",
    description: "Trung tâm điều khiển nhà thông minh",
    quantity: 45,
    price: 2990000,
    categoryId: mockCategories[5].id,
  },
  {
    id: uuidv4(),
    productName: "SmartThings Camera",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop&crop=center",
    description: "Camera an ninh thông minh với AI",
    quantity: 60,
    price: 3990000,
    categoryId: mockCategories[5].id,
  },
  // AI
  {
    id: uuidv4(),
    productName: "Samsung AI Home Assistant",
    image:
      "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=400&h=400&fit=crop&crop=center",
    description: "Trợ lý ảo thông minh cho ngôi nhà",
    quantity: 40,
    price: 5990000,
    categoryId: mockCategories[6].id,
  },
  {
    id: uuidv4(),
    productName: "AI Developer Kit",
    image:
      "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=400&fit=crop&crop=center",
    description: "Bộ phát triển ứng dụng AI Samsung",
    quantity: 25,
    price: 9990000,
    categoryId: mockCategories[6].id,
  },
];

// Update categories with their products
mockCategories.forEach((category) => {
  category.products = mockProducts.filter(
    (product) => product.categoryId === category.id,
  );
});

// Mock Promotions (Ưu đãi)
export const mockPromotions: PromotionResDto[] = [
  {
    id: uuidv4(),
    promotionName: "Samsung Summer Festival",
    promotionCode: "SUMMER2025",
    description: "Giảm đến 20% cho tất cả sản phẩm Samsung",
    startDate: "2025-06-01T00:00:00Z",
    endDate: "2025-08-31T23:59:59Z",
    discountAmount: 20,
    promotionType: "ALL_PRODUCTS",
    proportionType: "PERCENTAGE",
    minOrderValue: 5000000,
    productIds: [],
  },
  {
    id: uuidv4(),
    promotionName: "Galaxy AI Launch",
    promotionCode: "GALAXYAI",
    description: "Giảm 5 triệu cho Samsung Galaxy S24 Series",
    startDate: "2025-06-01T00:00:00Z",
    endDate: "2025-07-15T23:59:59Z",
    discountAmount: 5000000,
    promotionType: "SPECIFIC_PRODUCTS",
    proportionType: "ABSOLUTE",
    minOrderValue: 20000000,
    productIds: [mockProducts[0].id],
  },
  {
    id: uuidv4(),
    promotionName: "TV & AV Super Sale",
    promotionCode: "TVSALE25",
    description: "Giảm 15% cho tất cả TV và thiết bị âm thanh",
    startDate: "2025-06-15T00:00:00Z",
    endDate: "2025-07-15T23:59:59Z",
    discountAmount: 15,
    promotionType: "SPECIFIC_PRODUCTS",
    proportionType: "PERCENTAGE",
    minOrderValue: 10000000,
    productIds: mockProducts
      .filter((p) => p.categoryId === mockCategories[1].id)
      .map((p) => p.id),
  },
  {
    id: uuidv4(),
    promotionName: "SmartHome Package",
    promotionCode: "SMART2025",
    description: "Giảm 30% khi mua combo SmartThings",
    startDate: "2025-06-01T00:00:00Z",
    endDate: "2025-07-31T23:59:59Z",
    discountAmount: 30,
    promotionType: "SPECIFIC_PRODUCTS",
    proportionType: "PERCENTAGE",
    minOrderValue: 5000000,
    productIds: mockProducts
      .filter((p) => p.categoryId === mockCategories[5].id)
      .map((p) => p.id),
  },
];

// Mock Hero Slides
export const heroSlides: HeroSlideDto[] = [
  {
    id: uuidv4(),
    productName: "Galaxy Ring",
    description: "Ưu đãi 1 triệu khi mua cùng Galaxy S25 Edge",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=400&fit=crop&crop=center",
    price: 1000000,
    quantity: 100,
    categoryId: mockCategories[0].id, // Di động category
    isNew: true,
  },
  {
    id: uuidv4(),
    productName: "Galaxy Watch",
    description: "Đồng hồ thông minh với nhiều tính năng vượt trội",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=400&fit=crop&crop=center",
    price: 5000000,
    quantity: 50,
    categoryId: mockCategories[0].id,
    isNew: true,
  },
  {
    id: uuidv4(),
    productName: "Samsung Neo QLED 8K",
    description: "Trải nghiệm hình ảnh đỉnh cao với công nghệ mới nhất",
    image:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=400&fit=crop&crop=center",
    price: 50000000,
    quantity: 20,
    categoryId: mockCategories[1].id, // TV & AV category
    isNew: true,
  },
];

// Mock Cart and Cart Items
const mockCartId = "mock-cart-id";
const mockAccountId = "mock-account-id";

export const mockCartItems: CartItemResDto[] = [
  {
    id: uuidv4(),
    productPrice: mockProducts[0].price, // Lưu giá khi thêm vào giỏ
    quantity: 1,
    cartId: mockCartId,
    product: mockProducts[0],
  },
  {
    id: uuidv4(),
    productPrice: mockProducts[2].price,
    quantity: 2,
    cartId: mockCartId,
    product: mockProducts[2],
  },
];

export const mockCart: CartResDto = {
  id: mockCartId,
  accountId: mockAccountId,
  cartItems: mockCartItems,
};

// Helper functions để tạo API responses với pagination
export function createPaginatedResponse<T>(
  data: T[],
  page: number = 0,
  size: number = 10,
): PaginatedResponse<T> {
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    currentPage: page + 1, // API thực tế trả về page bắt đầu từ 1
    pageSize: size,
    totalPages: Math.ceil(data.length / size),
    totalElements: data.length,
    data: paginatedData,
    first: page === 0,
    last: endIndex >= data.length,
  };
}

// Tạo paginated responses cho API mocks
export const mockCategoriesResponse = createPaginatedResponse(mockCategories);
export const mockProductsResponse = createPaginatedResponse(mockProducts);
export const mockPromotionsResponse = createPaginatedResponse(mockPromotions);

// Cập nhật sản phẩm cho từng category
mockCategories.forEach((category) => {
  category.products = mockProducts.filter(
    (product) => product.categoryId === category.id,
  );
});
