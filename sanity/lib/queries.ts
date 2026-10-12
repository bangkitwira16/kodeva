import { defineQuery } from "next-sanity";
import type { TypedObject } from "@portabletext/types";
import { getSanityClient } from "./client";
import type { Product } from "@/features/marketplace/types/product";
import { SAMPLE_PRODUCTS } from "@/features/marketplace/data/sample-products";

export const PUBLISHED_BLOG_POSTS_QUERY = defineQuery(/* groq */ `
  *[
    _type == "post" &&
    defined(slug.current) &&
    (publishStatus == "published" || !defined(publishStatus))
  ] | order(_createdAt desc)[$start...$end] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    "coverImage": coverImage {
      "url": asset->url,
      alt
    },
    "categories": select(
      count(categories[]) > 0 => categories[]->{ _id, title, "slug": slug.current },
      defined(category) => [category->{ _id, title, "slug": slug.current }],
      []
    ),
    _createdAt
  }
`);

export const PUBLISHED_BLOG_POST_COUNT_QUERY = defineQuery(/* groq */ `
  count(*[
    _type == "post" &&
    defined(slug.current) &&
    (publishStatus == "published" || !defined(publishStatus))
  ])
`);

export const PUBLISHED_BLOG_POST_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[
    _type == "post" &&
    slug.current == $slug &&
    (publishStatus == "published" || !defined(publishStatus))
  ][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    "coverImage": coverImage {
      "url": asset->url,
      alt
    },
    body[]{
      ...,
      _type == "image" => {
        _type,
        alt,
        "asset": { "url": asset->url }
      },
      _type == "block" => {
        ...,
        markDefs[]{
          ...,
          _type == "productLink" => {
            ...,
            product->{
              name,
              "slug": slug.current
            }
          }
        }
      }
    },
    "categories": select(
      count(categories[]) > 0 => categories[]->{ _id, title, "slug": slug.current },
      defined(category) => [category->{ _id, title, "slug": slug.current }],
      []
    ),
    _createdAt
  }
`);

export const LANDING_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "landingPage"] | order(_updatedAt desc)[0] {
    _id,
    heroTitle,
    "heroDescription": coalesce(heroSubtitle, heroDescription),
    "heroCtaLabel": coalesce(cta.label, heroCtaLabel),
    "heroCtaHref": coalesce(cta.href, heroCtaHref),
    "bannerImage": bannerImage {
      "url": asset->url,
      alt
    },
    promoText,
    "featuredProducts": coalesce(array::compact(featuredProducts[]->{
      "id": _id,
      name,
      "slug": slug.current,
      description,
      "category": coalesce(category->title, "Other"),
      "categorySlug": coalesce(category->slug.current, "other"),
      "imageUrl": image.asset->url,
      "imageAlt": image.alt,
      "remainingLicenses": coalesce(remainingLicenses, 0),
      "promoLicenseQuota": coalesce(promoLicenseQuota, 0),
      featured,
      "packages": coalesce(packages[]{ "id": _key, name, priceInCents, "promoPriceInCents": select(defined(promoPriceInCents) => promoPriceInCents) }, []),
      "screenshots": coalesce(screenshots[defined(asset._ref)][]{ "url": asset->url, "alt": coalesce(alt, "") }, [])
    }), []),
    "testimonials": coalesce(testimonials[]{ quote, name, role }, []),
    "faqs": coalesce(faqs[]{ question, answer }, [])
  }
`);

export const PUBLISHED_PRODUCTS_QUERY = defineQuery(/* groq */ `
  *[_type == "product" && defined(slug.current)] | order(name asc) {
    "id": _id,
    name,
    "slug": slug.current,
    description,
    "category": coalesce(category->title, "Other"),
    "categorySlug": coalesce(category->slug.current, "other"),
    "imageUrl": image.asset->url,
    "imageAlt": coalesce(image.alt, ""),
    "remainingLicenses": coalesce(remainingLicenses, 0),
    "promoLicenseQuota": coalesce(promoLicenseQuota, 0),
    featured,
    "packages": coalesce(packages[]{ "id": _key, name, priceInCents, "promoPriceInCents": select(defined(promoPriceInCents) => promoPriceInCents) }, []),
    "screenshots": coalesce(screenshots[defined(asset._ref)][]{ "url": asset->url, "alt": coalesce(alt, "") }, [])
  }
`);

