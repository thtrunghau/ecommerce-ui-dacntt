// import type { PromotionResDto } from "../types/api";
// import type { CartItemResDto } from "../types/api";
// import { promotionApi } from "../services/apiService";

// export interface Proexport export const getProductPriceInfo = (
//   productId: string,
//   originalPrice: number | undefined = 0,
//   promotions: PromotionResDto[] = [],
// ): ProductPromotionResult => {
//   // Đảm bảo originalPrice là số
//   const safeOriginalPrice = typeof originalPrice === 'number' ? originalPrice : 0;
  
//   const promotionInfo = getProductPromotionInfo(
//     productId,
//     safeOriginalPrice,
//     promotions,
//   );
  
//   if (!promotionInfo) {
//     return {
//       hasActivePromotion: false,
//       finalPrice: safeOriginalPrice,
//       originalPrice: safeOriginalPrice, promotionId: string;
//   promotionName: string;
//   discountAmount: number;
//   isPercentage: boolean;
// }

// export interface ProductPromotionResult {
//   hasActivePromotion: boolean;
//   finalPrice: number;
//   originalPrice: number;
//   promotionInfo?: PromotionInfo;
// }

// /**
//  * Format a number as Vietnamese currency (VND)
//  * @param price - The price to format
//  * @returns Formatted price string
//  */
// export const formattedPrice = (price: number): string => {
//   return new Intl.NumberFormat("vi-VN", {
//     style: "currency",
//     currency: "VND",
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(price);
// };

// /**
//  * Truncate a string to a specific length and add ellipsis
//  * @param text - The text to truncate
//  * @param maxLength - Maximum length before truncation
//  * @returns Truncated text
//  */
// export const truncateText = (text: string, maxLength: number): string => {
//   if (text.length <= maxLength) return text;
//   return text.slice(0, maxLength) + "...";
// };

// /**
//  * Lấy tất cả khuyến mãi đang áp dụng cho sản phẩm (dùng để hiển thị hoặc debug)
//  * @param productId ID của sản phẩm cần kiểm tra
//  * @param promotions Danh sách promotion lấy từ API thật
//  * @returns Danh sách tất cả khuyến mãi áp dụng
//  */
// export const getAllApplicablePromotions = (
//   productId: string,
//   promotions: PromotionResDto[] = [],
// ): PromotionInfo[] => {
//   if (!Array.isArray(promotions)) return [];
//   const currentDate = new Date();
//   return promotions
//     .filter((promo) => {
//       const startDate = new Date(promo.startDate);
//       const endDate = new Date(promo.endDate);
//       const isActive = currentDate >= startDate && currentDate <= endDate;
//       const isApplicable =
//         promo.promotionType === "ALL_PRODUCTS" ||
//         (promo.promotionType === "SPECIFIC_PRODUCTS" &&
//           (promo.productIds || []).includes(productId));
//       return isActive && isApplicable;
//     })
//     .map((promo) => ({
//       promotionId: promo.id,
//       promotionName: promo.promotionName,
//       discountAmount: promo.discountAmount ?? 0,
//       isPercentage: promo.proportionType === "PERCENTAGE",
//     }));
// };

// /**
//  * Lấy thông tin khuyến mãi tốt nhất cho sản phẩm
//  * @param productId ID sản phẩm
//  * @param originalPrice Giá gốc
//  * @param promotions Danh sách promotion lấy từ API thật
//  * @returns PromotionInfo hoặc null
//  */
// export const getProductPromotionInfo = (
//   productId: string,
//   originalPrice: number | undefined,
//   promotions: PromotionResDto[] = [],
// ): PromotionInfo | null => {
//   // Đảm bảo promotions là một mảng
//   if (!Array.isArray(promotions)) return null;
  
//   const currentDate = new Date();
//   const activePromotions = promotions.filter((promo) => {
//     // Kiểm tra promo có tồn tại và có đầy đủ thông tin không
//     if (!promo) return false;
    
//     const startDate = promo.startDate ? new Date(promo.startDate) : null;
//     const endDate = promo.endDate ? new Date(promo.endDate) : null;
    
