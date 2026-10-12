"use client";

import { useCartStore } from "@/features/marketplace/stores/cart.store";

export function useCart() {
  return useCartStore();
}
