export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceInCents: number;
  imageUrl: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
