// store/useWishlistStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "../types";

interface WishlistState {
  items: Product[];

  toggleWishlist: (product: Product) => void;

  removeFromWishlist: (id: number) => void;

  isWishlisted: (id: number) => boolean;

  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (product) => {
        const exists = get().items.some((i) => i.id === product.id);

        if (exists) {
          set({
            items: get().items.filter((i) => i.id !== product.id),
          });
        } else {
          set({
            items: [...get().items, product],
          });
        }
      },

      removeFromWishlist: (id) =>
        set({
          items: get().items.filter((i) => i.id !== id),
        }),

      isWishlisted: (id) => get().items.some((i) => i.id === id),

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "wishlist-storage",
    },
  ),
);
