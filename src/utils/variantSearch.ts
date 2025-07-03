import type { ProductResDto } from "../types/api";
import { extractBaseName, parseVariantInfo } from "./productVariants";

/**
 * Enhanced search function that supports variant-aware searching
 */
export const searchProductsWithVariants = (
  products: ProductResDto[],
  searchTerm: string,
  options: {
    searchInVariants?: boolean;
    groupVariants?: boolean;
    includeDescriptions?: boolean;
  } = {},
): ProductResDto[] => {
  const {
    searchInVariants = true,
    groupVariants = false,
    includeDescriptions = true,
  } = options;

  if (!searchTerm.trim()) return products;

  const searchTermLower = searchTerm.toLowerCase().trim();
  const searchTerms = searchTermLower.split(/\s+/);

  const matchedProducts = products.filter((product) => {
    // Search in product name
    const productNameLower = product.productName.toLowerCase();
    const baseNameLower = extractBaseName(product.productName).toLowerCase();

    // Basic name search
    const nameMatch = searchTerms.some(
      (term) => productNameLower.includes(term) || baseNameLower.includes(term),
    );

    if (nameMatch) return true;

    // Search in variant information
    if (searchInVariants) {
      const variantInfo = parseVariantInfo(product.productName);
      const variantMatch = variantInfo.variants.some((variant) =>
        variant.value.toLowerCase().includes(searchTermLower),
      );

      if (variantMatch) return true;
    }

    // Search in descriptions
    if (includeDescriptions && product.description) {
      const descriptionMatch = searchTerms.some((term) =>
        product.description?.toLowerCase().includes(term),
      );

      if (descriptionMatch) return true;
    }

    return false;
  });

  // Group variants if requested
  if (groupVariants) {
    return groupVariantSearchResults(matchedProducts);
  }

  return matchedProducts;
};

/**
 * Groups search results by base product name to show one representative per variant group
 */
const groupVariantSearchResults = (
  products: ProductResDto[],
): ProductResDto[] => {
  const baseNameMap = new Map<string, ProductResDto[]>();

  // Group products by base name
  products.forEach((product) => {
    const baseName = extractBaseName(product.productName);
    if (!baseNameMap.has(baseName)) {
      baseNameMap.set(baseName, []);
    }
    baseNameMap.get(baseName)!.push(product);
  });

  // Return one representative product per group (preferably the first or cheapest)
  return Array.from(baseNameMap.values()).map((variants) => {
    // Sort by price and return the cheapest variant as representative
    return variants.sort((a, b) => a.price - b.price)[0];
  });
};

/**
 * Filter products by variant attributes
 */
export const filterProductsByVariants = (
  products: ProductResDto[],
  filters: {
    colors?: string[];
    storages?: string[];
    sizes?: string[];
    models?: string[];
    priceRange?: { min: number; max: number };
  },
): ProductResDto[] => {
  return products.filter((product) => {
    const variantInfo = parseVariantInfo(product.productName);

    // Color filter
    if (filters.colors && filters.colors.length > 0) {
      const productColor = variantInfo.variants.find(
        (v) => v.type === "color",
      )?.value;
      if (!productColor || !filters.colors.includes(productColor)) {
        return false;
      }
    }

    // Storage filter
    if (filters.storages && filters.storages.length > 0) {
      const productStorage = variantInfo.variants.find(
        (v) => v.type === "storage",
      )?.value;
      if (!productStorage || !filters.storages.includes(productStorage)) {
        return false;
      }
    }

    // Size filter
    if (filters.sizes && filters.sizes.length > 0) {
      const productSize = variantInfo.variants.find(
        (v) => v.type === "size",
      )?.value;
      if (!productSize || !filters.sizes.includes(productSize)) {
        return false;
      }
    }

    // Model filter
    if (filters.models && filters.models.length > 0) {
      const productModel = variantInfo.variants.find(
        (v) => v.type === "model",
      )?.value;
      if (!productModel || !filters.models.includes(productModel)) {
        return false;
      }
    }

    // Price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (product.price < min || product.price > max) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Get all available filter options from a product list
 */
export const getAvailableFilterOptions = (
  products: ProductResDto[],
): {
  colors: string[];
  storages: string[];
  sizes: string[];
  models: string[];
  priceRange: { min: number; max: number };
} => {
  const colors = new Set<string>();
  const storages = new Set<string>();
  const sizes = new Set<string>();
  const models = new Set<string>();
  let minPrice = Infinity;
  let maxPrice = 0;

  products.forEach((product) => {
    const variantInfo = parseVariantInfo(product.productName);

    variantInfo.variants.forEach((variant) => {
      switch (variant.type) {
        case "color":
          colors.add(variant.value);
          break;
        case "storage":
          storages.add(variant.value);
          break;
        case "size":
          sizes.add(variant.value);
          break;
        case "model":
          models.add(variant.value);
          break;
      }
    });

    minPrice = Math.min(minPrice, product.price);
    maxPrice = Math.max(maxPrice, product.price);
  });

  return {
    colors: Array.from(colors).sort(),
    storages: Array.from(storages).sort((a, b) => {
      // Sort storage by capacity
      const aNum = parseInt(a);
      const bNum = parseInt(b);
      return aNum - bNum;
    }),
    sizes: Array.from(sizes).sort(),
    models: Array.from(models).sort(),
    priceRange: {
      min: minPrice === Infinity ? 0 : minPrice,
      max: maxPrice || 0,
    },
  };
};

/**
 * Smart search suggestions based on variants
 */
export const getSearchSuggestions = (
  products: ProductResDto[],
  searchTerm: string,
  maxSuggestions: number = 5,
): Array<{
  type: "product" | "variant" | "category";
  text: string;
  count: number;
}> => {
  if (!searchTerm.trim()) return [];

  const searchTermLower = searchTerm.toLowerCase();
  const suggestions = new Map<
    string,
    { type: "product" | "variant" | "category"; count: number }
  >();

  products.forEach((product) => {
    const baseName = extractBaseName(product.productName);
    const baseNameLower = baseName.toLowerCase();

    // Add base product name suggestions
    if (baseNameLower.includes(searchTermLower)) {
      const key = baseName;
      suggestions.set(key, {
        type: "product",
        count: (suggestions.get(key)?.count || 0) + 1,
      });
    }

    // Add variant suggestions
    const variantInfo = parseVariantInfo(product.productName);
    variantInfo.variants.forEach((variant) => {
      if (variant.value.toLowerCase().includes(searchTermLower)) {
        const key = `${baseName} ${variant.value}`;
        suggestions.set(key, {
          type: "variant",
          count: (suggestions.get(key)?.count || 0) + 1,
        });
      }
    });
  });

  return Array.from(suggestions.entries())
    .map(([text, { type, count }]) => ({ type, text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, maxSuggestions);
};
