import React, { useState, useEffect } from "react";
import { mockCategories, mockProducts } from "../../../mockData/mockData";
import { getProductPriceInfo } from "../../../utils/helpers";
import ProductCard from "../../common/ProductCard";
import type { ProductResDto } from "../../../types";

type ProductsSectionProps = Record<string, never>;

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
    } // Sort products
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
    setDisplayedProducts(filteredProducts.slice(startIndex, endIndex));
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
  return (
    <section className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Sản phẩm{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Samsung
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Khám phá bộ sưu tập sản phẩm công nghệ tiên tiến với chất lượng
            vượt trội
          </p>
          <div className="mt-6 flex items-center justify-center space-x-2">
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
            <div className="h-1 w-6 rounded-full bg-gray-300"></div>
            <div className="h-1 w-6 rounded-full bg-gray-300"></div>
          </div>
        </div>        {/* Main Container */}
        <div className="flex flex-col space-y-8">
          {/* Stats & Filter Controls */}
          <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-white p-6 shadow-sm sm:flex-row sm:items-center">
            {/* Stats */}
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-gray-500">Tìm thấy</p>
              <p className="text-2xl font-bold text-gray-900">
                {displayedProducts.length}{" "}
                <span className="text-base font-normal text-gray-500">
                  sản phẩm
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
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Sắp xếp theo:
              </span>
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="appearance-none rounded-lg border border-gray-200 bg-white px-4 py-3 pr-10 font-medium text-gray-900 shadow-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="newest">🆕 Mới nhất</option>
                  <option value="price-asc">💰 Giá tăng dần</option>
                  <option value="price-desc">💎 Giá giảm dần</option>
                  <option value="popular">🔥 Phổ biến</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                  <svg
                    className="h-4 w-4 text-gray-400"
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
                </div>
              </div>
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
            </div>{" "}
            {/* Right Column - Products Grid */}
            <div className="lg:w-3/4">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSelected={selectedForComparison.includes(product.id)}
                    onComparisonToggle={handleComparisonToggle}
                    onAddToCart={handleAddToCart}
                    onLearnMore={handleLearnMore}
                    showComparisonCheckbox={true}
                  />
                ))}
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
