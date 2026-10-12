import Link from "next/link";
import { CartLink } from "@/components/layout/cart-link";

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
      >
        <Link className="font-semibold tracking-tight" href="/">
          Kodeva
        </Link>
        <div className="flex items-center gap-4 text-sm text-neutral-600 sm:gap-6">
          <Link
            className="inline-flex min-h-11 items-center hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            href="/blog"
          >
            Blog
          </Link>
          <Link
            className="inline-flex min-h-11 items-center hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            href="/marketplace"
          >
            Marketplace
          </Link>
          <CartLink />
        </div>
      </nav>
    </header>
  );
}
