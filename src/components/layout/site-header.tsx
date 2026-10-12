import Link from "next/link";

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
        <div className="flex items-center gap-6 text-sm text-neutral-600">
          <Link href="/blog">Blog</Link>
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/cart">Cart</Link>
        </div>
      </nav>
    </header>
  );
}
