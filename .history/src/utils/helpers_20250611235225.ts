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
 * Lấy tất cả khuyến mãi đang áp dụng cho sản phẩm (dùng để hiển thị hoặc debug)
 * @param productId ID của sản phẩm cần kiểm tra
 * @returns Danh sách tất cả khuyến mãi áp dụng
 */
export const getAllApplicablePromotions = (
  productId: string,
): PromotionInfo[] => {
  const currentDate = new Date();

  return mockPromotions
    .filter((promo) => {
      const startDate = new Date(promo.startDate);
      const endDate = new Date(promo.endDate);
      const isActive = currentDate >= startDate && currentDate <= endDate;
      const isApplicable =
        promo.promotionType === "ALL_PRODUCTS" ||
        (promo.promotionType === "SPECIFIC_PRODUCTS" &&
          promo.productIds.includes(productId));
      return isActive && isApplicable;
    })
    .map((promo) => ({
      promotionId: promo.id,
      promotionName: promo.promotionName,
      discountAmount: promo.discountAmount,
      isPercentage: promo.proportionType === "PERCENTAGE",
    }));
};

/**
 * Kiểm tra xem sản phẩm có đang được khuyến mãi không và trả về thông tin khuyến mãi tốt nhất
 * @param productId ID của sản phẩm cần kiểm tra
 * @param originalPrice Giá gốc của sản phẩm để tính toán khuyến mãi tốt nhất
 * @returns Thông tin khuyến mãi tốt nhất hoặc null nếu không có
 */
export const getProductPromotionInfo = (
  productId: string,
  originalPrice?: number,
): PromotionInfo | null => {
  const currentDate = new Date();

  // Tìm tất cả khuyến mãi đang áp dụng cho sản phẩm này
  const activePromotions = mockPromotions.filter((promo) => {
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);
    const isActive = currentDate >= startDate && currentDate <= endDate;
    const isApplicable =
      promo.promotionType === "ALL_PRODUCTS" ||
      (promo.promotionType === "SPECIFIC_PRODUCTS" &&
        promo.productIds.includes(productId));
    return isActive && isApplicable;
  });

  if (activePromotions.length === 0) return null;

  // Nếu chỉ có 1 khuyến mãi, trả về ngay
  if (activePromotions.length === 1) {
    const promo = activePromotions[0];
    return {
      promotionId: promo.id,
      promotionName: promo.promotionName,
      discountAmount: promo.discountAmount,
      isPercentage: promo.proportionType === "PERCENTAGE",
    };
  }

  // Nếu có nhiều khuyến mãi, tìm khuyến mãi tốt nhất
  if (originalPrice) {
    let bestPromotion = activePromotions[0];
    let maxDiscount = 0;

    for (const promo of activePromotions) {
      let discount = 0;
      if (promo.proportionType === "PERCENTAGE") {
        discount = originalPrice * (promo.discountAmount / 100);
      } else {
        discount = promo.discountAmount;
      }

      if (discount > maxDiscount) {
        maxDiscount = discount;
        bestPromotion = promo;
      }
    }

    return {
      promotionId: bestPromotion.id,
      promotionName: bestPromotion.promotionName,
      discountAmount: bestPromotion.discountAmount,
      isPercentage: bestPromotion.proportionType === "PERCENTAGE",
    };
  }

  // Nếu không có originalPrice, trả về khuyến mãi đầu tiên
  const promo = activePromotions[0];
  return {
    promotionId: promo.id,
    promotionName: promo.promotionName,
    discountAmount: promo.discountAmount,
    isPercentage: promo.proportionType === "PERCENTAGE",
  };
};

/**
 * Tính toán giá cuối cùng của sản phẩm sau khi áp dụng khuyến mãi tốt nhất
 * @param productId ID của sản phẩm
 * @param originalPrice Giá gốc của sản phẩm
 * @returns Thông tin chi tiết về giá và khuyến mãi tốt nhất
 */
export const getProductPriceInfo = (
  productId: string,
  originalPrice: number,
): ProductPromotionResult => {
  const promotionInfo = getProductPromotionInfo(productId, originalPrice);

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
