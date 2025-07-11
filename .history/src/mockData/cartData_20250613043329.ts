import type { CartResDto } from "../types";

export const mockCartData: CartResDto = {
  id: "mock-cart-1",
  accountId: "mock-account-1",
  cartItems: [
    {
      id: "mock-item-1",
      productPrice: 29990000,
      quantity: 1,
      cartId: "mock-cart-1",
      product: {
        id: "1",
        productName: "Samsung Galaxy S23 Ultra",
        image:
          "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop&crop=center",
        description: "Samsung's latest flagship phone with S Pen",
        quantity: 10,
        price: 29990000,
        categoryId: "smartphones",
        isNew: true,
      },
    },
    {
      id: "mock-item-2",
      productPrice: 22990000,
      quantity: 2,
      cartId: "mock-cart-1",
      product: {
        id: "2",
        productName: "iPhone 14 Pro",
        image:
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop&crop=center",
        description: "Apple's premium smartphone with dynamic island",
        quantity: 8,
        price: 22990000,
        categoryId: "smartphones",
        isNew: true,
      },
    },
    {
      id: "mock-item-3",
      productPrice: 25990000,
      quantity: 1,
      cartId: "mock-cart-1",
      product: {
        id: "3",
        productName: "MacBook Air M2",
        image:
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&crop=center",
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
