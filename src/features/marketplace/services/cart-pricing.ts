import type { CartItem } from "@/features/marketplace/types/product";
import {
  getVoucherDiscountInCents,
  validateVoucher,
  type VoucherValidation,
} from "@/features/marketplace/services/vouchers";

export type PricedCartItem = CartItem & {
  promoQuantity: number;
  maxQuantity: number;
  totalInCents: number;
};

export function getCartPricing(
  items: CartItem[],
  voucherCode: string | null = null,
  voucherRedemptionCounts: Record<string, number> = {},
): {
  items: PricedCartItem[];
  subtotalInCents: number;
  voucherDiscountInCents: number;
  voucherValidation: VoucherValidation | null;
  appliedVoucherCode: string | null;
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

  const subtotalInCents = totalInCents;
  const voucherValidation = voucherCode
    ? validateVoucher(
        voucherCode,
        subtotalInCents,
        voucherRedemptionCounts[voucherCode] ?? 0,
      )
    : null;
  const voucherDiscountInCents =
    voucherValidation?.valid === true
      ? getVoucherDiscountInCents(voucherValidation.voucher, subtotalInCents)
      : 0;
  totalInCents = Math.max(0, subtotalInCents - voucherDiscountInCents);

  return {
    items: pricedItems,
    subtotalInCents,
    voucherDiscountInCents,
    voucherValidation,
    appliedVoucherCode:
      voucherValidation?.valid === true ? voucherValidation.voucher.code : null,
    totalInCents,
  };
}

export function formatCurrency(amountInCents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountInCents / 100);
}
