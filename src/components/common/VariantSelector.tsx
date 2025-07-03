/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import {
  Box,
  Chip,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
  Fade,
  CircularProgress,
} from "@mui/material";
import type { ProductResDto } from "../../types/api";
import {
  generateVariantOptions,
  getCurrentVariantValues,
} from "../../utils/productVariants";
import VariantSelectorSkeleton from "./VariantSelectorSkeleton";

interface VariantSelectorProps {
  currentProduct: ProductResDto;
  allVariants: ProductResDto[];
  onVariantChange: (variant: ProductResDto) => void;
  loading?: boolean;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  currentProduct,
  allVariants,
  onVariantChange,
  loading = false,
}) => {
  const variantOptions = generateVariantOptions(allVariants);
  const currentValues = getCurrentVariantValues(currentProduct);

  if (loading) {
    return <VariantSelectorSkeleton />;
  }

  if (variantOptions.length === 0) {
    return null; // No variants available
  }

  const handleVariantSelect = (type: string, value: string) => {
    const option = variantOptions
      .find((vo) => vo.type === type)
      ?.options.find((opt) => opt.value === value);

    if (option?.product) {
      onVariantChange(option.product);
    }
  };

  return (
    <Box sx={{ my: 3 }}>
      <Box sx={{ mb: 2 }}>
        <h3 className="text-lg font-semibold text-gray-900">
          Tùy chọn sản phẩm
        </h3>
      </Box>

      {variantOptions.map((variantGroup) => (
        <Box key={variantGroup.type} sx={{ mb: 3 }}>
          <FormControl component="fieldset" fullWidth disabled={loading}>
            <FormLabel
              component="legend"
              sx={{
                mb: 1,
                color: "text.primary",
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
            >
              {variantGroup.label}
            </FormLabel>

            {variantGroup.type === "color" ? (
              // Color variant - show as color chips
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {variantGroup.options.map((option) => {
                  const isSelected =
                    currentValues[variantGroup.type] === option.value;
                  const isAvailable = option.available;

                  return (
                    <Tooltip
                      key={option.value}
                      title={`${option.label}${!isAvailable ? " (Hết hàng)" : ""}`}
                    >
                      <Box>
                        <Chip
                          // label removed for color chips
                          label={""}
                          onClick={() =>
                            isAvailable &&
                            handleVariantSelect(variantGroup.type, option.value)
                          }
                          variant={isSelected ? "filled" : "outlined"}
                          color={isSelected ? "primary" : "default"}
                          disabled={!isAvailable || loading}
                          sx={{
                            minWidth: 32,
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            backgroundColor: option.value,
                            cursor: isAvailable ? "pointer" : "not-allowed",
                            opacity: isAvailable ? 1 : 0.5,
                            border: isSelected
                              ? "2px solid #1976d2"
                              : "1px solid #ccc",
                            "& .MuiChip-label": { display: "none" },
                            "&:hover": {
                              backgroundColor:
                                isAvailable && !isSelected
                                  ? option.value
                                  : undefined,
                            },
                          }}
                        />
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            ) : (
              // Other variants - show as radio buttons
              <RadioGroup
                value={currentValues[variantGroup.type] || ""}
                onChange={(e) =>
                  handleVariantSelect(variantGroup.type, e.target.value)
                }
                sx={{ ml: 1 }}
              >
                {variantGroup.options.map((option) => {
                  const isAvailable = option.available;

                  return (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={<Radio size="small" />}
                      label={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>{option.label}</span>
                          {variantGroup.type === "storage" && (
                            <Chip
                              label={`${option.product.price.toLocaleString("vi-VN")}₫`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.75rem" }}
                            />
                          )}
                          {!isAvailable && (
                            <Chip
                              label="Hết hàng"
                              size="small"
                              color="error"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          )}
                        </Box>
                      }
                      disabled={!isAvailable || loading}
                      sx={{
                        opacity: isAvailable ? 1 : 0.5,
                        "& .MuiFormControlLabel-label": {
                          fontSize: "0.9rem",
                        },
                      }}
                    />
                  );
                })}
              </RadioGroup>
            )}
          </FormControl>
        </Box>
      ))}

      {/* Selected variant summary */}
      <Box
        sx={{
          mt: 2,
          p: 2,
          bgcolor: "grey.50",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <span className="text-sm font-medium text-gray-700">Đã chọn:</span>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {Object.entries(currentValues).map(([type, value]) => (
            <Chip
              key={type}
              label={value}
              size="small"
              color="primary"
              variant="filled"
              sx={{ fontSize: "0.75rem" }}
            />
          ))}
        </Box>
        <Box sx={{ mt: 1 }}>
          <span className="text-primary text-lg font-bold">
            {currentProduct.price.toLocaleString("vi-VN")}₫
          </span>
          {currentProduct.quantity > 0 ? (
            <Chip
              label={`Còn ${currentProduct.quantity} sản phẩm`}
              size="small"
              color="success"
              variant="outlined"
              sx={{ ml: 1, fontSize: "0.7rem" }}
            />
          ) : (
            <Chip
              label="Hết hàng"
              size="small"
              color="error"
              variant="filled"
              sx={{ ml: 1, fontSize: "0.7rem" }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default VariantSelector;
