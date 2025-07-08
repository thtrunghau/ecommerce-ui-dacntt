import type { ProductResDto } from "../types/api";

/**
 * Extract base product name by removing variant-specific information
 * while preserving the first character of the product name
 */
export const extractBaseName = (productName: string): string => {
  if (!productName || productName.length === 0) return "";
  
  // Lưu lại ký tự đầu tiên để đảm bảo không bị mất
  const firstChar = productName.charAt(0);
  
  // Xử lý phần còn lại của chuỗi (từ ký tự thứ 2 trở đi)
  const restOfName = productName.substring(1);
  
  const processedRest = restOfName
    // Remove storage variants (added 126GB)
    .replace(
      /\s*(8GB|16GB|32GB|64GB|126GB|128GB|256GB|512GB|1TB|2TB)\s*/gi,
      "",
    )
    // Remove color variants
    .replace(
      /\s*(Đỏ|Xanh|Vàng|Trắng|Đen|Hồng|Bạc|Vàng Rose|Xanh Navy|Xanh Dương|Tím|Cam|Xám|Nâu)\s*/gi,
      "",
    )
    // Remove size variants
    .replace(/\s*(XS|S|M|L|XL|XXL|XXXL)\s*/gi, "")
    // Remove model variants (keep at end to avoid removing Pro/Max from main name)
    .replace(
      /\s*-\s*(Pro|Max|Plus|Mini|Lite|Standard|Basic|Premium)\s*$/gi,
      "",
    )
    // Remove generation numbers at the end
    .replace(/\s*(Gen\s*\d+|\d+th\s*Gen)\s*$/gi, "")
    // Clean up extra spaces
    .replace(/\s+/g, " ");
    
  // Kết hợp ký tự đầu tiên với phần còn lại đã xử lý
  return (firstChar + processedRest).trim();
};

/**
 * Group products by their base name to identify variants
 */
export const groupProductsByVariant = (
  products: ProductResDto[],
): Map<string, ProductResDto[]> => {
  const groups = new Map<string, ProductResDto[]>();

  products.forEach((product) => {
    const baseName = extractBaseName(product.productName);

    if (!groups.has(baseName)) {
      groups.set(baseName, []);
    }
    groups.get(baseName)!.push(product);
  });

  return groups;
};

/**
 * Check if a product has variants (more than 1 product with same base name)
 */
export const hasVariants = (
  product: ProductResDto,
  allProducts: ProductResDto[],
): boolean => {
  const baseName = extractBaseName(product.productName);
  const sameBaseProducts = allProducts.filter(
    (p) => extractBaseName(p.productName) === baseName,
  );
  return sameBaseProducts.length > 1;
};

/**
 * Get all variants of a product
 */
export const getProductVariants = (
  product: ProductResDto,
  allProducts: ProductResDto[],
): ProductResDto[] => {
  const baseName = extractBaseName(product.productName);
  return allProducts.filter((p) => extractBaseName(p.productName) === baseName);
};

/**
 * Parse variant information from product name
 */
export const parseVariantInfo = (
  productName: string,
): {
  baseName: string;
  variants: Array<{
    type: "storage" | "color" | "size" | "model";
    value: string;
  }>;
} => {
  const baseName = extractBaseName(productName);
  const variants: Array<{
    type: "storage" | "color" | "size" | "model";
    value: string;
  }> = [];

  // Extract storage (added 126GB)
  const storageMatch = productName.match(
    /(8GB|16GB|32GB|64GB|126GB|128GB|256GB|512GB|1TB|2TB)/gi,
  );
  if (storageMatch) {
    variants.push({ type: "storage", value: storageMatch[0] });
  }

  // Extract color
  const colorMatch = productName.match(
    /(Đỏ|Xanh|Vàng|Trắng|Đen|Hồng|Bạc|Vàng Rose|Xanh Navy|Xanh Dương|Tím|Cam|Xám|Nâu)/gi,
  );
  if (colorMatch) {
    variants.push({ type: "color", value: colorMatch[0] });
  }

  // Extract size
  const sizeMatch = productName.match(/(XS|S|M|L|XL|XXL|XXXL)/gi);
  if (sizeMatch) {
    variants.push({ type: "size", value: sizeMatch[0] });
  }

  // Extract model variant
  const modelMatch = productName.match(
    /(Pro|Max|Plus|Mini|Lite|Standard|Basic|Premium)$/gi,
  );
  if (modelMatch) {
    variants.push({ type: "model", value: modelMatch[0] });
  }

  return { baseName, variants };
};

