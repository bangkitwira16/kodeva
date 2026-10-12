"use client";

import { useEffect, type ReactNode } from "react";
import { UtmProvider } from "@/features/attribution/utm-provider";
import { useCartStore } from "@/features/marketplace/stores/cart.store";

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  return <UtmProvider>{children}</UtmProvider>;
}
