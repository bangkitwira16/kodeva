"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { CartItemRow } from "@/features/marketplace/components/cart-item-row";
import { VoucherCodeControl } from "@/features/marketplace/components/voucher-code-control";
import {
  formatCurrency,
  getCartPricing,
} from "@/features/marketplace/services/cart-pricing";
import { useCartStore } from "@/features/marketplace/stores/cart.store";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const appliedVoucherCode = useCartStore((state) => state.appliedVoucherCode);
  const voucherRedemptionCounts = useCartStore(
    (state) => state.voucherRedemptionCounts,
  );
  const pricing = getCartPricing(
    items,
    appliedVoucherCode,
    voucherRedemptionCounts,
  );
  const { items: pricedItems, totalInCents } = pricing;

  return (
    <SectionWrapper
      contentWidth="standard"
      description="Review your product packages and license quantities."
      heading="Your cart"
      headingLevel="h1"
      variant="features"
    >
      {!hasHydrated ? (
        <p aria-live="polite" className="py-8 text-neutral-600" role="status">
          Loading your cart...
        </p>
      ) : pricedItems.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 p-8 text-center">
          <p className="text-neutral-700">Your cart is empty.</p>
          <Link
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            href="/marketplace"
          >
            Browse the marketplace
          </Link>
        </div>
      ) : (
        <>
          <div>
            {pricedItems.map((item) => (
              <CartItemRow
                key={`${item.product.id}-${item.selectedPackage.id}`}
                maxQuantity={item.maxQuantity}
                onQuantityChange={(quantity) => {
                  setQuantity(
                    item.product.id,
                    item.selectedPackage.id,
                    quantity,
                  );
                }}
                onRemove={() =>
                  removeItem(item.product.id, item.selectedPackage.id)
                }
                product={item.product}
                promoQuantity={item.promoQuantity}
                quantity={item.quantity}
                selectedPackage={item.selectedPackage}
              />
            ))}
          </div>
          <div className="ml-auto mt-8 max-w-sm rounded-2xl bg-neutral-50 p-5">
            <VoucherCodeControl
              appliedVoucherCode={appliedVoucherCode}
              subtotalInCents={pricing.subtotalInCents}
              voucherValidation={pricing.voucherValidation}
            />
            <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-neutral-600">Subtotal</span>
                <span>{formatCurrency(pricing.subtotalInCents)}</span>
              </div>
              {pricing.voucherDiscountInCents > 0 && (
                <div className="flex justify-between gap-4 text-emerald-800">
                  <span>Voucher discount</span>
                  <span>-{formatCurrency(pricing.voucherDiscountInCents)}</span>
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-between gap-4 text-lg font-semibold">
              <span>Estimated total</span>
              <span>{formatCurrency(totalInCents)}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Promotional pricing uses a shared license quota across package
              variants for each product.
            </p>
            <Link
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              href="/checkout"
            >
              Continue to checkout
            </Link>
          </div>
        </>
      )}
    </SectionWrapper>
  );
}
