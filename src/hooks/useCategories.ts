import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "../services/apiService";
import type { CategoryResDto, ApiPageableResponse } from "../types/api";

interface UseCategoriesOptions {
  page?: number;
  pageSize?: number;
}

export function useCategories(options: UseCategoriesOptions = {}) {
  const { page = 0, pageSize = 20 } = options;
  return useQuery<ApiPageableResponse<CategoryResDto>>({
    queryKey: ["categories", { page, pageSize }],
    queryFn: () => categoryApi.getList({ page, pageSize }),
    staleTime: 30 * 60 * 1000, // 30 phút
    gcTime: 60 * 60 * 1000, // 1 tiếng
  });
}
