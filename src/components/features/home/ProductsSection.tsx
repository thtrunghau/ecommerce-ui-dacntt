import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { getAllApplicablePromotions } from "../../../utils/helpers";
import EnhancedProductCard from "../../common/EnhancedProductCard";
import ProductCardSkeleton from "../../common/ProductCardSkeleton";
import ErrorState from "../../common/ErrorState";
// import AdvancedFilters from "./AdvancedFilters"; // Removed
import type { ProductResDto } from "../../../types";
import useCartStore from "../../../store/cartStore";
import toast from "react-hot-toast";
import { useProducts } from "../../../hooks/useProducts";
import { useCategories } from "../../../hooks/useCategories";
import { usePromotions } from "../../../hooks/usePromotions";

type ProductsSectionProps = Record<string, never>;

type SortOption = "newest" | "price-asc" | "price-desc" | "popular";

const ProductsSection: React.FC<ProductsSectionProps> = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  // Chỉ lấy action cần thiết từ store để tránh re-render toàn bộ section khi cart thay đổi
  const addItem = useCartStore((state) => state.addItem);

  // State cho filter promotion
  const [promotionProductIds, setPromotionProductIds] = useState<
    string[] | undefined
  >(undefined);

  // URL PARAMETER ANALYSIS - Log incoming navigation data
  useEffect(() => {
    console.group("🎯 PRODUCTS SECTION - URL PARAMETER ANALYSIS");
    console.log("📍 Current Location:", {
      pathname: location.pathname,
      search: location.search,
      full_url: `${location.pathname}${location.search}`,
    });

    const categoryParam = searchParams.get("category");
    const promotionParam = searchParams.get("promotion");

    console.log("🔗 URL Parameters Received:", {
      category: categoryParam,
      promotion: promotionParam,
      raw_search_params: location.search,
      expected_behavior: categoryParam
        ? `Filter by category: ${categoryParam}`
        : promotionParam
          ? "Show promoted products"
          : "Show all products",
    });

    // Apply URL parameters to component state
    if (promotionParam === "true") {
      console.log(
        "🎉 PROMOTION FILTER APPLIED - Filtering products with active promotions",
      );
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

  // React Query: fetch promotions khi filter promotion
  const {
    data: promotionsData,
    isLoading: isPromotionsLoading,
    isError: isPromotionsError,
    error: promotionsError,
    refetch: refetchPromotions,
  } = usePromotions({ page: 0, pageSize: 50 }); // lấy tối đa 50 promotion, có thể tăng nếu cần

  // Khi chọn filter promotion, lấy productIds từ promotions
  useEffect(() => {
    if (selectedCategory === "promotion" && promotionsData) {
      const ids = promotionsData.data
        .flatMap((promo) => promo.productIds)
        .filter((id): id is string => !!id);
      setPromotionProductIds(ids.length > 0 ? ids : ["-1"]);
    } else {
      setPromotionProductIds(undefined);
    }
  }, [selectedCategory, promotionsData]);

  // React Query: fetch products
  // Luôn fetch toàn bộ sản phẩm, không truyền filter khi chọn category
  const {
    data: productsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts({
    page: 0,
    size: 1000, // hoặc số lớn hơn tổng sản phẩm dự kiến
  });
  const allProducts = React.useMemo(
    () => productsData?.data || [],
    [productsData],
  );

  // Advanced filtering with variant-aware search
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Filter by category first
    if (selectedCategory === "promotion") {
      if (promotionProductIds && promotionProductIds.length > 0) {
        filtered = filtered.filter((product) =>
          promotionProductIds.includes(product.id),
        );
      }
    } else if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.categoryId === selectedCategory,
      );
    }

    return filtered;
  }, [allProducts, selectedCategory, promotionProductIds]);

  // Sort FE cho filteredProducts
  const [sortedProducts, setSortedProducts] = useState<ProductResDto[]>([]);

  useEffect(() => {
    const sorted = [...filteredProducts];
    switch (sortOption) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        // Nếu không có soldQuantity, dùng quantity làm ví dụ
        sorted.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
        break;
      case "newest":
      default:
        sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        break;
    }
    setSortedProducts(sorted);
  }, [filteredProducts, sortOption]);

  // Đếm số lượng sản phẩm theo từng category ở FE
  const getCategoryProductCount = (categoryId: string) =>
    allProducts.filter((product) => product.categoryId === categoryId).length;

  // Không filter/sort client-side nữa, chỉ hiển thị đúng data backend trả về
  const displayedProducts = sortedProducts;

  const handleLoadMore = () => {
    // Xóa logic phân trang không còn dùng đến
  };

  const handleAddToCart = async (product: ProductResDto) => {
    try {
      await addItem(product, 1);
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (err) {
      toast.error((err as Error)?.message || "Thêm vào giỏ hàng thất bại!");
    }
  };
  const handleLearnMore = (product: ProductResDto) => {
    // TODO: Navigate to product detail page
    console.log("Learn more:", product.productName);
  };

  const hasMoreProducts = () => {
    let filteredProducts = [...allProducts];
    if (selectedCategory === "promotion") {
      filteredProducts = filteredProducts.filter((product) => {
        const applicablePromotions = getAllApplicablePromotions(product.id);
        return applicablePromotions.length > 0;
      });
    } else if (selectedCategory !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.categoryId === selectedCategory,
      );
    }
    return filteredProducts.length > displayedProducts.length;
  };

  // Calculate total filtered products count for stats display
  const getTotalFilteredCount = () => {
    let filteredProducts = [...allProducts];
    if (selectedCategory === "promotion") {
      filteredProducts = filteredProducts.filter((product) => {
        const applicablePromotions = getAllApplicablePromotions(product.id);
        return applicablePromotions.length > 0;
      });
    } else if (selectedCategory !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.categoryId === selectedCategory,
      );
    }
    return filteredProducts.length;
  };
  // React Query: fetch categories
  const { data: categoriesData } = useCategories({ page: 0, pageSize: 20 });
  const categories = categoriesData?.data || [];

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
                        categories.find((c) => c.id === selectedCategory)
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
            {/* Left Column - Categories only */}
            <div className="flex flex-col gap-6 lg:w-1/4">
              <div className="rounded-xl bg-white p-6 shadow-sm">
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
                    className={`group w-full rounded-full px-4 py-3 text-left transition-all duration-200 ${
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
                  {categories.map((category) => {
                    const categoryProductCount = getCategoryProductCount(
                      category.id,
                    );

                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`group w-full rounded-full px-4 py-3 text-left transition-all duration-200 ${
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
              {isLoading ||
              (selectedCategory === "promotion" && isPromotionsLoading) ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : isError ||
                (selectedCategory === "promotion" && isPromotionsError) ? (
                <ErrorState
                  message={
                    error?.message ||
                    promotionsError?.message ||
                    "Lỗi tải sản phẩm"
                  }
                  onRetry={
                    selectedCategory === "promotion"
                      ? refetchPromotions
                      : refetch
                  }
                />
              ) : displayedProducts.length > 0 ? (
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
                        <EnhancedProductCard
                          product={product}
                          allProducts={allProducts}
                          promotions={promotionsData?.data || []}
                          onAddToCart={handleAddToCart}
                          onLearnMore={handleLearnMore}
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
                <ErrorState
                  message="Không tìm thấy sản phẩm phù hợp với bộ lọc của bạn. Hãy thử chọn danh mục khác."
                  className="min-h-[300px] rounded-xl bg-white p-12 shadow-sm"
                  onRetry={() => setSelectedCategory("all")}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