/**
 * Generate variant options for selector
 */
export const generateVariantOptions = (
  variants: ProductResDto[],
): Array<{
  type: "storage" | "color" | "size" | "model";
  label: string;
  options: Array<{
    value: string;
    label: string;
    product: ProductResDto;
    available: boolean;
  }>;
}> => {
  const optionGroups = new Map<string, Set<string>>();
  const optionProducts = new Map<string, ProductResDto>();

  // Collect all variant options
  variants.forEach((product) => {
    const variantInfo = parseVariantInfo(product.productName);

    variantInfo.variants.forEach((variant) => {
      const key = `${variant.type}-${variant.value}`;

      if (!optionGroups.has(variant.type)) {
        optionGroups.set(variant.type, new Set());
      }

      optionGroups.get(variant.type)!.add(variant.value);
      optionProducts.set(key, product);
    });
  });

  // Convert to structured options
  const result: Array<{
    type: "storage" | "color" | "size" | "model";
    label: string;
    options: Array<{
      value: string;
      label: string;
      product: ProductResDto;
      available: boolean;
    }>;
  }> = [];

  const typeLabels: Record<string, string> = {
    storage: "Dung lượng",
    color: "Màu sắc",
    size: "Kích thước",
    model: "Phiên bản",
  };

  optionGroups.forEach((values, type) => {
    const options = Array.from(values)
      .map((value) => {
        const product = optionProducts.get(`${type}-${value}`);
        return {
          value,
          label: value,
          product: product!,
          available: (product?.quantity || 0) > 0,
        };
      })
      .sort((a, b) => {
        // Sort storage by capacity
        if (type === "storage") {
          const aNum = parseInt(a.value);
          const bNum = parseInt(b.value);
          return aNum - bNum;
        }
        // Sort others alphabetically
        return a.label.localeCompare(b.label);
      });

    result.push({
      type: type as "storage" | "color" | "size" | "model",
      label: typeLabels[type] || type,
      options,
    });
  });

  return result;
};

/**
 * Find the best matching variant based on current selection
 */
export const findBestVariant = (
  variants: ProductResDto[],
  currentProduct: ProductResDto,
  targetVariant: {
    type: "storage" | "color" | "size" | "model";
    value: string;
  },
): ProductResDto | null => {
  const currentVariants = parseVariantInfo(currentProduct.productName).variants;

  // Create target variant combination
  const targetVariants = currentVariants.map((v) =>
    v.type === targetVariant.type ? { ...v, value: targetVariant.value } : v,
  );

  // If no matching variant type exists, add it
  if (!currentVariants.some((v) => v.type === targetVariant.type)) {
    targetVariants.push(targetVariant);
  }

  // Find product that matches the target combination
  const matchingProduct = variants.find((product) => {
    const productVariants = parseVariantInfo(product.productName).variants;

    return targetVariants.every((target) =>
      productVariants.some(
        (pv) => pv.type === target.type && pv.value === target.value,
      ),
    );
  });

  return matchingProduct || null;
};

/**
 * Get current variant values for a product
 */
export const getCurrentVariantValues = (
  product: ProductResDto,
): Record<string, string> => {
  const variantInfo = parseVariantInfo(product.productName);
  const result: Record<string, string> = {};

  variantInfo.variants.forEach((variant) => {
    result[variant.type] = variant.value;
  });

  return result;
};
