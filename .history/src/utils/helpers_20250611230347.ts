import { mockPromotions } from "../mockData/mockData";

export interface PromotionInfo {
  promotionId: string;
  promotionName: string;
  discountAmount: number;
  isPercentage: boolean;
}

export interface ProductPromotionResult {
  hasActivePromotion: boolean;
  finalPrice: number;
  originalPrice: number;
  promotionInfo?: PromotionInfo;
}

/**
 * Format a number as Vietnamese currency (VND)
 * @param price - The price to format
 * @returns Formatted price string
 */
export const formattedPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Truncate a string to a specific length and add ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

/**
 * Kiểm tra xem sản phẩm có đang được khuyến mãi không và trả về thông tin khuyến mãi
 * @param productId ID của sản phẩm cần kiểm tra
 * @returns Thông tin khuyến mãi hoặc null nếu không có
 */
export const getProductPromotionInfo = (
  productId: string,
): PromotionInfo | null => {
  const currentDate = new Date();
  // Tìm khuyến mãi đang áp dụng cho sản phẩm này
  const activePromotion = mockPromotions.find((promo) => {
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);
    const isActive = currentDate >= startDate && currentDate <= endDate;
    const isApplicable =
      promo.promotionType === "ALL_PRODUCTS" ||
      (promo.promotionType === "SPECIFIC_PRODUCTS" &&
        promo.productIds.includes(productId));
    return isActive && isApplicable;
  });
  if (!activePromotion) return null;  return {
    promotionId: activePromotion.id,
    promotionName: activePromotion.promotionName,
    discountAmount: activePromotion.discountAmount,
    isPercentage: activePromotion.proportionType === "PERCENTAGE",
  };
};

/**
 * Tính toán giá cuối cùng của sản phẩm sau khi áp dụng khuyến mãi
 * @param productId ID của sản phẩm
 * @param originalPrice Giá gốc của sản phẩm
 * @returns Thông tin chi tiết về giá và khuyến mãi
 */
export const getProductPriceInfo = (
  productId: string,
  originalPrice: number,
): ProductPromotionResult => {
  const promotionInfo = getProductPromotionInfo(productId);
  
  if (!promotionInfo) {
    return {
      hasActivePromotion: false,
      finalPrice: originalPrice,
      originalPrice: originalPrice,
    };
  }

  let finalPrice = originalPrice;
  if (promotionInfo.isPercentage) {
    finalPrice = originalPrice * (1 - promotionInfo.discountAmount / 100);
  } else {
    finalPrice = originalPrice - promotionInfo.discountAmount;
  }

  // Đảm bảo giá không âm
  finalPrice = Math.max(0, finalPrice);

  return {
    hasActivePromotion: true,
    finalPrice: finalPrice,
    originalPrice: originalPrice,
    promotionInfo: promotionInfo,
  };
};
