import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { CartItemResDto, ProductResDto, UUID } from "../types/api";
import { mockCartData } from "../mockData/cartData";

// In a real app, we would call these API services
// import { cartApi } from "../services/apiService";

interface CartState {
  // State
  items: CartItemResDto[];
  id: UUID | null;
  accountId: UUID | null;
  isLoading: boolean;
  error: string | null;
  
  // Computed values
  totalItems: number;
  totalPrice: number;
  
  // Actions
  addItem: (product: ProductResDto, quantity: number) => Promise<void>;
  updateQuantity: (itemId: UUID, quantity: number) => Promise<void>;
  removeItem: (itemId: UUID) => Promise<void>;
  clearCart: () => void;
  syncWithServer: () => Promise<void>;
}

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      id: null,
      accountId: null,
      isLoading: false,
      error: null,
      
      // Computed getters
      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
      
      get totalPrice() {
        return get().items.reduce(
          (sum, item) => sum + item.productPrice * item.quantity, 
          0
        );
      },
      
      // Actions
      addItem: async (product: ProductResDto, quantity: number = 1) => {
        set({ isLoading: true, error: null });
        
        try {
          // Find if item already exists in cart
          const currentItems = get().items;
          const existingItem = currentItems.find(
            (item) => item.product.id === product.id
          );
          
          // If item exists, update quantity instead
          if (existingItem) {
            return get().updateQuantity(existingItem.id, existingItem.quantity + quantity);
          }
          
          // In a real app, we would call an API here
          // await cartApi.addItem({...})
          
          // Optimistically update the UI
          const newItem: CartItemResDto = {
            id: uuidv4(),
            productPrice: product.price,
            quantity: quantity,
            cartId: get().id || uuidv4(),
            product,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set((state) => ({
            items: [...state.items, newItem],
            id: state.id || newItem.cartId, // Ensure we have a cart ID
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to add item to cart" 
          });
        }
      },
      
      updateQuantity: async (itemId: UUID, quantity: number) => {
        if (quantity < 1) {
          return get().removeItem(itemId);
        }
        
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would call an API here
          // await cartApi.updateQuantity({...})
          
          // Optimistically update the UI
          set((state) => ({
            items: state.items.map((item) => 
              item.id === itemId 
                ? { ...item, quantity, updatedAt: new Date().toISOString() } 
                : item
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to update quantity" 
          });
        }
      },
      
      removeItem: async (itemId: UUID) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would call an API here
          // await cartApi.removeItem(itemId)
          
          // Optimistically update the UI
          set((state) => ({
            items: state.items.filter((item) => item.id !== itemId),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to remove item" 
          });
        }
      },
      
      clearCart: () => {
        set({ 
          items: [], 
          error: null,
          // Keep the cart ID and account ID for future use
        });
      },
      
      syncWithServer: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would fetch the cart from the API
          // const cart = await cartApi.getCart();
          
          // For mock data
          await new Promise((resolve) => setTimeout(resolve, 500));
          const cart = mockCartData;
          
          set({
            items: cart.cartItems,
            id: cart.id,
            accountId: cart.accountId,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to sync with server" 
          });
        }
      },
    }),
    {
      name: "cart-storage", // unique name for localStorage
      partialize: (state) => ({ 
        items: state.items,
        id: state.id,
        accountId: state.accountId,
        // Don't persist loading state or errors
      }),
    }
  )
);

export default useCartStore;
