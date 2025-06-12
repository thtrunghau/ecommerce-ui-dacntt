import type { CartResDto } from '../types';

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
        image: "/images/products/placeholder.png",
        description: "Samsung's latest flagship phone with S Pen",
        quantity: 10,
        price: 29990000,
        categoryId: "smartphones",
        isNew: true,
      }
    },
    {
      id: "mock-item-2",
      productPrice: 22990000,
      quantity: 2,
      cartId: "mock-cart-1",
      product: {
        id: "2",
        productName: "iPhone 14 Pro",
        image: "/images/products/placeholder.png",
        description: "Apple's premium smartphone with dynamic island",
        quantity: 8,
        price: 22990000,
        categoryId: "smartphones",
        isNew: true,
      }
    },
    {
      id: "mock-item-3",
      productPrice: 25990000,
      quantity: 1,
      cartId: "mock-cart-1",
      product: {
        id: "3",
        productName: "MacBook Air M2",
        image: "/images/products/placeholder.png",
        description: "Powerful and portable laptop with M2 chip",
        quantity: 5,
        price: 25990000,
        categoryId: "laptops",
        isNew: true,
      }
    }
  ]
};
