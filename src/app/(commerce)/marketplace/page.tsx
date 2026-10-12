import type { Metadata } from "next";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { ProductCatalogView } from "@/features/marketplace/components/product-catalog-view";
import { getMarketplaceProducts } from "../../../../sanity/lib/queries";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Browse the Kodeva marketplace.",
};

export const revalidate = 60;

type MarketplacePageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function MarketplacePage({
  searchParams,
}: MarketplacePageProps) {
  const [{ category }, products] = await Promise.all([
    searchParams,
    getMarketplaceProducts(),
  ]);

  return (
    <SectionWrapper
      description="Browse practical digital tools and choose the license package that fits."
      heading="Marketplace"
      headingLevel="h1"
      variant="features"
    >
      <ProductCatalogView initialCategory={category} products={products} />
    </SectionWrapper>
  );
}
