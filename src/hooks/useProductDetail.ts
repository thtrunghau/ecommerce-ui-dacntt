import { useQuery } from "@tanstack/react-query";
import { productApi } from "../services/apiService";
import type { ProductResDto } from "../types/api";

export function useProductDetail(id: string | undefined) {
  return useQuery<ProductResDto>({
    queryKey: ["product", id],
    queryFn: () => (id ? productApi.getById(id) : Promise.reject("No id")),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  });
}
