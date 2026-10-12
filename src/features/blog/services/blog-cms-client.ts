import type { BlogPost } from "@/features/blog/types/blog-post";

export interface BlogCmsClient {
  getPosts(): Promise<BlogPost[]>;
  getPostBySlug(slug: string): Promise<BlogPost | null>;
}
