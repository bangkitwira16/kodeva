"use client";

import Link from "next/link";
import { useCartStore } from "@/features/marketplace/stores/cart.store";

export function CartLink() {
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const itemCount = hasHydrated
    ? items.reduce((total, item) => total + item.quantity, 0)
    : 0;
  const accessibleLabel = `Cart, ${itemCount} ${
    itemCount === 1 ? "item" : "items"
  }`;

  return (
    <Link
      aria-label={accessibleLabel}
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
      href="/cart"
    >
      <svg
        aria-hidden="true"
        className="size-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M3.5 4.5h2l2.2 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4l1.8-6.3H6.4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
        <circle cx="10.2" cy="19.3" r="1.2" fill="currentColor" />
        <circle cx="17.1" cy="19.3" r="1.2" fill="currentColor" />
      </svg>
      <span
        aria-hidden="true"
        className="absolute right-0.5 top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1 text-[11px] font-bold leading-none text-white"
      >
        {itemCount > 99 ? "99+" : itemCount}
      </span>
    </Link>
  );
}
