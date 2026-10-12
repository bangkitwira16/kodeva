import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { ProductDetailView } from "@/features/marketplace/components/product-detail-view";
import { getProductBySlug } from "../../../../../sanity/lib/queries";

export const revalidate = 60;

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return product
    ? {
        title: product.name,
        description: product.description,
      }
    : { title: "Product not found" };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <SectionWrapper contentWidth="wide" variant="features">
      <ProductDetailView product={product} />
    </SectionWrapper>
  );
}
