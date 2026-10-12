"use client";

import { CartProvider } from "@/features/marketplace/stores/cart.store";

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return <CartProvider>{children}</CartProvider>;
}
