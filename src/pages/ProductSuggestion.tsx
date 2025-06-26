import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ProductCard from "../components/common/ProductCard";
import type { ProductResDto } from "../types";
import { productApi } from "../services/apiService";

interface ProductSuggestionProps {
  productId: string;
}

const ProductSuggestion: React.FC<ProductSuggestionProps> = ({ productId }) => {
  const [products, setProducts] = useState<ProductResDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <div>Đang tải gợi ý sản phẩm...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!products.length) return null;

  return (
    <section className="my-12">
      <h3 className="mb-6 text-2xl font-bold text-gray-900">
        Sản phẩm liên quan
      </h3>
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={24}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
        className="!pb-10"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default ProductSuggestion;
