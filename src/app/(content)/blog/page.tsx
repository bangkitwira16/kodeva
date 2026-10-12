import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Stories, updates, and ideas from Kodeva.",
};

export default function BlogPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
        Journal
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">The blog</h1>
      <p className="mt-4 max-w-2xl leading-7 text-neutral-600">
        Blog listing content will be loaded through the CMS adapter in
        `features/blog/services`.
      </p>
    </section>
  );
}
