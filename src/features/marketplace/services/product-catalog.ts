import type { Product } from "@/features/marketplace/types/product";

export interface ProductCatalog {
  getProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
}
