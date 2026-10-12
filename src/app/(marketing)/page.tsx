import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { LeadCaptureForm } from "@/features/marketing/components/lead-capture-form";
import { ProductCard } from "@/features/marketplace/components/product-card";
import {
  getLandingPageContent,
  getMarketplaceProducts,
} from "../../../sanity/lib/queries";

export const metadata: Metadata = {
  title: "Kodeva",
  description: "Discover practical digital products, stories, and ideas.",
};

export const revalidate = 60;

function getSafeCtaHref(href: string | null | undefined) {
  if (!href) return "/marketplace";
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  try {
    const url = new URL(href);
    return url.protocol === "https:" ? href : "/marketplace";
  } catch {
    return "/marketplace";
  }
}

export default async function HomePage() {
  const [content, products] = await Promise.all([
    getLandingPageContent(),
    getMarketplaceProducts(),
  ]);
  const cmsFeaturedProducts = content?.featuredProducts ?? [];
  const featuredProducts =
    cmsFeaturedProducts.length > 0
      ? cmsFeaturedProducts.slice(0, 3)
      : products.filter(({ featured }) => featured).slice(0, 3).length > 0
        ? products.filter(({ featured }) => featured).slice(0, 3)
        : products.slice(0, 3);
  const quotes = content?.testimonials ?? [];
  const questions = content?.faqs ?? [];

  return (
    <>
      <SectionWrapper
        className="bg-neutral-50"
        description={
          content?.heroDescription ??
          content?.promoText ??
          "Explore useful digital products and practical ideas made for people building their next thing."
        }
        heading={content?.heroTitle ?? "Thoughtful ideas. Useful things."}
        headingLevel="h1"
        variant="hero"
      >
        {content?.bannerImage?.url && (
          <Image
            alt={content.bannerImage.alt ?? ""}
            className="mb-8 aspect-[2/1] w-full rounded-2xl object-cover"
            fetchPriority="high"
            height={720}
            priority
            sizes="(max-width: 768px) 100vw, 1152px"
            src={content.bannerImage.url}
            width={1440}
          />
        )}
        <div className="flex flex-wrap gap-3">
          <Link
            className="w-full sm:w-auto justify-center sm:justify-start min-h-11 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            href={getSafeCtaHref(content?.heroCtaHref)}
          >
            {content?.heroCtaLabel || "Explore the marketplace"}
          </Link>
          <Link
            className="w-full sm:w-auto justify-center sm:justify-start min-h-11 rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-900 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            href="/blog"
          >
            Read the blog
          </Link>
        </div>
      </SectionWrapper>

      <SectionWrapper
        description="A few popular picks to help you get started."
        heading="Featured products"
        id="featured-products"
        variant="features"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <Link
          className="mt-8 min-h-11 rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          href="/marketplace"
        >
          Browse all products
        </Link>
      </SectionWrapper>

      <SectionWrapper
        className="bg-neutral-50"
        description="A few kind words from people using Kodeva."
        heading="What customers say"
        variant="testimonials"
      >
        {quotes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {quotes.map((testimonial, index) => (
              <figure
                className="rounded-2xl border border-neutral-200 bg-white p-6"
                key={`${testimonial.name}-${index}`}
              >
                <blockquote className="leading-7 text-neutral-700">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold text-neutral-950">
                    {testimonial.name}
                  </span>
                  {testimonial.role && (
                    <span className="block text-neutral-600">
                      {testimonial.role}
                    </span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="text-neutral-600">
            Customer stories will appear here as they are published.
          </p>
        )}
      </SectionWrapper>

      <SectionWrapper heading="Frequently asked questions" variant="faq">
        {questions.length > 0 ? (
          <div className="divide-y divide-neutral-200 border-y border-neutral-200">
            {questions.map((faq, index) => (
              <details className="group py-2" key={`${faq.question}-${index}`}>
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium text-neutral-900 focus-visible:outline-2 focus-visible:outline-neutral-900">
                  {faq.question}
                  <span aria-hidden="true" className="text-xl">
                    +
                  </span>
                </summary>
                <p className="pb-4 pr-8 leading-7 text-neutral-600">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        ) : (
          <p className="text-neutral-600">
            Questions and answers will appear here as they are published.
          </p>
        )}
      </SectionWrapper>

      <SectionWrapper
        className="bg-neutral-50"
        contentWidth="narrow"
        description="Get occasional updates, new product releases, and practical resources."
        heading="Stay in the loop"
        id="lead-capture"
        variant="features"
      >
        <LeadCaptureForm submitLabel="Join the list" />
      </SectionWrapper>
    </>
  );
}
