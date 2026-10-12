import Image from "next/image";
import Link from "next/link";
import type { PublishedBlogPost } from "../../../../sanity/lib/queries";

export function BlogPostCard({ post }: { post: PublishedBlogPost }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      {post.coverImage?.url && (
        <Image
          alt={post.coverImage.alt ?? ""}
          className="aspect-[16/9] w-full object-cover"
          height={450}
          src={post.coverImage.url}
          width={800}
        />
      )}
      <div className="p-5 sm:p-6">
        <p className="text-sm text-neutral-500">
          <time dateTime={post._createdAt}>
            {new Intl.DateTimeFormat("en", {
              dateStyle: "medium",
            }).format(new Date(post._createdAt))}
          </time>
        </p>
        {post.categories.length > 0 && (
          <p className="mt-2 text-sm font-medium text-neutral-600">
            {post.categories.map(({ title }) => title).join(" · ")}
          </p>
        )}
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-neutral-950">
          <Link
            className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            href={`/blog/${post.slug}`}
          >
            {post.title}
          </Link>
        </h2>
        {post.excerpt && (
          <p className="mt-2 leading-6 text-neutral-600">{post.excerpt}</p>
        )}
      </div>
    </article>
  );
}
