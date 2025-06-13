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
  ],
};
