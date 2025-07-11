import React, { useEffect, useState } from "react";
import type { CategoryResDto, ProductResDto } from "../../types";
import { Link } from "react-router-dom";
import {
  getAllApplicablePromotions,
  getProductPriceInfo,
  formattedPrice,
} from "../../utils/helpers";
import { useQuery } from "@tanstack/react-query";
import { promotionApi } from "../../services/apiService";
import { getProductImageUrl } from "../../utils/imageUtils";

interface NavDropdownProps {
  category: CategoryResDto & { fetchProducts?: () => Promise<ProductResDto[]> };
}

const NavDropdown: React.FC<NavDropdownProps> = ({ category }) => {
  const [products, setProducts] = useState<ProductResDto[]>([]);
  const [loading, setLoading] = useState(false);

  console.log(`NavDropdown received category:`, {
    id: category.id,
    name: category.categoryName,
    hasFetchProducts: !!category.fetchProducts,
    hasProducts: !!(category.products && category.products.length > 0),
  });

  // Fetch promotions từ API
  const { data: promotionsData } = useQuery({
    queryKey: ["promotions"],
    queryFn: () => promotionApi.getList({ page: 0, size: 50 }),
  });
  const promotions = promotionsData?.data || [];

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        // Nếu có hàm fetchProducts được truyền từ category (cho API) thì dùng nó
        if (category.fetchProducts) {
          const fetchedProducts = await category.fetchProducts();
          console.log(
            `NavDropdown fetchProducts returned ${fetchedProducts.length} products for category ${category.categoryName}`,
          );

          // Additional validation to ensure products match the category
          if (category.id !== "promo") {
            // For regular categories (not promotions), double check category matches
            const validProducts = fetchedProducts.filter(
              (product) => product.categoryId === category.id,
            );

            if (validProducts.length !== fetchedProducts.length) {
              console.warn(
                `Category mismatch! ${
                  fetchedProducts.length - validProducts.length
                } products did not match category ${category.categoryName}`,
              );
            }

            // Chỉ hiển thị tối đa 8 sản phẩm trong dropdown
            setProducts(validProducts.slice(0, 8));
          } else {
            // For promotions, use as-is but limit to 8 products
            setProducts(fetchedProducts.slice(0, 8));
          }

          // Log first product details for debugging
          if (fetchedProducts.length > 0) {
            console.log(
              `First product: ${fetchedProducts[0].productName}, categoryId: ${fetchedProducts[0].categoryId}`,
            );
          }
        }
        // Nếu đã có sẵn products trong category (cho mockData) thì dùng nó
        else if (category.products && category.products.length > 0) {
          console.log(
            `NavDropdown using ${category.products.length} existing products for category ${category.categoryName}`,
          );
          setProducts(category.products);
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm cho dropdown:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category]);

  return (
    <div className="animate-fadeIn absolute left-1/2 top-full z-50 mt-1 w-[900px] -translate-x-1/2 rounded-xl border border-gray-100 bg-white shadow-xl">
      {/* Invisible hover area at the top */}
      <div className="absolute left-0 top-[-12px] h-4 w-full bg-transparent" />
      <div className="px-8 py-6">
        <h3 className="mb-6 text-lg font-bold text-gray-800">
          {category.categoryName === "Ưu Đãi"
            ? "Sản phẩm ưu đãi"
            : `Sản phẩm ${category.categoryName}`}
          {products.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              (Hiển thị tối đa 8)
            </span>
          )}
        </h3>

        {loading ? (
          // Loading skeleton
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-gray-50 p-4">
                <div className="mb-3 h-24 w-32 rounded-lg bg-gray-200"></div>
                <div className="h-4 w-20 rounded bg-gray-200"></div>
                <div className="mt-2 h-3 w-16 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-4 gap-6">
            {products.map((product: ProductResDto) => {
              // Kiểm tra xem sản phẩm có promotion không, đảm bảo truyền đúng promotions array
              const applicablePromotions = getAllApplicablePromotions(
                product.id,
                promotions,
              );
              const hasPromotion = applicablePromotions.length > 0;
              // Gán giá trị mặc định cho priceInfo để tránh lỗi khi promotions chưa sẵn sàng
              const priceInfo = getProductPriceInfo(
                product.id,
                product.price,
                promotions,
              );

              return (
                <Link
                  to={`/products/${product.id}`}
                  key={product.id}
                  className="group flex flex-col items-center rounded-xl bg-gray-50 p-4 transition-shadow hover:shadow-lg"
                >
                  <div className="relative mb-3 flex h-24 w-32 items-center justify-center overflow-hidden rounded-lg bg-white">
                    <img
                      src={getProductImageUrl(product.image)}
                      alt={product.productName}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/products/placeholder.png";
                      }}
                      className="max-h-full max-w-full object-contain"
                    />
                    {/* Sale Badge */}
                    {hasPromotion && (
                      <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                        SALE
                      </span>
                    )}
                    {/* New Badge - chỉ hiển thị khi không có promotion để tránh overlap */}
                    {product.isNew && !hasPromotion && (
                      <span className="absolute left-2 top-2 rounded bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                        MỚI
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <span className="line-clamp-2 text-[15px] font-medium text-gray-900">
                      {product.productName}
                    </span>
                    {/* Price Information */}
                    <div className="mt-1">
                      {hasPromotion && priceInfo?.hasActivePromotion ? (
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-red-600">
                            {formattedPrice(priceInfo.finalPrice)}
                          </span>
                          <span className="text-xs text-gray-500 line-through">
                            {formattedPrice(product.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-gray-800">
                          {formattedPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500">
            Không có sản phẩm nổi bật trong danh mục này.
          </div>
        )}
      </div>
    </div>
  );
};

export default NavDropdown;