//     // Chỉ kiểm tra active nếu có đủ ngày bắt đầu và kết thúc
//     const isActive = startDate && endDate ? currentDate >= startDate && currentDate <= endDate : false;
    
//     const isApplicable =
//       promo.promotionType === "ALL_PRODUCTS" ||
//       (promo.promotionType === "SPECIFIC_PRODUCTS" &&
//         Array.isArray(promo.productIds) && promo.productIds.includes(productId));
        
//     return isActive && isApplicable;
//   });
//   if (activePromotions.length === 0) return null;
//   if (activePromotions.length === 1) {
//     const promo = activePromotions[0];
//     return {
//       promotionId: promo.id,
//       promotionName: promo.promotionName,
//       discountAmount: promo.discountAmount ?? 0,
//       isPercentage: promo.proportionType === "PERCENTAGE",
//     };
//   }
//   if (originalPrice) {
//     const specificPromotions = activePromotions.filter(
//       (promo) => promo.promotionType === "SPECIFIC_PRODUCTS",
//     );
//     const allProductPromotions = activePromotions.filter(
//       (promo) => promo.promotionType === "ALL_PRODUCTS",
//     );
//     if (specificPromotions.length > 0) {
//       let bestPromotion = specificPromotions[0];
//       let maxDiscount = 0;
//       for (const promo of specificPromotions) {
//         let discount = 0;
//         if (promo.proportionType === "PERCENTAGE") {
//           discount = originalPrice * ((promo.discountAmount ?? 0) / 100);
//         } else {
//           discount = promo.discountAmount ?? 0;
//         }
//         if (discount > maxDiscount) {
//           maxDiscount = discount;
//           bestPromotion = promo;
//         }
//       }
//       return {
//         promotionId: bestPromotion.id,
//         promotionName: bestPromotion.promotionName,
//         discountAmount: bestPromotion.discountAmount ?? 0,
//         isPercentage: bestPromotion.proportionType === "PERCENTAGE",
//       };
//     }
//     if (allProductPromotions.length > 0) {
//       let bestPromotion = allProductPromotions[0];
//       let maxDiscount = 0;
//       for (const promo of allProductPromotions) {
//         let discount = 0;
//         if (promo.proportionType === "PERCENTAGE") {
//           discount = originalPrice * ((promo.discountAmount ?? 0) / 100);
//         } else {
//           discount = promo.discountAmount ?? 0;
//         }
//         if (discount > maxDiscount) {
//           maxDiscount = discount;
//           bestPromotion = promo;
//         }
//       }
//       return {
//         promotionId: bestPromotion.id,
//         promotionName: bestPromotion.promotionName,
//         discountAmount: bestPromotion.discountAmount ?? 0,
//         isPercentage: bestPromotion.proportionType === "PERCENTAGE",
//       };
//     }
//   }
//   const promo = activePromotions[0];
//   return {
//     promotionId: promo.id,
//     promotionName: promo.promotionName,
//     discountAmount: promo.discountAmount ?? 0,
//     isPercentage: promo.proportionType === "PERCENTAGE",
//   };
// };

// /**
//  * Tính toán giá cuối cùng của sản phẩm sau khi áp dụng khuyến mãi tốt nhất
//  * @param productId ID sản phẩm
//  * @param originalPrice Giá gốc
//  * @param promotions Danh sách promotion lấy từ API thật
//  * @returns ProductPromotionResult
//  */
// export const getProductPriceInfo = (
//   productId: string,
//   originalPrice: number,
//   promotions: PromotionResDto[],
// ): ProductPromotionResult => {
//   const promotionInfo = getProductPromotionInfo(
//     productId,
//     originalPrice,
//     promotions,
//   );
//   if (!promotionInfo) {
//     return {
//       hasActivePromotion: false,
//       finalPrice: originalPrice,
//       originalPrice: originalPrice,
//     };
//   }
//   let finalPrice = originalPrice;
//   if (promotionInfo.isPercentage) {
//     finalPrice = originalPrice * (1 - promotionInfo.discountAmount / 100);
//   } else {
//     finalPrice = originalPrice - promotionInfo.discountAmount;
//   }
//   finalPrice = Math.max(0, finalPrice);
//   return {
//     hasActivePromotion: true,
//     finalPrice: finalPrice,
//     originalPrice: originalPrice,
//     promotionInfo: promotionInfo,
//   };
// };

