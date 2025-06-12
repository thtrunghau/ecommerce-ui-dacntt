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
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop&crop=center",
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
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop&crop=center",
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
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&crop=center",
        description: "Powerful and portable laptop with M2 chip",
        quantity: 5,
        price: 25990000,
        categoryId: "laptops",
        isNew: true,
      },
    },
  ],
};
