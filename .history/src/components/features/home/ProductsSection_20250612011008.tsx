import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { mockCategories, mockProducts } from "../../../mockData/mockData";
import { getProductPriceInfo, getAllApplicablePromotions } from "../../../utils/helpers";
import ProductCard from "../../common/ProductCard";
import type { ProductResDto } from "../../../types";

type ProductsSectionProps = Record<string, never>;

type SortOption = "newest" | "price-asc" | "price-desc" | "popular";

const ProductsSection: React.FC<ProductsSectionProps> = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
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

  // URL PARAMETER ANALYSIS - Log incoming navigation data
  useEffect(() => {
    console.group("🎯 PRODUCTS SECTION - URL PARAMETER ANALYSIS");
    console.log("📍 Current Location:", {
      pathname: location.pathname,
      search: location.search,
      full_url: `${location.pathname}${location.search}`
    });

    const categoryParam = searchParams.get("category");
    const promotionParam = searchParams.get("promotion");
    
    console.log("🔗 URL Parameters Received:", {
      category: categoryParam,
      promotion: promotionParam,
      raw_search_params: location.search,
      expected_behavior: categoryParam ? `Filter by category: ${categoryParam}` : 
                        promotionParam ? "Show promoted products" : "Show all products"
    });

    // Apply URL parameters to component state
    if (promotionParam === "true") {
      console.log("🎉 PROMOTION FILTER APPLIED - Filtering products with active promotions");
      // For now, we'll handle this in the filtering logic
      setSelectedCategory("promotion");
    } else if (categoryParam) {
      console.log(`📂 CATEGORY FILTER APPLIED - Category ID: ${categoryParam}`);
      setSelectedCategory(categoryParam);
    } else {
      console.log("📋 DEFAULT VIEW - Showing all products");
      setSelectedCategory("all");
    }
    
    console.groupEnd();
  }, [location, searchParams]);

  // Load products on component mount
  useEffect(() => {
    console.group("📊 PRODUCTS SECTION - DATA LOADING");
    console.log("🛍️ Loading Products Data:", {
      source: "mockProducts",
      total_count: mockProducts.length,
      sample_product: mockProducts[0],
      integration_notes: "Replace with API call based on URL parameters"
    });
    setAllProducts(mockProducts);
    console.groupEnd();
  }, []);
  // Filter and sort products when category or sort option changes
  useEffect(() => {
    console.group("🔄 PRODUCTS FILTERING & SORTING");
    
    let filteredProducts = [...allProducts];

    // Filter by category or promotion
    if (selectedCategory === "promotion") {
      // Filter products with active promotions
      filteredProducts = filteredProducts.filter((product) => {
        const applicablePromotions = getAllApplicablePromotions(product.id);
        return applicablePromotions.length > 0;
      });
      console.log("🎉 Promotion Filter Applied:", {
        total_products: allProducts.length,
        promoted_products: filteredProducts.length,
        promotion_rate: `${((filteredProducts.length / allProducts.length) * 100).toFixed(1)}%`
      });
    } else if (selectedCategory !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.categoryId === selectedCategory,
      );
      const categoryName = mockCategories.find(c => c.id === selectedCategory)?.categoryName;
      console.log("📂 Category Filter Applied:", {
        category_id: selectedCategory,
        category_name: categoryName,
        total_products: allProducts.length,
        filtered_products: filteredProducts.length
      });
    } else {
      console.log("📋 No Filter Applied - Showing all products:", {
        total_products: allProducts.length
      });
    }

    // Sort products
    console.log("🔢 Sorting Applied:", {
      sort_option: sortOption,
      products_to_sort: filteredProducts.length
    });
    
    filteredProducts.sort((a, b) => {
      switch (sortOption) {
        case "price-asc": {
          const priceInfoA = getProductPriceInfo(a.id, a.price);
          const priceInfoB = getProductPriceInfo(b.id, b.price);
          return priceInfoA.finalPrice - priceInfoB.finalPrice;
        }
        case "price-desc": {
          const priceInfoA = getProductPriceInfo(a.id, a.price);
          const priceInfoB = getProductPriceInfo(b.id, b.price);
          return priceInfoB.finalPrice - priceInfoA.finalPrice;
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
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    console.log("📄 Pagination Applied:", {
      total_filtered: filteredProducts.length,
      current_page: currentPage,
      products_per_page: productsPerPage,
      displayed_count: paginatedProducts.length,
      has_more: filteredProducts.length > paginatedProducts.length
    });
    
    setDisplayedProducts(paginatedProducts);
    console.groupEnd();
  }, [allProducts, selectedCategory, sortOption, currentPage, productsPerPage]);

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
  const handleAddToCart = (product: ProductResDto) => {
    // TODO: Implement add to cart logic
    console.log("Add to cart:", product.productName);
  };
  const handleLearnMore = (product: ProductResDto) => {
    // TODO: Navigate to product detail page
    console.log("Learn more:", product.productName);
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

  // Calculate total filtered products count for stats display
  const getTotalFilteredCount = () => {
    let filteredProducts = [...allProducts];
    if (selectedCategory !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.categoryId === selectedCategory,
      );
    }
    return filteredProducts.length;
  };
  return (
    <section className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-16">
      <div className="container mx-auto px-4">
        {" "}
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-black">
            Sản phẩm Tech Zone
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Khám phá bộ sưu tập sản phẩm công nghệ tiên tiến với chất lượng vượt
            trội
          </p>
          <div className="mt-6 flex items-center justify-center space-x-2">
            <div className="h-1 w-12 rounded-full bg-black"></div>
            <div className="h-1 w-6 rounded-full bg-gray-300"></div>
            <div className="h-1 w-6 rounded-full bg-gray-300"></div>
          </div>
        </div>{" "}
        {/* Main Container */}
        <div className="flex flex-col space-y-8">
          {/* Stats & Filter Controls */}
          <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-white p-6 shadow-sm sm:flex-row sm:items-center">
            {" "}
            {/* Stats */}
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-gray-500">Tìm thấy</p>
              <p className="text-2xl font-bold text-gray-900">
                {getTotalFilteredCount()}{" "}
                <span className="text-base font-normal text-gray-500">
                  sản phẩm
                  {displayedProducts.length < getTotalFilteredCount() && (
                    <span className="ml-1 text-gray-400">
                      (hiển thị {displayedProducts.length})
                    </span>
                  )}
                  {selectedCategory !== "all" && (
                    <span className="ml-1 text-blue-600">
                      trong{" "}
                      {
                        mockCategories.find((c) => c.id === selectedCategory)
                          ?.categoryName
                      }
                    </span>
                  )}
                </span>
              </p>
            </div>{" "}
            {/* Sort Dropdown - Minimalist Design */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Sắp xếp theo:
              </span>
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="appearance-none rounded-full border border-gray-300 bg-white px-4 py-2 pr-8 text-sm font-medium text-gray-900 transition-all duration-200 hover:border-black hover:shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black/10"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="popular">Phổ biến</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="h-3 w-3 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {/* Main Content - Flex Row */}
          <div className="flex flex-col gap-8 lg:flex-row">
            {" "}
            {/* Left Column - Categories */}
            <div className="lg:w-1/4">
              <div className="sticky top-4 rounded-xl bg-white p-6 shadow-sm">
                {" "}
                <div className="mb-6 flex items-center space-x-2">
                  <div className="rounded-lg bg-gray-100 p-2">
                    <svg
                      className="h-5 w-5 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14-7H5m8 14H5"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Danh mục sản phẩm
                  </h3>
                </div>
                <div className="space-y-2">
                  {" "}
                  {/* All Categories Option */}
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`group w-full rounded-lg px-4 py-3 text-left transition-all duration-200 ${
                      selectedCategory === "all"
                        ? "bg-black text-white shadow-lg"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Tất cả</span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          selectedCategory === "all"
                            ? "bg-white/20 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {allProducts.length}
                      </span>
                    </div>
                  </button>{" "}
                  {/* Category Options */}
                  {mockCategories.map((category) => {
                    const categoryProductCount = allProducts.filter(
                      (product) => product.categoryId === category.id,
                    ).length;

                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`group w-full rounded-lg px-4 py-3 text-left transition-all duration-200 ${
                          selectedCategory === category.id
                            ? "bg-black text-white shadow-lg"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {category.categoryName}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              selectedCategory === category.id
                                ? "bg-white/20 text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {categoryProductCount}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>{" "}
            {/* Right Column - Products Grid */}
            <div className="lg:w-3/4">
              {displayedProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {displayedProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="animate-fade-in-up"
                        style={{
                          animationDelay: `${index * 0.1}s`,
                          animationFillMode: "both",
                        }}
                      >
                        <ProductCard
                          product={product}
                          isSelected={selectedForComparison.includes(
                            product.id,
                          )}
                          onComparisonToggle={handleComparisonToggle}
                          onAddToCart={handleAddToCart}
                          onLearnMore={handleLearnMore}
                          showComparisonCheckbox={true}
                        />
                      </div>
                    ))}
                  </div>{" "}
                  {/* Load More Button */}
                  {hasMoreProducts() && (
                    <div className="mt-12 text-center">
                      <button
                        onClick={handleLoadMore}
                        className="group relative overflow-hidden rounded-full bg-black px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
                      >
                        <span className="relative z-10 flex items-center space-x-2">
                          <span>Xem thêm sản phẩm</span>
                          <svg
                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </span>
                        <div className="absolute inset-0 bg-gray-800 opacity-0 transition-opacity group-hover:opacity-100"></div>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center rounded-xl bg-white p-12 text-center shadow-sm">
                  <div className="mb-4 rounded-full bg-gray-100 p-6">
                    <svg
                      className="h-16 w-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    Không tìm thấy sản phẩm
                  </h3>
                  <p className="mb-6 max-w-md text-gray-600">
                    Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với
                    bộ lọc của bạn. Hãy thử chọn danh mục khác.
                  </p>{" "}
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="rounded-lg bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800"
                  >
                    Xem tất cả sản phẩm
                  </button>
                </div>
              )}
            </div>
          </div>{" "}
        </div>
        {/* Floating Comparison Panel */}
        {selectedForComparison.length > 0 && (
          <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform">
            <div className="mx-4 rounded-xl bg-white p-4 shadow-2xl ring-1 ring-gray-200">
              <div className="flex items-center space-x-4">
                {" "}
                <div className="flex items-center space-x-2">
                  <div className="rounded-full bg-gray-100 p-2">
                    <svg
                      className="h-5 w-5 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Đã chọn {selectedForComparison.length} sản phẩm
                    </p>
                    <p className="text-sm text-gray-500">để so sánh chi tiết</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {" "}
                  <button
                    onClick={() => {
                      // TODO: Navigate to comparison page
                      console.log("Compare products:", selectedForComparison);
                    }}
                    disabled={selectedForComparison.length < 2}
                    className={`rounded-lg px-4 py-2 font-medium text-white transition-all ${
                      selectedForComparison.length >= 2
                        ? "bg-black hover:bg-gray-800 active:scale-95"
                        : "cursor-not-allowed bg-gray-400"
                    }`}
                  >
                    So sánh
                  </button>
                  <button
                    onClick={() => setSelectedForComparison([])}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
