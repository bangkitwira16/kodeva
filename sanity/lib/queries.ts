import { defineQuery } from "next-sanity";
import { getSanityClient } from "./client";

export const PUBLISHED_BLOG_POSTS_QUERY = defineQuery(/* groq */ `
  *[_type == "post" && defined(slug.current)] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    "coverImage": coverImage {
      "url": asset->url,
      alt
    },
    "categories": categories[]->{
      _id,
      title,
      "slug": slug.current
    },
    _createdAt
  }
`);

export const PUBLISHED_BLOG_POST_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    "coverImage": coverImage {
      "url": asset->url,
      alt
    },
    body,
    "categories": categories[]->{
      _id,
      title,
      "slug": slug.current
    },
    _createdAt
  }
`);

export const LANDING_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "landingPage"] | order(_updatedAt desc)[0] {
    _id,
    heroTitle,
    "bannerImage": bannerImage {
      "url": asset->url,
      alt
    },
    promoText
  }
`);

export type PublishedBlogPost = {
  _id: string;
  title: string;
  slug: string;
  coverImage: { url: string | null; alt?: string } | null;
  categories: Array<{ _id: string; title: string; slug: string | null }>;
  _createdAt: string;
};

export type PublishedBlogPostDetail = PublishedBlogPost & {
  body: unknown[];
};

export type LandingPageContent = {
  _id: string;
  heroTitle: string;
  bannerImage: { url: string | null; alt?: string } | null;
  promoText: string;
} | null;

export async function getPublishedBlogPosts(): Promise<PublishedBlogPost[]> {
  return getSanityClient().fetch<PublishedBlogPost[]>(
    PUBLISHED_BLOG_POSTS_QUERY,
  );
}

export async function getPublishedBlogPostBySlug(
  slug: string,
): Promise<PublishedBlogPostDetail | null> {
  return getSanityClient().fetch<PublishedBlogPostDetail | null>(
    PUBLISHED_BLOG_POST_BY_SLUG_QUERY,
    { slug },
  );
}

export async function getLandingPageContent(): Promise<LandingPageContent> {
  return getSanityClient().fetch<LandingPageContent>(LANDING_PAGE_QUERY);
}
