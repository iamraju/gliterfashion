import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storeApi } from '../api/store';
import { v4 as uuidv4 } from 'uuid';

interface CartState {
  cart: any | null;
  sessionId: string;
  loading: boolean;
  totalItems: number;
  
  initCart: () => Promise<void>;
  addItem: (variantId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      sessionId: uuidv4(),
      loading: false,
      totalItems: 0,

      initCart: async () => {
        const { sessionId } = get();
        try {
          set({ loading: true });
          const cart = await storeApi.getCart(sessionId);
          const totalItems = cart.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
          set({ cart, totalItems, loading: false });
        } catch (error) {
          console.error('Failed to init cart:', error);
          set({ loading: false });
        }
      },

      addItem: async (variantId: string, quantity: number) => {
        const { sessionId } = get();
        try {
          set({ loading: true });
          await storeApi.addCartItem({ variantId, quantity, sessionId });
          // Re-fetch cart to stay in sync
          const cart = await storeApi.getCart(sessionId);
          const totalItems = cart.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
          set({ cart, totalItems, loading: false });
        } catch (error) {
          console.error('Failed to add item:', error);
          set({ loading: false });
        }
      },

      updateQuantity: async (itemId: string, quantity: number) => {
        const { sessionId } = get();
        try {
          await storeApi.updateCartItem(itemId, quantity);
          const cart = await storeApi.getCart(sessionId);
          const totalItems = cart.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
          set({ cart, totalItems });
        } catch (error) {
          console.error('Failed to update quantity:', error);
        }
      },

      removeItem: async (itemId: string) => {
        const { sessionId } = get();
        try {
          await storeApi.removeCartItem(itemId);
          const cart = await storeApi.getCart(sessionId);
          const totalItems = cart.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
          set({ cart, totalItems });
        } catch (error) {
          console.error('Failed to remove item:', error);
        }
      },

      applyCoupon: async (code: string) => {
        const { sessionId } = get();
        try {
          set({ loading: true });
          await storeApi.applyCoupon({ code, sessionId });
          const cart = await storeApi.getCart(sessionId);
          set({ cart, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      removeCoupon: async () => {
        const { sessionId } = get();
        try {
          set({ loading: true });
          await storeApi.removeCoupon(sessionId);
          const cart = await storeApi.getCart(sessionId);
          set({ cart, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      clearCart: () => {
        set({ cart: null, totalItems: 0 });
      }
    }),
    {
      name: 'glitter-cart-storage',
      partialize: (state) => ({ sessionId: state.sessionId }), // Only persist sessionId
    }
  )
);
