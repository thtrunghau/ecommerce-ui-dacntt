// import type { OrderDto } from "../types/order";
// import { mockCartData } from "./cartData";

// export const mockOrderData: OrderDto = {
//   id: "mock-order-1",
//   totalPrice: mockCartData.cartItems.reduce(
//     (sum, item) => sum + item.productPrice * item.quantity,
//     0,
//   ),
//   paymentStatus: "PENDING",
//   deliveryStatus: "PENDING",
//   orderDate: new Date().toISOString(),
//   accountId: mockCartData.accountId,
//   address: {
//     id: "mock-address-1",
//     street: "221B Baker Street",
//     buildingName: "Sherlock Holmes Museum",
//     city: "London",
//     country: "United Kingdom",
//     state: "England",
//     pincode: "NW1 6XE",
//     accountId: mockCartData.accountId,
//   },
//   usedPromotions: [
//     {
//       id: "promo-1",
//       promotionName: "20% Off Specific Products",
//       promotionCode: "SPECIFIC20",
//       description: "Get 20% off on selected products.",
//       startDate: "2025-06-08T16:05:43.697+07:00",
//       endDate: "2025-07-08T16:05:43.697+07:00",
//       discountAmount: 20,
//       promotionType: "SPECIFIC_PRODUCTS",
//       proportionType: "PERCENTAGE",
//       minOrderValue: 0,
//       productIds: ["1", "2"],
//     },
//     {
//       id: "promo-2",
//       promotionName: "10% Off All Products",
//       promotionCode: "ALL10",
//       description: "Get 10% off on all products.",
//       startDate: "2025-06-08T16:05:43.679+07:00",
//       endDate: "2025-07-08T16:05:43.679+07:00",
//       discountAmount: 10,
//       promotionType: "ALL_PRODUCTS",
//       proportionType: "PERCENTAGE",
//       minOrderValue: 0,
//       productIds: [],
//     },
//   ],
//   orderItems: mockCartData.cartItems.map((item) => ({
//     id: `order-item-${item.id}`,
//     totalPriceProduct: item.productPrice * item.quantity,
//     updatePriceProduct: item.productPrice * item.quantity * 0.8, // Apply 20% discount
//     quantity: item.quantity,
//     product: item.product,
//   })),
//   shipCOD: false,
// };
