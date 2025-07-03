import React, { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import EnhancedProductCard from "../components/common/EnhancedProductCard";
import type { ProductResDto } from "../types";
import { productApi } from "../services/apiService";
import { promotionApi } from "../services/apiService";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useProducts } from "../hooks/useProducts";
import toast from "react-hot-toast";

interface ProductSuggestionProps {
  productId: string;
}

const ProductSuggestion: React.FC<ProductSuggestionProps> = ({ productId }) => {
  const [products, setProducts] = useState<ProductResDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Embla Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 640px)": { slidesToScroll: 2 },
      "(min-width: 1024px)": { slidesToScroll: 3 },
    },
  });

  // Navigation handlers
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Lấy promotion từ API
  const { data: promotionPage } = useQuery({
    queryKey: ["promotions"],
    queryFn: () => promotionApi.getList(),
  });
  const allPromotions = promotionPage?.data || [];

  // Lấy tất cả sản phẩm để tìm variants
  const { data: allProductsData } = useProducts();
  const allProducts = allProductsData?.data || [];

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    productApi
      .getSimilar(productId)
      .then((data) => setProducts(data))
      .catch((err) => setError(err?.message || "Lỗi tải sản phẩm liên quan"))
      .finally(() => setLoading(false));
  }, [productId]);

  const addItem = useCartStore((state) => state.addItem);
  const { isAuthenticated } = useAuthStore();

  const handleAddToCart = async (product: ProductResDto) => {
    if (!isAuthenticated) {
      toast.error("Đăng nhập để thao tác");
      return;
    }
    try {
      await addItem(product, 1);
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (err: unknown) {
      let message = "Thêm vào giỏ hàng thất bại";
      if (err instanceof Error) message = err.message;
      toast.error(message);
    }
  };

  if (loading) return <div>Đang tải gợi ý sản phẩm...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!products.length) return null;

  return (
    <section className="my-12">
      <h3 className="mb-6 text-2xl font-bold text-gray-900">
        Sản phẩm liên quan
      </h3>

      <div className="relative">
        {/* Navigation Buttons */}
        <button
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg hover:bg-gray-50 disabled:opacity-50"
          onClick={scrollPrev}
          aria-label="Previous products"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        <button
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg hover:bg-gray-50 disabled:opacity-50"
          onClick={scrollNext}
          aria-label="Next products"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>

        {/* Embla Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]"
              >
                <EnhancedProductCard
                  product={product}
                  allProducts={allProducts}
                  promotions={allPromotions}
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSuggestion;
