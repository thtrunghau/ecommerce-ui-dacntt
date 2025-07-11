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

// Mock Products
export const mockProducts: ProductResDto[] = [  // Di động  {
    id: "s24-ultra-1",
    productName: "Samsung Galaxy S24 Ultra",
    image: "/images/products/placeholder.png",
    description: "Flagship smartphone với Galaxy AI, camera 200MP, S Pen",
    quantity: 50,
    price: 31990000,
    categoryId: "di-dong-1",
    isNew: true,
  },
  {
    id: "zfold5-1",
    productName: "Samsung Galaxy Z Fold5",
    image: "/images/products/placeholder.png",
    description: "Smartphone màn hình gập với Snapdragon 8 Gen 2",    quantity: 30,
    price: 40990000,
    categoryId: "di-dong-1",
  },
  // TV & AV
  {
    id: uuidv4(),
    productName: "Samsung Neo QLED 8K",
    image: "/images/products/placeholder.png",
    description: "Smart TV 85 inch với AI upscaling, Quantum Matrix Technology",
    quantity: 20,
    price: 199990000,
    categoryId: mockCategories[1].id,
    isNew: true,
  },
  {
    id: uuidv4(),
    productName: "Samsung Sound Tower",
    image: "/images/products/placeholder.png",
    description: "Loa tháp công suất lớn với hiệu ứng DJ",
    quantity: 40,
    price: 8990000,
    categoryId: mockCategories[1].id,
  }, // Gia Dụng
  {
    id: uuidv4(),
    productName: "Tủ lạnh Samsung Bespoke",
    image: "/images/products/placeholder.png",
    description: "Tủ lạnh thông minh với thiết kế tùy chỉnh",
    quantity: 25,
    price: 49990000,
    categoryId: mockCategories[2].id,
  },
  {
    id: uuidv4(),
    productName: "Máy giặt AI EcoBubble",
    image: "/images/products/placeholder.png",
    description: "Máy giặt thông minh với công nghệ AI",
    quantity: 35,
    price: 18990000,
    categoryId: mockCategories[2].id,
  },
  // IT
  {
    id: uuidv4(),
    productName: "Samsung Galaxy Book4 Pro",
    image: "/images/products/placeholder.png",
    description: "Laptop cao cấp với Intel Core Ultra",
    quantity: 30,
    price: 45990000,
    categoryId: mockCategories[3].id,
  },
  {
    id: uuidv4(),
    productName: "Samsung Odyssey OLED G9",
    image: "/images/products/placeholder.png",
    description: "Màn hình gaming cong 49 inch OLED",
    quantity: 15,
    price: 49990000,
    categoryId: mockCategories[3].id,
  },
  // Phụ kiện
  {
    id: uuidv4(),
    productName: "Galaxy Buds3 Pro",
    image: "/images/products/placeholder.png",
    description: "Tai nghe không dây với ANC thế hệ mới",
    quantity: 100,
    price: 4990000,
    categoryId: mockCategories[4].id,
  },
  {
    id: uuidv4(),
    productName: "Galaxy Watch6 Pro",
    image: "/images/products/placeholder.png",
    description: "Đồng hồ thông minh với tính năng theo dõi sức khỏe",
    quantity: 80,
    price: 9990000,
    categoryId: mockCategories[4].id,
  },
  // SmartThings
  {
    id: uuidv4(),
    productName: "SmartThings Hub",
    image: "/images/products/placeholder.png",
    description: "Trung tâm điều khiển nhà thông minh",
    quantity: 45,
    price: 2990000,
    categoryId: mockCategories[5].id,
  },
  {
    id: uuidv4(),
    productName: "SmartThings Camera",
    image: "/images/products/placeholder.png",
    description: "Camera an ninh thông minh với AI",
    quantity: 60,
    price: 3990000,
    categoryId: mockCategories[5].id,
  },
  // AI
  {
    id: uuidv4(),
    productName: "Samsung AI Home Assistant",
    image: "/images/products/placeholder.png",
    description: "Trợ lý ảo thông minh cho ngôi nhà",
    quantity: 40,
    price: 5990000,
    categoryId: mockCategories[6].id,
  },
  {
    id: uuidv4(),
    productName: "AI Developer Kit",
    image: "/images/products/placeholder.png",
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
    image: "/images/products/placeholder.png",
    price: 1000000,
    quantity: 100,
    categoryId: mockCategories[0].id, // Di động category
    isNew: true,
  },
  {
    id: uuidv4(),
    productName: "Galaxy Watch",
    description: "Đồng hồ thông minh với nhiều tính năng vượt trội",
    image: "/images/products/placeholder.png",
    price: 5000000,
    quantity: 50,
    categoryId: mockCategories[0].id,
    isNew: true,
  },
  {
    id: uuidv4(),
    productName: "Samsung Neo QLED 8K",
    description: "Trải nghiệm hình ảnh đỉnh cao với công nghệ mới nhất",
    image: "/images/products/placeholder.png",
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
mockCategories.forEach(category => {
  category.products = mockProducts.filter(product => product.categoryId === category.id);
});
