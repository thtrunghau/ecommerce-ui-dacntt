import { useQuery } from "@tanstack/react-query";
import { promotionApi } from "../services/apiService";
import type { PromotionResDto, ApiPageableResponse } from "../types/api";

interface UsePromotionsOptions {
  page?: number;
  pageSize?: number;
}

export function usePromotions(options: UsePromotionsOptions = {}) {
  const { page = 0, pageSize = 20 } = options;
  return useQuery<ApiPageableResponse<PromotionResDto>>({
    queryKey: ["promotions", { page, pageSize }],
    queryFn: () => promotionApi.getList({ page, pageSize }),
    staleTime: 10 * 60 * 1000, // 10 phút
    gcTime: 30 * 60 * 1000, // 30 phút
  });
}
