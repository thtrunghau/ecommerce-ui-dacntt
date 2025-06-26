import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItemResDto, ProductResDto, UUID } from "../types/api";
import { cartApi } from "../services/apiService";
import useAuthStore from "./authStore";
import { useEffect, useRef } from "react";

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
  resetCart: () => void; // Hàm reset toàn bộ cart khi user đổi hoặc logout
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
          0,
        );
      },

      // Actions
      addItem: async (product: ProductResDto, quantity: number = 1) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated)
          throw new Error("Bạn cần đăng nhập để thêm vào giỏ hàng.");
        set({ isLoading: true, error: null });
        try {
          // Lấy cart hiện tại từ backend (nếu chưa có thì tạo mới)
          let cart = null;
          if (!get().id) {
            cart = await cartApi.create();
            set({ id: cart.id, accountId: cart.accountId });
          } else {
            cart = await cartApi.getById(get().id!);
          }
          // Gọi API cập nhật số lượng sản phẩm (delta = quantity)
          const updatedCart = await cartApi.updateItemQuantity({
            cartId: cart.id,
            productId: product.id,
            delta: quantity,
          });
          set({
            items: updatedCart.cartItems,
            id: updatedCart.id,
            accountId: updatedCart.accountId,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to add item to cart",
          });
          throw error;
        }
      },

      updateQuantity: async (itemId: UUID, quantity: number) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated)
          throw new Error("Bạn cần đăng nhập để cập nhật giỏ hàng.");
        set({ isLoading: true, error: null });
        try {
          // Tìm sản phẩm tương ứng trong items
          const item = get().items.find((i) => i.id === itemId);
          if (!item) throw new Error("Item not found");
          const delta = quantity - item.quantity;
          if (delta === 0) return;
          // Optimistic update local state
          set((state) => ({
            items: state.items.map((i) =>
              i.id === itemId ? { ...i, quantity } : i,
            ),
          }));
          // Gọi API cập nhật số lượng
          const updatedCart = await cartApi.updateItemQuantity({
            cartId: get().id!,
            productId: item.product.id,
            delta,
          });
          // Chỉ update lại nếu BE trả về khác biệt
          set((state) => {
            const isDiff =
              updatedCart.cartItems.length !== state.items.length ||
              updatedCart.cartItems.some(
                (beItem, idx) =>
                  beItem.id !== state.items[idx]?.id ||
                  beItem.quantity !== state.items[idx]?.quantity,
              );
            return isDiff
              ? {
                  items: updatedCart.cartItems,
                  id: updatedCart.id,
                  accountId: updatedCart.accountId,
                  isLoading: false,
                }
              : { isLoading: false };
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to update quantity",
          });
          throw error;
        }
      },

      removeItem: async (itemId: UUID) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated)
          throw new Error("Bạn cần đăng nhập để xóa sản phẩm khỏi giỏ hàng.");
        set({ isLoading: true, error: null });
        try {
          // Tìm sản phẩm tương ứng trong items
          const item = get().items.find((i) => i.id === itemId);
          if (!item) throw new Error("Item not found");
          // Gọi API cập nhật số lượng về 0 (delta = -item.quantity)
          const updatedCart = await cartApi.updateItemQuantity({
            cartId: get().id!,
            productId: item.product.id,
            delta: -item.quantity,
          });
          set({
            items: updatedCart.cartItems,
            id: updatedCart.id,
            accountId: updatedCart.accountId,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Failed to remove item",
          });
          throw error;
        }
      },

      clearCart: () => {
        set({
          items: [],
          id: null,
          accountId: null,
          error: null,
        });
      },
      // Hàm reset toàn bộ cart khi user đổi hoặc logout
      resetCart: () => {
        set({
          items: [],
          id: null,
          accountId: null,
          error: null,
        });
      },

      syncWithServer: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;
        set({ isLoading: true, error: null });
        try {
          // In a real app, we would fetch the cart from the API
          // const cart = await cartApi.getCart();

          // For mock data
          // await new Promise((resolve) => setTimeout(resolve, 500));
          // const cart = mockCartData;

          const cart = await cartApi.getCurrentCart();

          set({
            items: cart.cartItems,
            id: cart.id,
            accountId: cart.accountId,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to sync with server",
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
    },
  ),
);

// Hook để tự động reset/sync cart khi user đổi hoặc logout
export const useCartUserSync = () => {
  const { user, isAuthenticated } = useAuthStore();
  const cartStore = useCartStore();
  // Chỉ reset/sync cart khi userId thực sự thay đổi (không chạy lại khi chỉ re-mount component)
  const prevUserId = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (prevUserId.current !== user?.id || prevUserId.current === undefined) {
      cartStore.resetCart();
      if (isAuthenticated) {
        cartStore.syncWithServer();
      }
      prevUserId.current = user?.id;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAuthenticated]);
};

export default useCartStore;
