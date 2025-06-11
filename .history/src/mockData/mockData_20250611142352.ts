import { v4 as uuidv4 } from "uuid";
import type {
  CategoryResDto,
  ProductResDto,
  PromotionResDto,
} from "../types/index";

// Mock Categories based on Header navigation
export const mockCategories: CategoryResDto[] = [
  {
    id: uuidv4(),
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
export const mockProducts: ProductResDto[] = [
  // Di động
  {
    id: uuidv4(),
    productName: "Samsung Galaxy S24 Ultra",
    image: "/images/products/placeholder.png",
    description: "Flagship smartphone với Galaxy AI, camera 200MP, S Pen",
    quantity: 50,
    price: 31990000,
    categoryId: mockCategories[0].id,
    isNew: true,
    path: "/products/galaxy-s24-ultra",
  },
  {
    id: uuidv4(),
    productName: "Samsung Galaxy Z Fold5",
    image: "/images/products/placeholder.png",
    description: "Smartphone màn hình gập với Snapdragon 8 Gen 2",
    quantity: 30,
    price: 40990000,
    categoryId: mockCategories[0].id,
    path: "/products/galaxy-z-fold5",
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
    path: "/products/neo-qled-8k",
  },
  {
    id: uuidv4(),
    productName: "Samsung Sound Tower",
    image: "/images/products/placeholder.png",
    description: "Loa tháp công suất lớn với hiệu ứng DJ",
    quantity: 40,
    price: 8990000,
    categoryId: mockCategories[1].id,
  },
  // Gia Dụng
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
