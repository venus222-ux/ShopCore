import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "../types";

export interface CartItem extends Product {
  quantity: number;
  // Optional until the variant selector UI ships. Undefined = "use the
  // product's default variant" (resolved server-side in CheckoutController).
  variant_id?: number;
}

interface CartState {
  items: CartItem[];

  addToCart: (product: Product, variantId?: number) => void;
  removeFromCart: (productId: number, variantId?: number) => void;
  increaseQty: (productId: number, variantId?: number) => void;
  decreaseQty: (productId: number, variantId?: number) => void;
  clearCart: () => void;
}

// Two lines match if they're the same product AND the same variant
// (undefined variant_id only matches undefined - i.e. both "default").
const sameLine = (item: CartItem, productId: number, variantId?: number) =>
  item.id === productId && item.variant_id === variantId;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product, variantId) => {
        const items = get().items;
        const existing = items.find((i) => sameLine(i, product.id, variantId));

        if (existing) {
          set({
            items: items.map((i) =>
              sameLine(i, product.id, variantId)
                ? { ...i, quantity: i.quantity + 1 }
                : i,
            ),
          });
        } else {
          set({
            items: [...items, { ...product, variant_id: variantId, quantity: 1 }],
          });
        }
      },

      removeFromCart: (id, variantId) =>
        set({
          items: get().items.filter((i) => !sameLine(i, id, variantId)),
        }),

      increaseQty: (id, variantId) =>
        set({
          items: get().items.map((i) =>
            sameLine(i, id, variantId) ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        }),

      decreaseQty: (id, variantId) =>
        set({
          items: get()
            .items.map((i) =>
              sameLine(i, id, variantId) ? { ...i, quantity: i.quantity - 1 } : i,
            )
            .filter((i) => i.quantity > 0),
        }),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
    },
  ),
);