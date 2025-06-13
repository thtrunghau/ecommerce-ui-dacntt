import { v4 as uuidv4 } from "uuid";
import type { CartResDto } from "../types";
import { mockProducts } from "./mockData";

// Generate consistent UUIDs for cart mock data
const MOCK_CART_ID = "550e8400-e29b-41d4-a716-446655440001";
const MOCK_ACCOUNT_ID = "550e8400-e29b-41d4-a716-446655440002";

export const mockCartData: CartResDto = {
  id: MOCK_CART_ID,
  accountId: MOCK_ACCOUNT_ID,
  cartItems: [
    {
      id: uuidv4(),
      productPrice: mockProducts[0].price, // Samsung Galaxy S24 Ultra
      quantity: 1,
      cartId: MOCK_CART_ID,
      product: mockProducts[0],
    },
    {
      id: uuidv4(),
      productPrice: mockProducts[1].price, // Samsung Galaxy Z Fold5
      quantity: 2,
      cartId: MOCK_CART_ID,
      product: mockProducts[1],
    },
    {
      id: uuidv4(),
      productPrice: mockProducts[2].price, // Samsung Neo QLED 8K
      quantity: 1,
      cartId: MOCK_CART_ID,
      product: mockProducts[2],
    },
    {
      id: uuidv4(),
      productPrice: mockProducts[6].price, // Galaxy Buds3 Pro
      quantity: 1,
      cartId: MOCK_CART_ID,
      product: mockProducts[6],
    },
    {
      id: uuidv4(),
      productPrice: mockProducts[7].price, // Galaxy Watch6 Pro
      quantity: 1,
      cartId: MOCK_CART_ID,
      product: mockProducts[7],
    },
        description: "Powerful and portable laptop with M2 chip",
        quantity: 5,
        price: 25990000,
        categoryId: "laptops",
        isNew: true,
      },
    },
    {
      id: "mock-item-4",
      productPrice: 4990000,
      quantity: 1,
      cartId: "mock-cart-1",
      product: {
        id: "4",
        productName: "Galaxy Buds3 Pro",
        image:
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop&crop=center",
        description: "Tai nghe không dây với ANC thế hệ mới",
        quantity: 100,
        price: 4990000,
        categoryId: "accessories",
        isNew: false,
      },
    },
    {
      id: "mock-item-5",
      productPrice: 8990000,
      quantity: 1,
      cartId: "mock-cart-1",
      product: {
        id: "5",
        productName: "Samsung Watch6 Pro",
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center",
        description: "Đồng hồ thông minh với tính năng theo dõi sức khỏe",
        quantity: 50,
        price: 8990000,
        categoryId: "accessories",
        isNew: true,
      },
    },
  ],
};
