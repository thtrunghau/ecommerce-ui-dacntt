import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Chip, Tooltip, IconButton } from "@mui/material";
import { Visibility, ShoppingCart } from "@mui/icons-material";
import { getProductPriceInfo } from "../../utils/helpers";
import { getProductImageUrl } from "../../utils/imageUtils";
import { parseProductDescription } from "../../utils/productDescriptionUtils";
import { extractBaseName, parseVariantInfo } from "../../utils/productVariants";
import type { ProductResDto, PromotionResDto } from "../../types";

interface EnhancedProductCardProps {
  product: ProductResDto;
  allProducts: ProductResDto[]; // For finding variants
  promotions: PromotionResDto[];
  onAddToCart?: (product: ProductResDto) => void;
  className?: string;
  // Additional props for compatibility with ProductCard
  onLearnMore?: (product: ProductResDto) => void;
  // So sánh sản phẩm
  isCompared?: boolean;
  onCompareChange?: (product: ProductResDto, checked: boolean) => void;
}

const EnhancedProductCard: React.FC<EnhancedProductCardProps> = ({
  product,
  allProducts,
  promotions,
  onAddToCart,
  className = "",
  onLearnMore,
  isCompared,
  onCompareChange,
}) => {
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] =
    useState<ProductResDto>(product);
  const [imageLoading, setImageLoading] = useState(false);

  // Find all variants of this product
  const variants = useMemo(() => {
    const baseName = extractBaseName(product.productName);
    return allProducts.filter(
      (p) => extractBaseName(p.productName) === baseName,
    );
  }, [product, allProducts]);

  const hasVariants = variants.length > 1;

  // Parse variant info for quick preview
  const colorVariants = useMemo(() => {
    if (!hasVariants) return [];

    const colors = new Set<string>();
    const colorProducts = new Map<string, ProductResDto>();

    variants.forEach((variant) => {
      const variantInfo = parseVariantInfo(variant.productName);
      const colorVariant = variantInfo.variants.find((v) => v.type === "color");
      if (colorVariant) {
        colors.add(colorVariant.value);
        colorProducts.set(colorVariant.value, variant);
      }
    });

    return Array.from(colors).map((color) => ({
      color,
      product: colorProducts.get(color)!,
      available: (colorProducts.get(color)?.quantity || 0) > 0,
    }));
  }, [variants, hasVariants]);

  const storageVariants = useMemo(() => {
    if (!hasVariants) return [];

    const storages = new Set<string>();
    const storageProducts = new Map<string, ProductResDto>();

    variants.forEach((variant) => {
      const variantInfo = parseVariantInfo(variant.productName);
      const storageVariant = variantInfo.variants.find(
        (v) => v.type === "storage",
      );
      if (storageVariant) {
        storages.add(storageVariant.value);
        storageProducts.set(storageVariant.value, variant);
      }
    });

    return Array.from(storages)
      .map((storage) => ({
        storage,
        product: storageProducts.get(storage)!,
        available: (storageProducts.get(storage)?.quantity || 0) > 0,
      }))
      .sort((a, b) => {
        // Sort by storage capacity
        const aNum = parseInt(a.storage);
        const bNum = parseInt(b.storage);
        return aNum - bNum;
      });
  }, [variants, hasVariants]);

  const priceInfo = getProductPriceInfo(
    selectedVariant.id,
    selectedVariant.price,
    promotions,
  );
  const hasPromotion = priceInfo.hasActivePromotion;
  const finalPrice = priceInfo.finalPrice;

  // Parse product description to get summary and description
  const parsedDescription = parseProductDescription(
    selectedVariant.description || "",
  );
  const displayText =
    parsedDescription.summary ||
    parsedDescription.description ||
    selectedVariant.productName;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Khi click vào storage variant, điều hướng sang trang chi tiết của variant đó
  const handleVariantSelect = (variant: ProductResDto) => {
    if (variant.id === selectedVariant.id) return;
    setImageLoading(true);
    setSelectedVariant(variant);
    setTimeout(() => {
      setImageLoading(false);
      // Điều hướng sang trang chi tiết của variant
      const productPath = variant.slug || variant.id;
      navigate(`/products/${productPath}`);
    }, 200);
  };

  const handleViewDetail = () => {
    if (onLearnMore) {
      onLearnMore(selectedVariant);
    }
    // Use slug if available, otherwise use ID - matching ProductCard behavior
    const productPath = selectedVariant.slug || selectedVariant.id;
    navigate(`/products/${productPath}`);
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(selectedVariant);
    }
  };

  // Get color chip style
  const getColorChipStyle = (colorName: string) => {
    const colorMap: Record<string, string> = {
      Đỏ: "#FF0000",
      Xanh: "#0066FF",
      Vàng: "#FFD700",
      Trắng: "#FFFFFF",
      Đen: "#000000",
      Hồng: "#FF69B4",
      Bạc: "#C0C0C0",
      Xám: "#808080",
      Tím: "#800080",
      Cam: "#FFA500",
      Nâu: "#8B4513",
    };

    return {
      backgroundColor: colorMap[colorName] || "#E5E7EB",
      border: colorName === "Trắng" ? "1px solid #D1D5DB" : "none",
    };
  };

  return (
    <div
      className={`group flex h-full flex-col rounded-lg bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${className}`}
    >
      {/* Product Image */}
      <div className="relative aspect-square p-4">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-gray-50">
          <img
            src={getProductImageUrl(selectedVariant.image)}
            alt={selectedVariant.productName}
            className={`max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105 ${
              imageLoading ? "opacity-50" : "opacity-100"
            }`}
            style={{ display: "block" }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/products/placeholder.png";
            }}
          />
        </div>

        {/* Sale Badge */}
        {hasPromotion && (
          <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-md">
            Sale
          </div>
        )}

        {/* New Badge */}
        {selectedVariant.isNew && (
          <div className="absolute right-2 top-2 rounded-full bg-black px-2 py-1 text-xs font-bold text-white shadow-md">
            Mới
          </div>
        )}

        {/* Quick Action Buttons - Only show on hover for desktop */}
        <div className="absolute bottom-2 right-2 hidden gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:flex">
          <Tooltip title="Xem chi tiết">
            <IconButton
              size="small"
              onClick={handleViewDetail}
              sx={{
                bgcolor: "rgba(255,255,255,0.9)",
                "&:hover": { bgcolor: "white" },
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Thêm vào giỏ">
            <IconButton
              size="small"
              onClick={handleAddToCart}
              sx={{
                bgcolor: "rgba(255,255,255,0.9)",
                "&:hover": { bgcolor: "white" },
              }}
            >
              <ShoppingCart fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>

        {/* Stock Status */}
        {selectedVariant.quantity === 0 && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50">
            <span className="rounded bg-white px-3 py-1 text-sm font-medium text-gray-900">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex h-full flex-grow flex-col p-4">
        {/* Product Name */}
        <h4
          className="mb-2 line-clamp-2 h-12 cursor-pointer font-semibold text-gray-900 transition-colors hover:text-black"
          onClick={handleViewDetail}
        >
          {selectedVariant.productName}
        </h4>

        {/* Product Description */}
        <p className="mb-3 line-clamp-2 h-10 text-sm text-gray-600">
          {displayText}
        </p>

        {/* Color Variants */}
        {colorVariants.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <div className="mb-1 text-xs font-medium text-gray-700">
              Màu sắc:
            </div>
            <div className="flex flex-wrap gap-1">
              {colorVariants
                .slice(0, 4)
                .map(({ color, product: colorProduct, available }) => {
                  const isSelected = selectedVariant.id === colorProduct.id;
                  return (
                    <Tooltip
                      key={color}
                      title={`${color}${!available ? " (Hết hàng)" : ""}`}
                    >
                      <button
                        onClick={() =>
                          available && handleVariantSelect(colorProduct)
                        }
                        disabled={!available}
                        className={`h-6 w-6 rounded-full border-2 transition-all duration-200 ${
                          isSelected
                            ? "scale-110 border-blue-500"
                            : "border-gray-300"
                        } ${available ? "cursor-pointer hover:scale-105" : "cursor-not-allowed opacity-50"}`}
                        style={getColorChipStyle(color)}
                      />
                    </Tooltip>
                  );
                })}
              {colorVariants.length > 4 && (
                <span className="flex items-center text-xs text-gray-500">
                  +{colorVariants.length - 4}
                </span>
              )}
            </div>
          </Box>
        )}

        {/* Storage Variants */}
        {storageVariants.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <div className="mb-1 text-xs font-medium text-gray-700">
              Dung lượng:
            </div>
            <div className="flex flex-wrap gap-1">
              {storageVariants
                .slice(0, 3)
                .map(({ storage, product: storageProduct, available }) => {
                  const isSelected = selectedVariant.id === storageProduct.id;
                  return (
                    <Chip
                      key={storage}
                      label={storage}
                      size="small"
                      onClick={() =>
                        available && handleVariantSelect(storageProduct)
                      }
                      disabled={!available}
                      variant={isSelected ? "filled" : "outlined"}
                      color={isSelected ? "primary" : "default"}
                      sx={{
                        fontSize: "0.65rem",
                        height: "20px",
                        cursor: available ? "pointer" : "not-allowed",
                        opacity: available ? 1 : 0.5,
                        "&:hover": {
                          backgroundColor:
                            available && !isSelected
                              ? "action.hover"
                              : undefined,
                        },
                      }}
                    />
                  );
                })}
            </div>
          </Box>
        )}

        {/* Price Section */}
        <div className="mb-4 h-16">
          {hasPromotion ? (
            <div className="space-y-1">
              <div className="text-sm text-gray-500 line-through">
                {formatPrice(selectedVariant.price)}
              </div>
              <div className="text-lg font-bold text-red-600">
                {formatPrice(finalPrice)}
              </div>
              <div className="text-xs font-medium text-red-600">
                Tiết kiệm {formatPrice(selectedVariant.price - finalPrice)}
              </div>
            </div>
          ) : (
            <div className="text-lg font-bold text-gray-900">
              {formatPrice(finalPrice)}
            </div>
          )}
        </div>

        {/* Spacer để đẩy checkbox xuống cuối info */}
        <div className="flex-grow" />

        {/* Checkbox So sánh - luôn sát trên nút Thêm vào giỏ hàng */}
        <div className="mb-2 flex items-center">
          <input
            type="checkbox"
            checked={!!isCompared}
            onChange={(e) =>
              onCompareChange &&
              onCompareChange(selectedVariant, e.target.checked)
            }
            className="h-4 w-4 rounded border-gray-300 accent-black focus:ring-black"
            id={`compare-${selectedVariant.id}`}
          />
          <label
            htmlFor={`compare-${selectedVariant.id}`}
            className="ml-2 select-none text-xs font-medium text-gray-700"
          >
            So sánh
          </label>
        </div>

        {/* Action Buttons */}
        <div className="mt-0 space-y-2">
          <button
            onClick={handleAddToCart}
            className="w-full rounded-full border border-black bg-black px-3 py-1.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-lg active:scale-95"
          >
            Thêm vào giỏ hàng
          </button>
          <button
            onClick={handleViewDetail}
            className="w-full rounded-full border border-black bg-white px-3 py-1.5 text-sm font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-black hover:text-white hover:shadow-lg active:scale-95"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductCard;