// /**
//  * Lọc promotionIds hợp lệ cho đơn hàng trước khi gửi backend
//  * @param promotions Danh sách promotion đang chọn (PromotionResDto[])
//  * @param cartItems Danh sách sản phẩm trong cart (CartItemResDto[])
//  * @param orderTotal Tổng tiền đơn hàng (đã áp dụng giảm giá từng sản phẩm)
//  * @returns Mảng promotionId hợp lệ
//  */
// export function filterValidPromotionsForOrder(
//   promotions: PromotionResDto[],
//   cartItems: CartItemResDto[],
//   orderTotal: number,
// ): string[] {
//   if (!promotions || promotions.length === 0) return [];
//   const now = new Date();
//   // Loại bỏ mã hết hạn, chưa tới thời gian, đã dùng (giả định có trường isUsed)
//   let validPromos = promotions.filter((p) => {
//     const start = new Date(p.startDate);
//     const end = new Date(p.endDate);
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     if ((p as any).isUsed) return false;
//     if (now < start || now > end) return false;
//     return true;
//   });
//   // Lấy mã đầu tiên mỗi loại
//   const promoTypeMap: Record<string, PromotionResDto> = {};
//   for (const promo of validPromos) {
//     if (!promoTypeMap[promo.promotionType]) {
//       promoTypeMap[promo.promotionType] = promo;
//     }
//   }
//   validPromos = Object.values(promoTypeMap);
//   // Xử lý SPECIFIC_PRODUCTS: nếu không áp cho sản phẩm nào thì loại, nếu áp cho toàn bộ cart thì loại ALL_PRODUCTS
//   const specificPromo = validPromos.find(
//     (p) => p.promotionType === "SPECIFIC_PRODUCTS",
//   );
//   const allProductsPromo = validPromos.find(
//     (p) => p.promotionType === "ALL_PRODUCTS",
//   );
//   let resultPromos = [...validPromos];
//   if (specificPromo) {
//     const cartProductIds = cartItems.map((i) => i.product.id);
//     const matched = (specificPromo.productIds || []).filter((id) =>
//       cartProductIds.includes(id),
//     );
//     if (matched.length === 0) {
//       // SPECIFIC_PRODUCTS không áp cho sản phẩm nào
//       resultPromos = resultPromos.filter(
//         (p) => p.promotionType !== "SPECIFIC_PRODUCTS",
//       );
//     } else if (matched.length === cartProductIds.length && allProductsPromo) {
//       // SPECIFIC_PRODUCTS áp cho toàn bộ cart, loại ALL_PRODUCTS
//       resultPromos = resultPromos.filter(
//         (p) => p.promotionType !== "ALL_PRODUCTS",
//       );
//     }
//   }
//   // Xử lý ORDER_TOTAL: nếu không đủ minOrderValue thì loại
//   const orderTotalPromo = resultPromos.find(
//     (p) => p.promotionType === "ORDER_TOTAL",
//   );
//   if (orderTotalPromo && orderTotal < (orderTotalPromo.minOrderValue || 0)) {
//     resultPromos = resultPromos.filter(
//       (p) => p.promotionType !== "ORDER_TOTAL",
//     );
//   }
//   return resultPromos.map((p) => p.id);
// }

// // Hàm lấy promotion từ API thật
// export const fetchAllPromotions = async (): Promise<PromotionResDto[]> => {
//   const res = await promotionApi.getList();
//   return res.data || [];
// };

// // Hàm kiểm tra trạng thái promotion (dùng cho UI)
// export const getPromotionStatus = (
//   promo: PromotionResDto,
// ): "upcoming" | "active" | "expired" => {
//   const now = new Date();
//   const start = new Date(promo.startDate);
//   const end = new Date(promo.endDate);
//   if (now < start) return "upcoming";
//   if (now > end) return "expired";
//   return "active";
// };
