"use client";

import { useContext } from "react";
import { CartContext } from "@/features/marketplace/stores/cart.store";

export function useCart() {
  const cart = useContext(CartContext);

  if (!cart) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return cart;
}
