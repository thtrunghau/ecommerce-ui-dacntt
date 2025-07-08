import type { PromotionResDto } from "../../types/api";
import type { CartItemResDto } from "../../types/api";

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
 * @param promotions Danh sách promotion lấy từ API thật
 * @returns Danh sách tất cả khuyến mãi áp dụng
 */
export const getAllApplicablePromotions = (
  productId: string,
  promotions: PromotionResDto[] = [],
): PromotionInfo[] => {
  // Đảm bảo promotions là một mảng
  if (!Array.isArray(promotions)) return [];

  const currentDate = new Date();
  return promotions
    .filter((promo) => {
      // Kiểm tra promo có tồn tại không
      if (!promo) return false;

      const startDate = promo.startDate ? new Date(promo.startDate) : null;
      const endDate = promo.endDate ? new Date(promo.endDate) : null;

      // Chỉ kiểm tra active nếu có đủ ngày
      const isActive =
        startDate && endDate
          ? currentDate >= startDate && currentDate <= endDate
          : false;

      const isApplicable =
        promo.promotionType === "ALL_PRODUCTS" ||
        (promo.promotionType === "SPECIFIC_PRODUCTS" &&
          Array.isArray(promo.productIds) &&
          promo.productIds.includes(productId));

      return isActive && isApplicable;
    })
    .map((promo) => ({
      promotionId: promo.id,
      promotionName: promo.promotionName,
      discountAmount: promo.discountAmount ?? 0,
      isPercentage: promo.proportionType === "PERCENTAGE",
    }));
};

/**
 * Lấy thông tin khuyến mãi đang áp dụng tốt nhất cho sản phẩm
 * @param productId ID của sản phẩm cần kiểm tra
 * @param originalPrice Giá gốc của sản phẩm
 * @param promotions Danh sách promotion lấy từ API thật
 * @returns PromotionInfo hoặc null
 */
export const getProductPromotionInfo = (
  productId: string,
  originalPrice: number | undefined,
  promotions: PromotionResDto[] = [],
): PromotionInfo | null => {
  // Đảm bảo promotions là một mảng
  if (!Array.isArray(promotions)) return null;

  const currentDate = new Date();
  const activePromotions = promotions.filter((promo) => {
    // Kiểm tra promo có tồn tại không
    if (!promo) return false;

    const startDate = promo.startDate ? new Date(promo.startDate) : null;
    const endDate = promo.endDate ? new Date(promo.endDate) : null;

    // Chỉ kiểm tra active nếu có đủ ngày
    const isActive =
      startDate && endDate
        ? currentDate >= startDate && currentDate <= endDate
        : false;

    const isApplicable =
      promo.promotionType === "ALL_PRODUCTS" ||
      (promo.promotionType === "SPECIFIC_PRODUCTS" &&
        Array.isArray(promo.productIds) &&
        promo.productIds.includes(productId));

    return isActive && isApplicable;
  });

  if (activePromotions.length === 0) return null;
  if (activePromotions.length === 1) {
    const promo = activePromotions[0];
    return {
      promotionId: promo.id,
      promotionName: promo.promotionName,
      discountAmount: promo.discountAmount ?? 0,
      isPercentage: promo.proportionType === "PERCENTAGE",
    };
  }

  // Nếu có nhiều promotion, tìm cái tốt nhất theo % giảm giá hoặc giá trị tiền
  // Giả định: % lớn nhất hoặc số tiền lớn nhất là tốt nhất
  const percentagePromotions = activePromotions.filter(
    (promo) => promo.proportionType === "PERCENTAGE",
  );
  const absolutePromotions = activePromotions.filter(
    (promo) => promo.proportionType === "ABSOLUTE",
  );

  // Cố tìm % cao nhất trước
  if (percentagePromotions.length > 0) {
    const bestPercentagePromo = percentagePromotions.reduce((best, current) =>
      (current.discountAmount ?? 0) > (best.discountAmount ?? 0)
        ? current
        : best,
    );
    return {
      promotionId: bestPercentagePromo.id,
      promotionName: bestPercentagePromo.promotionName,
      discountAmount: bestPercentagePromo.discountAmount ?? 0,
      isPercentage: true,
    };
  }

  // Nếu không có % thì tìm số tiền lớn nhất
  if (absolutePromotions.length > 0) {
    const bestAbsolutePromo = absolutePromotions.reduce((best, current) =>
      (current.discountAmount ?? 0) > (best.discountAmount ?? 0)
        ? current
        : best,
    );
    return {
      promotionId: bestAbsolutePromo.id,
      promotionName: bestAbsolutePromo.promotionName,
      discountAmount: bestAbsolutePromo.discountAmount ?? 0,
      isPercentage: false,
    };
  }

  return null;
};

