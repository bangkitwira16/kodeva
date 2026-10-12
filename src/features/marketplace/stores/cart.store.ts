"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  CartItem,
  Product,
  ProductPackage,
} from "@/features/marketplace/types/product";

type CartState = {
  items: CartItem[];
  hasHydrated: boolean;
  addItem: (
    product: Product,
    selectedPackage: ProductPackage,
  ) => { success: boolean; message?: string };
  setQuantity: (
    productId: string,
    packageId: string,
    quantity: number,
  ) => { success: boolean; message?: string };
  removeItem: (productId: string, packageId: string) => void;
  clear: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

function aggregateProductQuantity(items: CartItem[], productId: string) {
  return items
    .filter(({ product }) => product.id === productId)
    .reduce((total, item) => total + item.quantity, 0);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      addItem: (product, selectedPackage) => {
        const items = get().items;
        if (
          aggregateProductQuantity(items, product.id) >=
          product.remainingLicenses
        ) {
          return {
            success: false,
            message: `Only ${product.remainingLicenses} licenses are currently available.`,
          };
        }

        const existing = items.find(
          (item) =>
            item.product.id === product.id &&
            item.selectedPackage.id === selectedPackage.id,
        );
        set({
          items: existing
            ? items.map((item) =>
                item.product.id === product.id &&
                item.selectedPackage.id === selectedPackage.id
                  ? { ...item, quantity: item.quantity + 1, product }
                  : item,
              )
            : [...items, { product, selectedPackage, quantity: 1 }],
        });
        return { success: true };
      },
      setQuantity: (productId, packageId, quantity) => {
        const items = get().items;
        const item = items.find(
          (candidate) =>
            candidate.product.id === productId &&
            candidate.selectedPackage.id === packageId,
        );
        if (!item || quantity < 1 || !Number.isInteger(quantity)) {
          return { success: false, message: "Enter a valid license quantity." };
        }
        const otherPackageQuantity =
          aggregateProductQuantity(items, productId) - item.quantity;
        const maximum = Math.max(
          0,
          item.product.remainingLicenses - otherPackageQuantity,
        );
        if (quantity > maximum && quantity >= item.quantity) {
          return {
            success: false,
            message: `Across all packages, you can select up to ${maximum} more license${maximum === 1 ? "" : "s"}.`,
          };
        }

        set({
          items: items.map((candidate) =>
            candidate.product.id === productId &&
            candidate.selectedPackage.id === packageId
              ? { ...candidate, quantity }
              : candidate,
          ),
        });
        return { success: true };
      },
      removeItem: (productId, packageId) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              item.product.id !== productId ||
              item.selectedPackage.id !== packageId,
          ),
        })),
      clear: () => set({ items: [] }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "kodeva-marketplace-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
