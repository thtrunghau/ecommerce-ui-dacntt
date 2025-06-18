import { mockPromotions } from "../mockData/mockData";
import type { PromotionResDto } from "../types/api";
import type { CartItemResDto } from "../types/api";

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
          (promo.productIds || []).includes(productId));
      return isActive && isApplicable;
    })
    .map((promo) => ({
      promotionId: promo.id,
      promotionName: promo.promotionName,
      discountAmount: promo.discountAmount ?? 0,
      isPercentage: promo.proportionType === "PERCENTAGE",
    }));
};

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
        (promo.productIds || []).includes(productId));
    return isActive && isApplicable;
  });

  if (activePromotions.length === 0) return null;

  // Nếu chỉ có 1 khuyến mãi, trả về ngay
  if (activePromotions.length === 1) {
    const promo = activePromotions[0];
    return {
      promotionId: promo.id,
      promotionName: promo.promotionName,
      discountAmount: promo.discountAmount ?? 0,
      isPercentage: promo.proportionType === "PERCENTAGE",
    };
  }
  // Nếu có nhiều khuyến mãi, ưu tiên SPECIFIC_PRODUCTS trước
  if (originalPrice) {
    // Tách ra 2 nhóm: SPECIFIC_PRODUCTS và ALL_PRODUCTS
    const specificPromotions = activePromotions.filter(
      (promo) => promo.promotionType === "SPECIFIC_PRODUCTS",
    );
    const allProductPromotions = activePromotions.filter(
      (promo) => promo.promotionType === "ALL_PRODUCTS",
    );

    // Nếu có SPECIFIC_PRODUCTS, tìm promotion tốt nhất trong nhóm này
    if (specificPromotions.length > 0) {
      let bestPromotion = specificPromotions[0];
      let maxDiscount = 0;

      for (const promo of specificPromotions) {
        let discount = 0;
        if (promo.proportionType === "PERCENTAGE") {
          discount = originalPrice * ((promo.discountAmount ?? 0) / 100);
        } else {
          discount = promo.discountAmount ?? 0;
        }

        if (discount > maxDiscount) {
          maxDiscount = discount;
          bestPromotion = promo;
        }
      }

      return {
        promotionId: bestPromotion.id,
        promotionName: bestPromotion.promotionName,
        discountAmount: bestPromotion.discountAmount ?? 0,
        isPercentage: bestPromotion.proportionType === "PERCENTAGE",
      };
    }

    // Nếu không có SPECIFIC_PRODUCTS, mới tìm trong ALL_PRODUCTS
    if (allProductPromotions.length > 0) {
      let bestPromotion = allProductPromotions[0];
      let maxDiscount = 0;

      for (const promo of allProductPromotions) {
        let discount = 0;
        if (promo.proportionType === "PERCENTAGE") {
          discount = originalPrice * ((promo.discountAmount ?? 0) / 100);
        } else {
          discount = promo.discountAmount ?? 0;
        }

        if (discount > maxDiscount) {
          maxDiscount = discount;
          bestPromotion = promo;
        }
      }

      return {
        promotionId: bestPromotion.id,
        promotionName: bestPromotion.promotionName,
        discountAmount: bestPromotion.discountAmount ?? 0,
        isPercentage: bestPromotion.proportionType === "PERCENTAGE",
      };
    }
  }

  // Nếu không có originalPrice, trả về khuyến mãi đầu tiên
  const promo = activePromotions[0];
  return {
    promotionId: promo.id,
    promotionName: promo.promotionName,
    discountAmount: promo.discountAmount ?? 0,
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

/**
 * Lọc promotionIds hợp lệ cho đơn hàng trước khi gửi backend
 * @param promotions Danh sách promotion đang chọn (PromotionResDto[])
 * @param cartItems Danh sách sản phẩm trong cart (CartItemResDto[])
 * @param orderTotal Tổng tiền đơn hàng (đã áp dụng giảm giá từng sản phẩm)
 * @returns Mảng promotionId hợp lệ
 */
export function filterValidPromotionsForOrder(
  promotions: PromotionResDto[],
  cartItems: CartItemResDto[],
  orderTotal: number,
): string[] {
  if (!promotions || promotions.length === 0) return [];
  const now = new Date();
  // Loại bỏ mã hết hạn, chưa tới thời gian, đã dùng (giả định có trường isUsed)
  let validPromos = promotions.filter((p) => {
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((p as any).isUsed) return false;
    if (now < start || now > end) return false;
    return true;
  });
  // Lấy mã đầu tiên mỗi loại
  const promoTypeMap: Record<string, PromotionResDto> = {};
  for (const promo of validPromos) {
    if (!promoTypeMap[promo.promotionType]) {
      promoTypeMap[promo.promotionType] = promo;
    }
  }
  validPromos = Object.values(promoTypeMap);
  // Xử lý SPECIFIC_PRODUCTS: nếu không áp cho sản phẩm nào thì loại, nếu áp cho toàn bộ cart thì loại ALL_PRODUCTS
  const specificPromo = validPromos.find(
    (p) => p.promotionType === "SPECIFIC_PRODUCTS",
  );
  const allProductsPromo = validPromos.find(
    (p) => p.promotionType === "ALL_PRODUCTS",
  );
  let resultPromos = [...validPromos];
  if (specificPromo) {
    const cartProductIds = cartItems.map((i) => i.product.id);
    const matched = (specificPromo.productIds || []).filter((id) =>
      cartProductIds.includes(id),
    );
    if (matched.length === 0) {
      // SPECIFIC_PRODUCTS không áp cho sản phẩm nào
      resultPromos = resultPromos.filter(
        (p) => p.promotionType !== "SPECIFIC_PRODUCTS",
      );
    } else if (matched.length === cartProductIds.length && allProductsPromo) {
      // SPECIFIC_PRODUCTS áp cho toàn bộ cart, loại ALL_PRODUCTS
      resultPromos = resultPromos.filter(
        (p) => p.promotionType !== "ALL_PRODUCTS",
      );
    }
  }
  // Xử lý ORDER_TOTAL: nếu không đủ minOrderValue thì loại
  const orderTotalPromo = resultPromos.find(
    (p) => p.promotionType === "ORDER_TOTAL",
  );
  if (orderTotalPromo && orderTotal < (orderTotalPromo.minOrderValue || 0)) {
    resultPromos = resultPromos.filter(
      (p) => p.promotionType !== "ORDER_TOTAL",
    );
  }
  return resultPromos.map((p) => p.id);
}
