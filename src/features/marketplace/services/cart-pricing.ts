import type { CartItem } from "@/features/marketplace/types/product";

export type PricedCartItem = CartItem & {
  promoQuantity: number;
  maxQuantity: number;
  totalInCents: number;
};

export function getCartPricing(items: CartItem[]): {
  items: PricedCartItem[];
  totalInCents: number;
} {
  const quantityByProduct = new Map<string, number>();
  for (const item of items) {
    quantityByProduct.set(
      item.product.id,
      (quantityByProduct.get(item.product.id) ?? 0) + item.quantity,
    );
  }

  const promoUsedByProduct = new Map<string, number>();
  let totalInCents = 0;
  const pricedItems = items.map((item) => {
    const usedPromo = promoUsedByProduct.get(item.product.id) ?? 0;
    const promoQuantity =
      item.selectedPackage.promoPriceInCents === undefined
        ? 0
        : Math.min(
            item.quantity,
            Math.max(0, item.product.promoLicenseQuota - usedPromo),
          );
    promoUsedByProduct.set(
      item.product.id,
      usedPromo + promoQuantity,
    );
    const totalForItem =
      (item.selectedPackage.promoPriceInCents ?? item.selectedPackage.priceInCents) *
        promoQuantity +
      item.selectedPackage.priceInCents * (item.quantity - promoQuantity);
    totalInCents += totalForItem;

    const totalQuantity =
      quantityByProduct.get(item.product.id) ?? item.quantity;
    const maxQuantity =
      item.product.remainingLicenses - totalQuantity + item.quantity;

    return {
      ...item,
      promoQuantity,
      maxQuantity,
      totalInCents: totalForItem,
    };
  });

  return { items: pricedItems, totalInCents };
}

export function formatCurrency(amountInCents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountInCents / 100);
}
