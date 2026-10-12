import type { Product } from "@/features/marketplace/types/product";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="rounded-2xl border border-neutral-200 p-6">
      <div
        aria-label={product.name}
        className="mb-5 aspect-square rounded-xl bg-neutral-100"
        role="img"
      />
      <h2 className="font-semibold">{product.name}</h2>
      <p className="mt-2 text-sm leading-6 text-neutral-600">
        {product.description}
      </p>
      <p className="mt-4 font-medium">
        {(product.priceInCents / 100).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}
      </p>
    </article>
  );
}
