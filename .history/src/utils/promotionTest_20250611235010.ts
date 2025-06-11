// Test file to demonstrate the improved promotion logic
import { 
  getProductPriceInfo, 
  getAllApplicablePromotions
} from './helpers';
import { mockProducts } from '../mockData/mockData';

/**
 * Test function to demonstrate the best promotion selection
 * This function can be called from console or used for debugging
 */
export const testPromotionLogic = () => {
  console.log('=== TESTING IMPROVED PROMOTION LOGIC ===\n');

  // Test with Samsung Galaxy S24 Ultra (should have multiple promotions)
  const galaxyS24 = mockProducts[0]; // Samsung Galaxy S24 Ultra
  console.log(`Testing product: ${galaxyS24.productName}`);
  console.log(`Original price: ${galaxyS24.price.toLocaleString('vi-VN')} VND`);
  
  // Get all applicable promotions
  const allPromotions = getAllApplicablePromotions(galaxyS24.id);
  console.log(`\nAll applicable promotions (${allPromotions.length}):`);
  allPromotions.forEach((promo, index) => {
    console.log(`${index + 1}. ${promo.promotionName}: ${promo.discountAmount}${promo.isPercentage ? '%' : ' VND'}`);
  });

  // Get best promotion and final price
  const priceInfo = getProductPriceInfo(galaxyS24.id, galaxyS24.price);
  if (priceInfo.hasActivePromotion && priceInfo.promotionInfo) {
    console.log(`\nBest promotion selected: ${priceInfo.promotionInfo.promotionName}`);
    console.log(`Discount: ${priceInfo.promotionInfo.discountAmount}${priceInfo.promotionInfo.isPercentage ? '%' : ' VND'}`);
    console.log(`Final price: ${priceInfo.finalPrice.toLocaleString('vi-VN')} VND`);
    console.log(`Savings: ${(priceInfo.originalPrice - priceInfo.finalPrice).toLocaleString('vi-VN')} VND`);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test with SmartThings product (should have ALL_PRODUCTS + SPECIFIC_PRODUCTS promotions)
  const smartThingsProduct = mockProducts.find(p => p.productName.includes('SmartThings'));
  if (smartThingsProduct) {
    console.log(`Testing product: ${smartThingsProduct.productName}`);
    console.log(`Original price: ${smartThingsProduct.price.toLocaleString('vi-VN')} VND`);
    
    const allSmartPromotions = getAllApplicablePromotions(smartThingsProduct.id);
    console.log(`\nAll applicable promotions (${allSmartPromotions.length}):`);
    allSmartPromotions.forEach((promo, index) => {
      console.log(`${index + 1}. ${promo.promotionName}: ${promo.discountAmount}${promo.isPercentage ? '%' : ' VND'}`);
    });

    const smartPriceInfo = getProductPriceInfo(smartThingsProduct.id, smartThingsProduct.price);
    if (smartPriceInfo.hasActivePromotion && smartPriceInfo.promotionInfo) {
      console.log(`\nBest promotion selected: ${smartPriceInfo.promotionInfo.promotionName}`);
      console.log(`Discount: ${smartPriceInfo.promotionInfo.discountAmount}${smartPriceInfo.promotionInfo.isPercentage ? '%' : ' VND'}`);
      console.log(`Final price: ${smartPriceInfo.finalPrice.toLocaleString('vi-VN')} VND`);
      console.log(`Savings: ${(smartPriceInfo.originalPrice - smartPriceInfo.finalPrice).toLocaleString('vi-VN')} VND`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Test completed! The system now selects the best promotion automatically.');
};

// Export for use in console: testPromotionLogic()
(window as any).testPromotionLogic = testPromotionLogic;
