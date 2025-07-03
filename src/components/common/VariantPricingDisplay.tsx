import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import type { ProductResDto, PromotionResDto } from "../../types/api";
import { getProductPriceInfo } from "../../utils/helpers";

interface VariantPricingDisplayProps {
  variants: ProductResDto[];
  promotions: PromotionResDto[];
  currentProduct?: ProductResDto;
  showRange?: boolean;
  compact?: boolean;
}

const VariantPricingDisplay: React.FC<VariantPricingDisplayProps> = ({
  variants,
  promotions,
  currentProduct,
  showRange = true,
  compact = false,
}) => {
  if (variants.length === 0) return null;

  // Calculate price info for all variants
  const variantPrices = variants.map((variant) => {
    const priceInfo = getProductPriceInfo(
      variant.id,
      variant.price,
      promotions,
    );
    return {
      variant,
      originalPrice: variant.price,
      finalPrice: priceInfo.finalPrice,
      hasPromotion: priceInfo.hasActivePromotion,
      discount: variant.price - priceInfo.finalPrice,
    };
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // If showing single product pricing
  if (currentProduct && !showRange) {
    const currentPricing = variantPrices.find(
      (vp) => vp.variant.id === currentProduct.id,
    );
    if (!currentPricing) return null;

    return (
      <Box>
        {currentPricing.hasPromotion && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography
              variant="body2"
              sx={{
                textDecoration: "line-through",
                color: "text.secondary",
              }}
            >
              {formatPrice(currentPricing.originalPrice)}
            </Typography>
            <Chip
              label={`-${Math.round((currentPricing.discount / currentPricing.originalPrice) * 100)}%`}
              size="small"
              color="error"
              sx={{ fontSize: "0.7rem" }}
            />
          </Box>
        )}
        <Typography
          variant={compact ? "h6" : "h5"}
          color={currentPricing.hasPromotion ? "error" : "text.primary"}
          fontWeight="600"
        >
          {formatPrice(currentPricing.finalPrice)}
        </Typography>
      </Box>
    );
  }

  // Show price range for variants
  const finalPrices = variantPrices.map((vp) => vp.finalPrice);
  const minPrice = Math.min(...finalPrices);
  const maxPrice = Math.max(...finalPrices);
  const hasAnyPromotion = variantPrices.some((vp) => vp.hasPromotion);

  if (minPrice === maxPrice) {
    // All variants have same price
    const samplePricing = variantPrices[0];
    return (
      <Box>
        {samplePricing.hasPromotion && (
          <Typography
            variant="body2"
            sx={{
              textDecoration: "line-through",
              color: "text.secondary",
              mb: 0.5,
            }}
          >
            {formatPrice(samplePricing.originalPrice)}
          </Typography>
        )}
        <Typography
          variant={compact ? "h6" : "h5"}
          color={samplePricing.hasPromotion ? "error" : "text.primary"}
          fontWeight="600"
        >
          {formatPrice(minPrice)}
        </Typography>
      </Box>
    );
  }

  // Different prices - show range
  return (
    <Box>
      {hasAnyPromotion && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Chip
            label="Có khuyến mãi"
            size="small"
            color="error"
            sx={{ fontSize: "0.7rem" }}
          />
        </Box>
      )}
      <Typography
        variant={compact ? "h6" : "h5"}
        color={hasAnyPromotion ? "error" : "text.primary"}
        fontWeight="600"
      >
        {formatPrice(minPrice)} - {formatPrice(maxPrice)}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: "0.8rem" }}
      >
        Tùy theo phiên bản
      </Typography>
    </Box>
  );
};

export default VariantPricingDisplay;