export const PUBLISHED_PRODUCT_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "product" && slug.current == $slug][0] {
    "id": _id,
    name,
    "slug": slug.current,
    description,
    "category": coalesce(category->title, "Other"),
    "categorySlug": coalesce(category->slug.current, "other"),
    "imageUrl": image.asset->url,
    "imageAlt": coalesce(image.alt, ""),
    "remainingLicenses": coalesce(remainingLicenses, 0),
    "promoLicenseQuota": coalesce(promoLicenseQuota, 0),
    featured,
    "packages": coalesce(packages[]{ "id": _key, name, priceInCents, "promoPriceInCents": select(defined(promoPriceInCents) => promoPriceInCents) }, []),
    "screenshots": coalesce(screenshots[defined(asset._ref)][]{ "url": asset->url, "alt": coalesce(alt, "") }, [])
  }
`);

export type PublishedBlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage: { url: string | null; alt?: string } | null;
  categories: Array<{ _id: string; title: string; slug: string | null }>;
  _createdAt: string;
};

export type PublishedBlogPostDetail = PublishedBlogPost & {
  body: TypedObject[];
};

export type LandingPageContent = {
  _id: string;
  heroTitle: string;
  heroDescription: string | null;
  heroCtaLabel: string | null;
  heroCtaHref: string | null;
  bannerImage: { url: string | null; alt?: string } | null;
  promoText: string;
  featuredProducts: Product[];
  testimonials: Array<{ quote: string; name: string; role?: string }>;
  faqs: Array<{ question: string; answer: string }>;
} | null;

export async function getPublishedBlogPosts(
  start = 0,
  limit = 6,
): Promise<PublishedBlogPost[]> {
  return getSanityClient().fetch<PublishedBlogPost[]>(
    PUBLISHED_BLOG_POSTS_QUERY,
    { start, end: start + limit },
    { perspective: "published", next: { revalidate: 60 } },
  );
}

export async function getPublishedBlogPostCount(): Promise<number> {
  return getSanityClient().fetch<number>(
    PUBLISHED_BLOG_POST_COUNT_QUERY,
    {},
    { perspective: "published", next: { revalidate: 60 } },
  );
}

export async function getPublishedBlogPostBySlug(
  slug: string,
): Promise<PublishedBlogPostDetail | null> {
  return getSanityClient().fetch<PublishedBlogPostDetail | null>(
    PUBLISHED_BLOG_POST_BY_SLUG_QUERY,
    { slug },
    { perspective: "published", next: { revalidate: 60 } },
  );
}

export async function getLandingPageContent(): Promise<LandingPageContent> {
  return getSanityClient().fetch<LandingPageContent>(
    LANDING_PAGE_QUERY,
    {},
    { perspective: "published", next: { revalidate: 60 } },
  );
}

export async function getMarketplaceProducts(): Promise<Product[]> {
  const products = await getSanityClient().fetch<Product[]>(
    PUBLISHED_PRODUCTS_QUERY,
    {},
    { perspective: "published", next: { revalidate: 60 } },
  );
  const productSlugs = new Set(products.map(({ slug }) => slug));
  const sampleProducts = SAMPLE_PRODUCTS.filter(
    ({ slug }) => !productSlugs.has(slug),
  );
  return products.length >= 6
    ? products
    : [...products, ...sampleProducts.slice(0, 6 - products.length)];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await getSanityClient().fetch<Product | null>(
    PUBLISHED_PRODUCT_BY_SLUG_QUERY,
    { slug },
    { perspective: "published", next: { revalidate: 60 } },
  );
  return product ?? SAMPLE_PRODUCTS.find((candidate) => candidate.slug === slug) ?? null;
}
