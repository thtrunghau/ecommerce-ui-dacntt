import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductResDto, CategoryResDto, UUID, PaginationParams, ApiPageableResponse } from "../types/api";
import { mockProducts } from "../mockData/mockData";

// In a real app, we would call these API services
// import { productApi } from "../services/apiService";

interface ProductState {
  // State
  products: Record<UUID, ProductResDto>;
  allProductIds: UUID[];
  productsByCategory: Record<string, UUID[]>;
  recentlyViewed: UUID[];
  categories: CategoryResDto[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProducts: (params?: PaginationParams) => Promise<void>;
  fetchProductById: (id: UUID) => Promise<ProductResDto | null>;
  fetchByCategory: (categoryId: UUID) => Promise<void>;
  searchProducts: (query: string) => ProductResDto[];
  addRecentlyViewed: (productId: UUID) => void;
  clearCache: () => void;
}

const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      // Initial state
      products: {},
      allProductIds: [],
      productsByCategory: {},
      recentlyViewed: [],
      categories: [],
      isLoading: false,
      error: null,
      
      // Actions
      fetchProducts: async (params?: PaginationParams) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would call an API here
          // const response = await productApi.getList(params);
          
          // For mock data
          await new Promise((resolve) => setTimeout(resolve, 300));
          const productsList = mockProducts;
          
          // Create a normalized products object for faster lookups
          const productsById: Record<UUID, ProductResDto> = {};
          const productIds: UUID[] = [];
          const productsByCategory: Record<string, UUID[]> = {};
          
          productsList.forEach((product) => {
            productsById[product.id] = product;
            productIds.push(product.id);
            
            // Group by category
            const { categoryId } = product;
            if (!productsByCategory[categoryId]) {
              productsByCategory[categoryId] = [];
            }
            productsByCategory[categoryId].push(product.id);
          });
          
          set({
            products: productsById,
            allProductIds: productIds,
            productsByCategory,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to fetch products" 
          });
        }
      },
      
      fetchProductById: async (id: UUID) => {
        // Check if we already have this product cached
        const cachedProduct = get().products[id];
        if (cachedProduct) return cachedProduct;
        
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would call an API here
          // const product = await productApi.getById(id);
          
          // For mock data
          await new Promise((resolve) => setTimeout(resolve, 200));
          const product = mockProducts.find(p => p.id === id);
          
          if (!product) {
            throw new Error(`Product with ID ${id} not found`);
          }
          
          // Update our cache with this single product
          set((state) => ({
            products: { ...state.products, [id]: product },
            isLoading: false,
          }));
          
          return product;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to fetch product" 
          });
          return null;
        }
      },
      
      fetchByCategory: async (categoryId: UUID) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would call an API here
          // const response = await productApi.fetchByCategory(categoryId);
          
          // For mock data
          await new Promise((resolve) => setTimeout(resolve, 300));
          const productsInCategory = mockProducts.filter(
            product => product.categoryId === categoryId
          );
          
          // Create a normalized products object for faster lookups
          const productsById: Record<UUID, ProductResDto> = {};
          const productIds: UUID[] = [];
          
          productsInCategory.forEach((product) => {
            productsById[product.id] = product;
            productIds.push(product.id);
          });
          
          set((state) => ({
            products: { ...state.products, ...productsById },
            productsByCategory: {
              ...state.productsByCategory,
              [categoryId]: productIds,
            },
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to fetch products by category" 
          });
        }
      },
      
      searchProducts: (query: string) => {
        if (!query) return [];
        
        const normalizedQuery = query.toLowerCase().trim();
        const { products, allProductIds } = get();
        
        // Search through our cached products
        return allProductIds
          .map(id => products[id])
          .filter(product => {
            const productName = product.productName.toLowerCase();
            const description = product.description?.toLowerCase() || '';
            
            return (
              productName.includes(normalizedQuery) || 
              description.includes(normalizedQuery)
            );
          });
      },
      
      addRecentlyViewed: (productId: UUID) => {
        set((state) => {
          // Remove the product if it's already in the list
          const filteredList = state.recentlyViewed.filter(id => id !== productId);
          
          // Add the product to the beginning of the list
          const updatedList = [productId, ...filteredList];
          
          // Only keep the 10 most recent products
          const limitedList = updatedList.slice(0, 10);
          
          return { recentlyViewed: limitedList };
        });
      },
      
      clearCache: () => {
        set({ 
          products: {}, 
          allProductIds: [],
          productsByCategory: {},
          error: null,
          // Keep the recently viewed list
        });
      },
    }),
    {
      name: "product-storage", // unique name for localStorage
      partialize: (state) => ({ 
        // Only persist what's needed to avoid large localStorage
        products: state.products,
        recentlyViewed: state.recentlyViewed,
        // Don't persist loading state, errors, or full listings
      }),
    }
  )
);

export default useProductStore;
