export type ProductPackage = {
  id: string;
  name: "Basic" | "Pro" | "Business";
  priceInCents: number;
  promoPriceInCents?: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  categorySlug: string;
  imageUrl: string | null;
  imageAlt: string;
  screenshots: Array<{ url: string; alt: string }>;
  remainingLicenses: number;
  promoLicenseQuota: number;
  packages: ProductPackage[];
  featured?: boolean;
  isSample?: boolean;
};

export type CartItem = {
  product: Product;
  selectedPackage: ProductPackage;
  quantity: number;
};
