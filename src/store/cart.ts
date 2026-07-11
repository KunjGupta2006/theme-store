import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // ProductVariant.id — the real DB variant, never composited with anything else
  productId: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  color: string;
  size: string;
  price: number;
  quantity: number;
  customDesignId?: string;
  customDesignUrl?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, customDesignId?: string) => void;
  updateQuantity: (id: string, quantity: number, customDesignId?: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (item) =>
        set((state) => {
          // A cart line is "the same" only if it's the same variant AND the
          // same custom design (or both have no design at all). Comparing on
          // `id` here — not `variantId` — is the actual fix: every caller
          // (ProductOptions, ProductCard, DesignEditor) sets `id` to the real
          // ProductVariant.id, so this now genuinely distinguishes different
          // products/variants/designs instead of accidentally matching
          // everything via an always-undefined field.
          const existingIndex = state.items.findIndex(
            (i) => i.id === item.id && i.customDesignId === item.customDesignId
          );
          if (existingIndex !== -1) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + item.quantity,
            };
            return { items: updated };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (id, customDesignId) =>
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.customDesignId === customDesignId)),
        })),

      updateQuantity: (id, quantity, customDesignId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.customDesignId === customDesignId ? { ...i, quantity } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "cart-storage" }
  )
);