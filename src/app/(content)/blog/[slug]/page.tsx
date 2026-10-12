import type { Metadata } from "next";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: slug,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
        Journal
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">{slug}</h1>
      <p className="mt-6 leading-7 text-neutral-600">
        Connect this route to the CMS-backed post service to render article
        content.
      </p>
    </article>
  );
}
