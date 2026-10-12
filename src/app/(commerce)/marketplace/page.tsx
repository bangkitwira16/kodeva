import type { Metadata } from "next";
import { Suspense } from "react";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { ProductCatalogView } from "@/features/marketplace/components/product-catalog-view";
import { getMarketplaceProducts } from "../../../../sanity/lib/queries";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Browse the Kodeva marketplace.",
};

export const revalidate = 60;

export default async function MarketplacePage() {
  const products = await getMarketplaceProducts();

  return (
    <SectionWrapper
      description="Browse practical digital tools and choose the license package that fits."
      heading="Marketplace"
      headingLevel="h1"
      variant="features"
    >
      <Suspense
        fallback={
          <p aria-live="polite" className="py-8 text-neutral-600" role="status">
            Loading marketplace filters...
          </p>
        }
      >
        <ProductCatalogView products={products} />
      </Suspense>
    </SectionWrapper>
  );
}
