import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { TypedObject } from "@portabletext/types";
import { notFound } from "next/navigation";
import { getPublishedBlogPostBySlug } from "../../../../../sanity/lib/queries";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  return post
    ? {
        title: post.title,
        description: post.excerpt ?? `${post.title} — Kodeva journal`,
      }
    : { title: "Article not found" };
}

const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const imageValue = value as TypedObject & {
        alt?: string;
        asset?: { url?: string };
      };
      if (!imageValue.asset?.url) return null;
      return (
        <figure className="my-8">
          <Image
            alt={imageValue.alt ?? ""}
            className="h-auto w-full rounded-xl"
            height={720}
            sizes="(max-width: 768px) 100vw, 768px"
            src={imageValue.asset.url}
            width={1200}
          />
          {imageValue.alt && (
            <figcaption className="mt-2 text-center text-sm text-neutral-600">
              {imageValue.alt}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  block: {
    h2: ({ children }) => (
      <h2 className="mb-4 mt-10 text-2xl font-semibold tracking-tight text-neutral-950">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-8 text-xl font-semibold text-neutral-950">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-neutral-300 pl-5 text-lg italic text-neutral-700">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-5 list-disc space-y-2 pl-6 text-neutral-700">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="my-5 list-decimal space-y-2 pl-6 text-neutral-700">{children}</ol>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = typeof value.href === "string" ? value.href : undefined;
      if (!href) return <>{children}</>;
      const external = href.startsWith("https://") || href.startsWith("http://");
      return (
        <a
          className="font-medium text-neutral-900 underline underline-offset-4"
          href={href}
          rel={external ? "noreferrer" : undefined}
          target={external ? "_blank" : undefined}
        >
          {children}
        </a>
      );
    },
    productLink: ({ children, value }) => {
      const product = value.product as
        | { name?: string; slug?: string }
        | undefined;
      return product?.slug ? (
        <Link
          className="font-medium text-neutral-900 underline underline-offset-4"
          href={`/marketplace/${product.slug}`}
        >
          {children || product.name || "View product"}
        </Link>
      ) : (
        <>{children}</>
      );
    },
  },
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        className="inline-flex min-h-11 items-center text-sm font-medium text-neutral-600 underline underline-offset-4 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-neutral-900"
        href="/blog"
      >
        Back to the journal
      </Link>
      <header className="mt-5">
        <div className="flex flex-wrap gap-2">
          {post.categories.map((category) => (
            <span
              className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-neutral-700"
              key={category._id}
            >
              {category.title}
            </span>
          ))}
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
          {post.title}
        </h1>
        <time
          className="mt-4 block text-sm text-neutral-500"
          dateTime={post._createdAt}
        >
          {new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
            new Date(post._createdAt),
          )}
        </time>
        {post.excerpt && (
          <p className="mt-6 text-lg leading-8 text-neutral-700">
            {post.excerpt}
          </p>
        )}
      </header>
      {post.coverImage?.url && (
        <Image
          alt={post.coverImage.alt ?? ""}
          className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover"
          height={675}
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          src={post.coverImage.url}
          width={1200}
        />
      )}
      <div className="prose-kodeva mt-10 text-base leading-8 text-neutral-700 [&_p]:mb-5 [&_strong]:font-semibold [&_strong]:text-neutral-950 [&_code]:rounded [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm">
        <PortableText
          components={portableTextComponents}
          value={post.body ?? []}
        />
      </div>
    </article>
  );
}