/**
 * Tính giá cuối cùng của sản phẩm sau khi áp dụng khuyến mãi
 * @param productId ID của sản phẩm cần tính giá
 * @param originalPrice Giá gốc của sản phẩm
 * @param promotions Danh sách promotion lấy từ API thật
 * @returns Thông tin về giá và khuyến mãi
 */
export const getProductPriceInfo = (
  productId: string,
  originalPrice: number | undefined = 0,
  promotions: PromotionResDto[] = [],
): ProductPromotionResult => {
  // Đảm bảo originalPrice là số
  const safeOriginalPrice =
    typeof originalPrice === "number" ? originalPrice : 0;

  const promotionInfo = getProductPromotionInfo(
    productId,
    safeOriginalPrice,
    promotions,
  );

  if (!promotionInfo) {
    return {
      hasActivePromotion: false,
      finalPrice: safeOriginalPrice,
      originalPrice: safeOriginalPrice,
    };
  }

  // Tính giá sau khuyến mãi
  const { discountAmount, isPercentage } = promotionInfo;
  let finalPrice = safeOriginalPrice;

  if (isPercentage) {
    // Áp dụng giảm theo % (discountAmount là %)
    finalPrice = safeOriginalPrice * (1 - discountAmount / 100);
  } else {
    // Áp dụng giảm theo số tiền cố định
    finalPrice = Math.max(safeOriginalPrice - discountAmount, 0);
  }

  return {
    hasActivePromotion: true,
    finalPrice,
    originalPrice: safeOriginalPrice,
    promotionInfo,
  };
};

/**
 * Lọc các promotion hợp lệ có thể áp dụng cho đơn hàng dựa trên tổng giá trị
 * @param promotions Danh sách promotion cần lọc
 * @param totalOrderAmount Tổng giá trị đơn hàng
 * @returns Danh sách promotion hợp lệ
 */
export function filterValidPromotionsForOrder(
  promotions: PromotionResDto[],
  totalOrderAmount: number,
): PromotionResDto[] {
  if (!Array.isArray(promotions)) return [];

  const currentDate = new Date();
  return promotions.filter((promo) => {
    // Kiểm tra promo có tồn tại không
    if (!promo) return false;

    const startDate = promo.startDate ? new Date(promo.startDate) : null;
    const endDate = promo.endDate ? new Date(promo.endDate) : null;

    // Kiểm tra thời gian có hiệu lực
    const isActive =
      startDate && endDate
        ? currentDate >= startDate && currentDate <= endDate
        : false;

    // Kiểm tra giá trị tối thiểu của đơn hàng
    const meetsMinOrderValue =
      !promo.minOrderValue || totalOrderAmount >= promo.minOrderValue;

    return isActive && meetsMinOrderValue;
  });
}

/**
 * Tính tổng giá trị đơn hàng sau khi áp dụng khuyến mãi
 * @param cartItems Danh sách sản phẩm trong giỏ hàng
 * @param promotions Danh sách khuyến mãi từ API thật
 * @returns Tổng giá trị sau khi áp dụng khuyến mãi tốt nhất
 */
export function calculateOrderTotalWithPromotion(
  cartItems: CartItemResDto[],
  promotions: PromotionResDto[] = [],
): {
  subtotal: number;
  discount: number;
  total: number;
  appliedPromotion: PromotionResDto | null;
} {
  // Đảm bảo input arrays là hợp lệ
  if (!Array.isArray(cartItems)) {
    return { subtotal: 0, discount: 0, total: 0, appliedPromotion: null };
  }

  if (!Array.isArray(promotions)) {
    promotions = [];
  }

  // Tính subtotal trước
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.productPrice || 0) * (item.quantity || 0);
  }, 0);

  // Lấy danh sách promotion hợp lệ
  const validPromotions = filterValidPromotionsForOrder(promotions, subtotal);

  // Nếu không có promotion nào hợp lệ
  if (validPromotions.length === 0) {
    return { subtotal, discount: 0, total: subtotal, appliedPromotion: null };
  }

  // Tính discount và chọn promotion tốt nhất
  let bestDiscount = 0;
  let bestPromotion = null;

  validPromotions.forEach((promo) => {
    let currentDiscount = 0;

    if (promo.proportionType === "PERCENTAGE" && promo.discountAmount) {
      currentDiscount = subtotal * (promo.discountAmount / 100);
    } else if (
      promo.proportionType === "ABSOLUTE" &&
      promo.discountAmount &&
      promo.discountAmount > 0
    ) {
      currentDiscount = promo.discountAmount;
    }

    if (currentDiscount > bestDiscount) {
      bestDiscount = currentDiscount;
      bestPromotion = promo;
    }
  });

  // Tính total sau khi áp dụng khuyến mãi tốt nhất
  const total = Math.max(subtotal - bestDiscount, 0);

  return {
    subtotal,
    discount: bestDiscount,
    total,
    appliedPromotion: bestPromotion,
  };
}
