import Link from "next/link";

export function HeroSection() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-24">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
        Kodeva
      </p>
      <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-7xl">
        Thoughtful ideas. Useful things.
      </h1>
      <p className="max-w-2xl text-lg leading-8 text-neutral-600">
        Explore stories from our team and discover products selected to make
        everyday life a little better.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white"
          href="/marketplace"
        >
          Explore the marketplace
        </Link>
        <Link
          className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium"
          href="/blog"
        >
          Read the blog
        </Link>
      </div>
    </section>
  );
}
