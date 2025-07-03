import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "../services/apiService";
import { getProductVariants, hasVariants } from "../utils/productVariants";
import type { ProductResDto } from "../types/api";

export const useProductVariants = (currentProduct: ProductResDto | null) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductResDto | null>(
    currentProduct,
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch all products to find variants
  const { data: allProductsResponse, isLoading } = useQuery({
    queryKey: ["products-for-variants"],
    queryFn: () => productApi.getList({ size: 1000 }), // Get large batch to find all variants
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const allProducts = useMemo(() => {
    return allProductsResponse?.data || [];
  }, [allProductsResponse?.data]);

  // Get all variants of the current product
  const variants = useMemo(() => {
    if (!currentProduct) return [];
    return getProductVariants(currentProduct, allProducts);
  }, [currentProduct, allProducts]);

  // Check if product has variants
  const productHasVariants = useMemo(() => {
    if (!currentProduct) return false;
    return hasVariants(currentProduct, allProducts);
  }, [currentProduct, allProducts]);

  // Update selected variant when current product changes
  useEffect(() => {
    if (
      currentProduct &&
      (!selectedVariant || selectedVariant.id !== currentProduct.id)
    ) {
      setSelectedVariant(currentProduct);
    }
  }, [currentProduct, selectedVariant]);

  // Handle variant change with smooth transition
  const handleVariantChange = async (newVariant: ProductResDto) => {
    if (newVariant.id === selectedVariant?.id) return;

    setIsTransitioning(true);

    // Small delay for smooth transition effect
    setTimeout(() => {
      setSelectedVariant(newVariant);
      setIsTransitioning(false);
    }, 150);
  };

  return {
    selectedVariant,
    variants,
    hasVariants: productHasVariants,
    isLoading,
    isTransitioning,
    handleVariantChange,
  };
};
