import { useQuery } from "@tanstack/react-query";
import { productApi } from "../services/apiService";
import type { ProductResDto, ApiPageableResponse } from "../types/api";

interface UseProductsOptions {
  page?: number;
  size?: number;
  sort?: string | string[];
  filter?: string[];
}

export function useProducts(options: UseProductsOptions = {}) {
  const { page = 0, size = 10, sort, filter } = options;
  // Đảm bảo sort là mảng string[] nếu có
  const sortArr = sort ? (Array.isArray(sort) ? sort : [sort]) : undefined;
  return useQuery<ApiPageableResponse<ProductResDto>>({
    queryKey: ["products", { page, size, sort: sortArr, filter }],
    queryFn: () =>
      productApi.getList({
        page,
        size,
        sort: sortArr,
        filter,
      }),
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  });
}
