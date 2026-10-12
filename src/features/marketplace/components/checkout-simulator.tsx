"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { appendUtmParameters } from "@/features/attribution/utm";
import { useUtmParameters } from "@/features/attribution/utm-provider";
import { pushGa4EcommerceEvent } from "@/features/analytics/ga4";
import { formatCurrency, getCartPricing } from "@/features/marketplace/services/cart-pricing";
import { VoucherCodeControl } from "@/features/marketplace/components/voucher-code-control";
import { useCartStore } from "@/features/marketplace/stores/cart.store";

type PaymentStatus = "idle" | "processing" | "success" | "error";

type CheckoutPayload = {
  buyer: { name: string; email: string };
  items: Array<{
    productId: string;
    productName: string;
    packageId: string;
    packageName: string;
    billingPeriod: "monthly" | "annually";
    quantity: number;
    totalInCents: number;
  }>;
  subtotalInCents: number;
  voucherCode: string | null;
  voucherDiscountInCents: number;
  totalInCents: number;
};

async function simulatePayment(
  payload: CheckoutPayload,
  simulateFailure: boolean,
): Promise<boolean> {
  if (payload.items.length === 0) return false;
  await new Promise((resolve) => setTimeout(resolve, 700));
  return !simulateFailure;
}

export function CheckoutSimulator() {
  const instanceId = useId();
  const didTrackCheckout = useRef(false);
  const utmParameters = useUtmParameters();
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const clearCart = useCartStore((state) => state.clear);
  const appliedVoucherCode = useCartStore((state) => state.appliedVoucherCode);
  const voucherRedemptionCounts = useCartStore(
    (state) => state.voucherRedemptionCounts,
  );
  const redeemAppliedVoucher = useCartStore(
    (state) => state.redeemAppliedVoucher,
  );
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const pricing = getCartPricing(
    items,
    appliedVoucherCode,
    voucherRedemptionCounts,
  );

  useEffect(() => {
    if (!hasHydrated || pricing.items.length === 0 || didTrackCheckout.current) {
      return;
    }
    didTrackCheckout.current = true;
    pushGa4EcommerceEvent(
      "begin_checkout",
      {
        currency: "USD",
        value: pricing.totalInCents / 100,
        items: pricing.items.map((item) => ({
          item_id: item.product.id,
          item_name: item.product.name,
          item_category: item.product.category,
          item_variant: `${item.selectedPackage.name} (${item.billingPeriod ?? "monthly"})`,
          price:
            item.quantity > 0
              ? item.totalInCents / item.quantity / 100
              : 0,
          quantity: item.quantity,
        })),
      },
      `${instanceId}:begin_checkout`,
    );
  }, [hasHydrated, instanceId, pricing]);

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "processing" || pricing.items.length === 0) return;

    const formData = new FormData(event.currentTarget);
    const payload = appendUtmParameters({
      buyer: {
        name: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
      },
      items: pricing.items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        packageId: item.selectedPackage.id,
        packageName: item.selectedPackage.name,
        billingPeriod: item.billingPeriod ?? "monthly",
        quantity: item.quantity,
        totalInCents: item.totalInCents,
      })),
      subtotalInCents: pricing.subtotalInCents,
      voucherCode: pricing.appliedVoucherCode,
      voucherDiscountInCents: pricing.voucherDiscountInCents,
      totalInCents: pricing.totalInCents,
    }, utmParameters);

    setStatus("processing");
    const paymentSucceeded = await simulatePayment(payload, simulateFailure);
    if (!paymentSucceeded) {
      setStatus("error");
      return;
    }

    redeemAppliedVoucher();
    clearCart();
    setStatus("success");
  }

  if (!hasHydrated) {
    return (
      <p aria-live="polite" className="py-8 text-neutral-600" role="status">
        Loading checkout...
      </p>
    );
  }

  if (status === "success") {
    return (
      <div
        aria-labelledby="payment-success-title"
        className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8"
        role="status"
      >
        <h2
          className="text-2xl font-semibold text-emerald-950"
          id="payment-success-title"
        >
          Payment successful
        </h2>
        <p className="mt-3 leading-7 text-emerald-900">
          This was a payment simulation. Your cart has been cleared.
        </p>
        <Link
          className="mt-5 inline-flex min-h-11 items-center rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          href="/marketplace"
        >
          Return to marketplace
        </Link>
      </div>
    );
  }

  if (pricing.items.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 p-6">
        <p className="text-neutral-700">Your cart is empty.</p>
        <Link
          className="mt-4 inline-flex min-h-11 items-center rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          href="/marketplace"
        >
          Browse the marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <form className="space-y-5" onSubmit={submitPayment}>
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-neutral-900"
            htmlFor="buyer-name"
          >
            Full name
          </label>
          <input
            autoComplete="name"
            className="min-h-11 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            id="buyer-name"
            maxLength={120}
            name="name"
            required
          />
        </div>
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-neutral-900"
            htmlFor="buyer-email"
          >
            Email
          </label>
          <input
            autoComplete="email"
            className="min-h-11 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            id="buyer-email"
            maxLength={254}
            name="email"
            required
            type="email"
          />
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 p-3 text-sm text-neutral-700">
          <input
            checked={simulateFailure}
            className="size-5 accent-neutral-900"
            onChange={(event) => setSimulateFailure(event.currentTarget.checked)}
            type="checkbox"
          />
          Simulate a declined payment
        </label>
        {status === "error" && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
            Payment could not be completed. Your cart is unchanged; retry or
            choose a different payment method.
          </p>
        )}
        <button
          className="min-h-11 w-full rounded-full bg-neutral-900 px-5 py-3 font-semibold text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-wait disabled:opacity-60"
          disabled={status === "processing"}
          type="submit"
        >
          {status === "processing"
            ? "Processing..."
            : `Pay ${formatCurrency(pricing.totalInCents)}`}
        </button>
        <p className="text-xs leading-5 text-neutral-500">
          Demo checkout only. No payment details are requested or processed.
        </p>
      </form>

      <aside
        aria-label="Order summary"
        className="h-fit rounded-2xl bg-neutral-50 p-5"
      >
        <h2 className="font-semibold text-neutral-950">Order summary</h2>
        <VoucherCodeControl
          appliedVoucherCode={appliedVoucherCode}
          subtotalInCents={pricing.subtotalInCents}
          voucherValidation={pricing.voucherValidation}
        />
        <ul className="mt-4 space-y-4">
          {pricing.items.map((item) => (
            <li
              className="flex justify-between gap-3 text-sm"
              key={`${item.product.id}-${item.selectedPackage.id}-${item.billingPeriod ?? "monthly"}`}
            >
              <span className="text-neutral-700">
                {item.product.name} · {item.selectedPackage.name} ·{" "}
                {item.billingPeriod === "annually" ? "Annual" : "Monthly"} ×{" "}
                {item.quantity}
              </span>
              <span className="shrink-0 font-medium text-neutral-950">
                {formatCurrency(item.totalInCents)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-5 space-y-2 border-t border-neutral-200 pt-4 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-neutral-600">Subtotal</span>
            <span>{formatCurrency(pricing.subtotalInCents)}</span>
          </div>
          {pricing.voucherDiscountInCents > 0 && (
            <div className="flex justify-between gap-3 text-emerald-800">
              <span>Voucher discount</span>
              <span>-{formatCurrency(pricing.voucherDiscountInCents)}</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex justify-between border-t border-neutral-200 pt-4 font-semibold">
          <span>Total</span>
          <span>{formatCurrency(pricing.totalInCents)}</span>
        </div>
      </aside>
    </div>
  );
}
