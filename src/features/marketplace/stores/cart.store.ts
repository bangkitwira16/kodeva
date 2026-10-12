"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  CartItem,
  BillingPeriod,
  Product,
  ProductPackage,
} from "@/features/marketplace/types/product";
import { getCartPricing } from "@/features/marketplace/services/cart-pricing";
import { normalizeVoucherCode, validateVoucher } from "@/features/marketplace/services/vouchers";

type CartState = {
  items: CartItem[];
  appliedVoucherCode: string | null;
  voucherRedemptionCounts: Record<string, number>;
  hasHydrated: boolean;
  addItem: (
    product: Product,
    selectedPackage: ProductPackage,
    billingPeriod?: BillingPeriod,
  ) => { success: boolean; message?: string };
  setQuantity: (
    productId: string,
    packageId: string,
    quantity: number,
    billingPeriod?: BillingPeriod,
  ) => { success: boolean; message?: string };
  removeItem: (
    productId: string,
    packageId: string,
    billingPeriod?: BillingPeriod,
  ) => void;
  applyVoucher: (code: string) => { success: boolean; message: string };
  removeVoucher: () => void;
  redeemAppliedVoucher: () => boolean;
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
      appliedVoucherCode: null,
      voucherRedemptionCounts: {},
      hasHydrated: false,
      addItem: (product, selectedPackage, billingPeriod = "monthly") => {
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
            item.selectedPackage.id === selectedPackage.id &&
            (item.billingPeriod ?? "monthly") === billingPeriod,
        );
        set({
          items: existing
            ? items.map((item) =>
                item.product.id === product.id &&
                item.selectedPackage.id === selectedPackage.id &&
                (item.billingPeriod ?? "monthly") === billingPeriod
                  ? { ...item, quantity: item.quantity + 1, product }
                  : item,
              )
            : [...items, { product, selectedPackage, quantity: 1, billingPeriod }],
        });
        return { success: true };
      },
      setQuantity: (productId, packageId, quantity, billingPeriod = "monthly") => {
        const items = get().items;
        const item = items.find(
          (candidate) =>
            candidate.product.id === productId &&
            candidate.selectedPackage.id === packageId &&
            (candidate.billingPeriod ?? "monthly") === billingPeriod,
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
            candidate.selectedPackage.id === packageId &&
            (candidate.billingPeriod ?? "monthly") === billingPeriod
              ? { ...candidate, quantity }
              : candidate,
          ),
        });
        return { success: true };
      },
      removeItem: (productId, packageId, billingPeriod = "monthly") =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              item.product.id !== productId ||
              item.selectedPackage.id !== packageId ||
              (item.billingPeriod ?? "monthly") !== billingPeriod,
          ),
        })),
      applyVoucher: (code) => {
        const normalizedCode = normalizeVoucherCode(code);
        const state = get();
        const subtotalInCents = getCartPricing(state.items).subtotalInCents;
        const validation = validateVoucher(
          normalizedCode,
          subtotalInCents,
          state.voucherRedemptionCounts[normalizedCode] ?? 0,
        );
        if (!validation.valid) {
          return { success: false, message: validation.message };
        }

        set({ appliedVoucherCode: validation.voucher.code });
        return {
          success: true,
          message: `${validation.voucher.code} applied successfully.`,
        };
      },
      removeVoucher: () => set({ appliedVoucherCode: null }),
      redeemAppliedVoucher: () => {
        const { appliedVoucherCode, voucherRedemptionCounts, items } = get();
        if (!appliedVoucherCode) return false;

        const pricing = getCartPricing(items, appliedVoucherCode, voucherRedemptionCounts);
        if (pricing.voucherValidation?.valid !== true) {
          return false;
        }

        set({
          voucherRedemptionCounts: {
            ...voucherRedemptionCounts,
            [appliedVoucherCode]:
              (voucherRedemptionCounts[appliedVoucherCode] ?? 0) + 1,
          },
          appliedVoucherCode: null,
        });
        return true;
      },
      clear: () => set({ items: [], appliedVoucherCode: null }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "kodeva-marketplace-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        items: state.items,
        appliedVoucherCode: state.appliedVoucherCode,
        voucherRedemptionCounts: state.voucherRedemptionCounts,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
