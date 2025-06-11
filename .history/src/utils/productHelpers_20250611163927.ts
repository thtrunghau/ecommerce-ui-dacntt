import { mockPromotions } from "../mockData/mockData";

interface PromotionInfo {
  promotionId: string;
  promotionName: string;
  discountAmount: number;
  isPercentage: boolean;
}

/**
 * Kiểm tra xem sản phẩm có đang được khuyến mãi không và trả về thông tin khuyến mãi
 * @param productId ID của sản phẩm cần kiểm tra
 * @returns Thông tin khuyến mãi hoặc null nếu không có
 */
export const getProductPromotionInfo = (productId: string): PromotionInfo | null => {
  const currentDate = new Date();
  
  // Tìm khuyến mãi đang áp dụng cho sản phẩm này
  const activePromotion = mockPromotions.find(promo => {
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);
    
    const isActive = currentDate >= startDate && currentDate <= endDate;
    const isApplicable = 
      promo.promotionType === "ALL_PRODUCTS" || 
      (promo.promotionType === "SPECIFIC_PRODUCTS" && promo.productIds.includes(productId));
    
    return isActive && isApplicable;
  });
  
  if (!activePromotion) return null;
  
  return {
    promotionId: activePromotion.id,
    promotionName: activePromotion.promotionName,
    discountAmount: activePromotion.discountAmount,
    isPercentage: activePromotion.proportionType === "PERCENTAGE"
  };
};

/**
 * Tính giá sau khuyến mãi
 * @param originalPrice Giá gốc
 * @param promotionInfo Thông tin khuyến mãi
 * @returns Giá sau khuyến mãi
 */
export const calculateDiscountedPrice = (
  originalPrice: number, 
  promotionInfo: PromotionInfo | null
): number => {
  if (!promotionInfo) return originalPrice;
  
  if (promotionInfo.isPercentage) {
    return originalPrice * (1 - promotionInfo.discountAmount / 100);
  }
  
  return originalPrice - promotionInfo.discountAmount;
};

/**
 * Format số tiền thành định dạng tiền Việt Nam
 * @param amount Số tiền cần format
 * @returns Chuỗi định dạng tiền Việt Nam
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
