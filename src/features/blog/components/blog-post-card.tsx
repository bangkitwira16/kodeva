import Link from "next/link";
import type { BlogPost } from "@/features/blog/types/blog-post";

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="rounded-2xl border border-neutral-200 p-6">
      <p className="text-sm text-neutral-500">{post.publishedAt}</p>
      <h2 className="mt-3 text-xl font-semibold tracking-tight">
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      <p className="mt-2 leading-6 text-neutral-600">{post.excerpt}</p>
    </article>
  );
}
