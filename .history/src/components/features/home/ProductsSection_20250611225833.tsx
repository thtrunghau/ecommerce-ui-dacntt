import React, { useState, useEffect } from "react";
import {
  mockCategories,
  mockProducts,
  mockPromotions,
} from "../../../mockData/mockData";
import { getProductPromotionInfo } from "../../../utils/helpers";
import type { ProductResDto, CategoryResDto } from "../../../types";

interface ProductsSectionProps {}

type SortOption = "newest" | "price-asc" | "price-desc" | "popular";

const ProductsSection: React.FC<ProductsSectionProps> = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [displayedProducts, setDisplayedProducts] = useState<ProductResDto[]>(
    [],
  );
  const [allProducts, setAllProducts] = useState<ProductResDto[]>([]);
  const [productsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>(
    [],
  );

  // Load products on component mount
  useEffect(() => {
    setAllProducts(mockProducts);
  }, []);

  // Filter and sort products when category or sort option changes
  useEffect(() => {
    let filteredProducts = [...allProducts];

    // Filter by category
    if (selectedCategory !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.categoryId === selectedCategory,
      );
    }    // Sort products
    filteredProducts.sort((a, b) => {
      switch (sortOption) {
        case "price-asc": {
          const priceA =
            getProductPromotionInfo(a.id, mockPromotions).finalPrice || a.price;
          const priceB =
            getProductPromotionInfo(b.id, mockPromotions).finalPrice || b.price;
          return priceA - priceB;
        }
        case "price-desc": {
          const priceA2 =
            getProductPromotionInfo(a.id, mockPromotions).finalPrice || a.price;
          const priceB2 =
            getProductPromotionInfo(b.id, mockPromotions).finalPrice || b.price;
          return priceB2 - priceA2;
        }
        case "popular":
          // Sort by new products first, then by name
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return a.productName.localeCompare(b.productName);
        case "newest":
        default:
          // Sort by new products first, then by name
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return a.productName.localeCompare(b.productName);
      }
    });

    // Paginate products
    const startIndex = 0;
    const endIndex = currentPage * productsPerPage;
    setDisplayedProducts(filteredProducts.slice(startIndex, endIndex));
  }, [allProducts, selectedCategory, sortOption, currentPage]);

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleComparisonToggle = (productId: string) => {
    setSelectedForComparison((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case "newest":
        return "Mới nhất";
      case "price-asc":
        return "Giá tăng dần";
      case "price-desc":
        return "Giá giảm dần";
      case "best-seller":
        return "Bán chạy nhất";
      default:
        return "Mới nhất";
    }
  };

  const hasMoreProducts = () => {
    let filteredProducts = [...allProducts];
    if (selectedCategory !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.categoryId === selectedCategory,
      );
    }
    return filteredProducts.length > displayedProducts.length;
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
          Sản phẩm
        </h2>

        {/* Main Container */}
        <div className="flex flex-col space-y-8">
          {/* Filter Controls */}
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex-1"></div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Sắp xếp:
              </span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="best-seller">Bán chạy nhất</option>
              </select>
            </div>
          </div>

          {/* Main Content - Flex Row */}
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Left Column - Categories */}
            <div className="lg:w-1/4">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Danh mục sản phẩm
                </h3>
                <div className="space-y-2">
                  {/* All Categories Option */}
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full rounded-lg px-4 py-3 text-left transition-colors ${
                      selectedCategory === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Tất cả
                  </button>

                  {/* Category Options */}
                  {mockCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full rounded-lg px-4 py-3 text-left transition-colors ${
                        selectedCategory === category.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {category.categoryName}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Products Grid */}
            <div className="lg:w-3/4">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayedProducts.map((product) => {
                  const promotionInfo = getProductPromotionInfo(
                    product.id,
                    mockPromotions,
                  );
                  const hasPromotion = promotionInfo.hasActivePromotion;
                  const finalPrice = promotionInfo.finalPrice || product.price;

                  return (
                    <div
                      key={product.id}
                      className="rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square p-4">
                        <img
                          src={product.image}
                          alt={product.productName}
                          className="h-full w-full rounded-lg object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/products/placeholder.png";
                          }}
                        />
                        {hasPromotion && (
                          <div className="absolute left-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
                            Sale
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        {/* Product Name */}
                        <h4 className="mb-2 line-clamp-2 font-semibold text-gray-900">
                          {product.productName}
                        </h4>

                        {/* Price */}
                        <div className="mb-4">
                          {hasPromotion ? (
                            <div className="space-y-1">
                              <div className="text-sm text-gray-500 line-through">
                                {formatPrice(product.price)}
                              </div>
                              <div className="text-lg font-bold text-red-600">
                                {formatPrice(finalPrice)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-lg font-bold text-gray-900">
                              {formatPrice(finalPrice)}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mb-4 space-y-2">
                          <button className="w-full rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800">
                            Thêm vào giỏ hàng
                          </button>
                          <button className="w-full rounded-lg border border-black px-4 py-2 text-black transition-colors hover:bg-gray-50">
                            Tìm hiểu thêm
                          </button>
                        </div>

                        {/* Comparison Checkbox */}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`compare-${product.id}`}
                            checked={selectedForComparison.includes(product.id)}
                            onChange={() => handleComparisonToggle(product.id)}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`compare-${product.id}`}
                            className="text-sm text-gray-600"
                          >
                            So sánh
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {hasMoreProducts() && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleLoadMore}
                    className="rounded-full bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Xem thêm
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
