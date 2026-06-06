import { create } from 'zustand';
import { storeApi } from '../api/store';
import { toast } from 'react-hot-toast';

interface WishlistStore {
  items: any[];
  loading: boolean;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  loading: false,

  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const data = await storeApi.getWishlist();
      set({ items: data });
    } catch (error) {
       console.error('Failed to fetch wishlist', error);
    } finally {
      set({ loading: false });
    }
  },

  addToWishlist: async (productId: string) => {
    try {
       await storeApi.addToWishlist(productId);
       await get().fetchWishlist();
       toast.success('Added to Wishlist');
    } catch (error) {
      toast.error('Failed to add to wishlist');
      console.error(error);
    }
  },

  removeFromWishlist: async (productId: string) => {
     try {
       await storeApi.removeFromWishlist(productId);
       set((state) => ({
         items: state.items.filter((item) => item.productId !== productId && item.product?.id !== productId)
       }));
       toast.success('Removed from Wishlist');
     } catch (error) {
       toast.error('Failed to remove from wishlist');
       console.error(error);
     }
  },

  isInWishlist: (productId: string) => {
    return get().items.some(item => item.productId === productId || item.product?.id === productId);
  }
}));
