import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { BlogPostCard } from "@/features/blog/components/blog-post-card";
import {
  getPublishedBlogPostCount,
  getPublishedBlogPosts,
} from "../../../../sanity/lib/queries";

export const metadata: Metadata = {
  title: "Blog",
  description: "Stories, updates, and ideas from Kodeva.",
};

export const revalidate = 60;
const pageSize = 6;

type BlogPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page: pageParam } = await searchParams;
  const parsedPage = Number(pageParam ?? "1");
  if (!Number.isInteger(parsedPage) || parsedPage < 1) notFound();

  const [totalPosts, posts] = await Promise.all([
    getPublishedBlogPostCount(),
    getPublishedBlogPosts((parsedPage - 1) * pageSize, pageSize),
  ]);
  const pageCount = Math.max(1, Math.ceil(totalPosts / pageSize));
  if (parsedPage > pageCount) notFound();

  return (
    <SectionWrapper
      description="Stories, updates, and ideas from the Kodeva team."
      eyebrow="Journal"
      heading="The blog"
      headingLevel="h1"
      variant="features"
    >
      {posts.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogPostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-neutral-200 p-8 text-center text-neutral-600">
          No published articles yet. Please check back soon.
        </p>
      )}
      {pageCount > 1 && (
        <nav
          aria-label="Blog pagination"
          className="mt-8 flex items-center justify-between gap-4"
        >
          {parsedPage > 1 ? (
            <Link
              className="inline-flex min-h-11 items-center rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              href={`/blog?page=${parsedPage - 1}`}
              rel="prev"
            >
              Previous page
            </Link>
          ) : (
            <span />
          )}
          <p aria-current="page" className="text-sm text-neutral-600">
            Page {parsedPage} of {pageCount}
          </p>
          {parsedPage < pageCount ? (
            <Link
              className="inline-flex min-h-11 items-center rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              href={`/blog?page=${parsedPage + 1}`}
              rel="next"
            >
              Next page
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </SectionWrapper>
  );
}
