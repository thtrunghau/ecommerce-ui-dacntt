import React from "react";
import { Box, Chip, Tooltip, LinearProgress } from "@mui/material";
import { CheckCircle, Error, Warning, Info } from "@mui/icons-material";
import type { ProductResDto } from "../../types/api";

interface StockIndicatorProps {
  product: ProductResDto;
  variants?: ProductResDto[];
  showVariantStock?: boolean;
  compact?: boolean;
}

const StockIndicator: React.FC<StockIndicatorProps> = ({
  product,
  variants = [],
  showVariantStock = false,
  compact = false,
}) => {
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return "out-of-stock";
    if (quantity <= 5) return "low-stock";
    if (quantity <= 20) return "medium-stock";
    return "in-stock";
  };

  const getStockConfig = (status: string) => {
    switch (status) {
      case "out-of-stock":
        return {
          label: "Hết hàng",
          color: "error" as const,
          icon: <Error fontSize="small" />,
          bgColor: "error.light",
          textColor: "error.contrastText",
        };
      case "low-stock":
        return {
          label: "Sắp hết",
          color: "warning" as const,
          icon: <Warning fontSize="small" />,
          bgColor: "warning.light",
          textColor: "warning.contrastText",
        };
      case "medium-stock":
        return {
          label: "Còn hàng",
          color: "info" as const,
          icon: <Info fontSize="small" />,
          bgColor: "info.light",
          textColor: "info.contrastText",
        };
      case "in-stock":
        return {
          label: "Còn nhiều",
          color: "success" as const,
          icon: <CheckCircle fontSize="small" />,
          bgColor: "success.light",
          textColor: "success.contrastText",
        };
      default:
        return {
          label: "Không rõ",
          color: "default" as const,
          icon: <Info fontSize="small" />,
          bgColor: "grey.200",
          textColor: "text.primary",
        };
    }
  };

  const currentStatus = getStockStatus(product.quantity);
  const currentConfig = getStockConfig(currentStatus);

  // Show variant stock overview
  if (showVariantStock && variants.length > 1) {
    const variantStockSummary = variants.reduce(
      (acc, variant) => {
        const status = getStockStatus(variant.quantity);
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalVariants = variants.length;
    const inStockVariants =
      (variantStockSummary["in-stock"] || 0) +
      (variantStockSummary["medium-stock"] || 0) +
      (variantStockSummary["low-stock"] || 0);
    const outOfStockVariants = variantStockSummary["out-of-stock"] || 0;

    return (
      <Box>
        {/* Overall status */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Chip
            icon={currentConfig.icon}
            label={currentConfig.label}
            color={currentConfig.color}
            size={compact ? "small" : "medium"}
            variant="filled"
          />
          {!compact && (
            <span className="text-sm text-gray-600">
              {product.quantity > 0 ? `${product.quantity} sản phẩm` : ""}
            </span>
          )}
        </Box>

        {/* Variant stock summary */}
        {!compact && (
          <Box sx={{ mt: 1 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
            >
              <span className="text-xs text-gray-600">
                {inStockVariants}/{totalVariants} phiên bản còn hàng
              </span>
            </Box>

            {/* Stock progress bar */}
            <LinearProgress
              variant="determinate"
              value={(inStockVariants / totalVariants) * 100}
              color={
                inStockVariants === totalVariants
                  ? "success"
                  : inStockVariants > totalVariants / 2
                    ? "warning"
                    : "error"
              }
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: "grey.200",
              }}
            />

            {outOfStockVariants > 0 && (
              <span className="mt-1 block text-xs text-red-600">
                {outOfStockVariants} phiên bản hết hàng
              </span>
            )}
          </Box>
        )}
      </Box>
    );
  }

  // Single product stock display
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Tooltip title={`${product.quantity} sản phẩm có sẵn`}>
        <Chip
          icon={currentConfig.icon}
          label={
            compact
              ? currentConfig.label
              : `${currentConfig.label} (${product.quantity})`
          }
          color={currentConfig.color}
          size={compact ? "small" : "medium"}
          variant="filled"
          sx={{
            "& .MuiChip-icon": {
              fontSize: compact ? "0.875rem" : "1rem",
            },
          }}
        />
      </Tooltip>

      {!compact && product.quantity > 0 && product.quantity <= 10 && (
        <span className="text-xs text-amber-600">
          Chỉ còn {product.quantity} sản phẩm!
        </span>
      )}
    </Box>
  );
};

export default StockIndicator;
