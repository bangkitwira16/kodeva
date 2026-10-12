import type {
  BillingPeriod,
  ProductPackage,
} from "@/features/marketplace/types/product";

export const ANNUAL_DISCOUNT_PERCENT = 20;
const MONTHS_PER_YEAR = 12;

export function getBillingPriceInCents(
  selectedPackage: ProductPackage,
  billingPeriod: BillingPeriod,
  usePromoPrice: boolean,
): number {
  const monthlyPriceInCents =
    usePromoPrice && selectedPackage.promoPriceInCents !== undefined
      ? selectedPackage.promoPriceInCents
      : selectedPackage.priceInCents;

  if (billingPeriod === "monthly") return monthlyPriceInCents;

  return Math.round(
    (monthlyPriceInCents *
      MONTHS_PER_YEAR *
      (100 - ANNUAL_DISCOUNT_PERCENT)) /
      100,
  );
}

export function getAnnualReferencePriceInCents(
  selectedPackage: ProductPackage,
): number {
  return selectedPackage.priceInCents * MONTHS_PER_YEAR;
}
