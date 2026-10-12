import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Browse the Kodeva marketplace.",
};

export default function MarketplacePage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Marketplace</h1>
      <p className="mt-4 leading-7 text-neutral-600">
        Product listings will be supplied by the marketplace catalog service.
      </p>
    </section>
  );
}
