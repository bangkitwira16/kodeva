"use client";

import { useState, type FormEvent } from "react";
import { formatCurrency } from "@/features/marketplace/services/cart-pricing";
import { useCartStore } from "@/features/marketplace/stores/cart.store";
import type { VoucherValidation } from "@/features/marketplace/services/vouchers";

type VoucherCodeControlProps = {
  subtotalInCents: number;
  appliedVoucherCode: string | null;
  voucherValidation: VoucherValidation | null;
};

export function VoucherCodeControl({
  subtotalInCents,
  appliedVoucherCode,
  voucherValidation,
}: VoucherCodeControlProps) {
  const applyVoucher = useCartStore((state) => state.applyVoucher);
  const removeVoucher = useCartStore((state) => state.removeVoucher);
  const [code, setCode] = useState(appliedVoucherCode ?? "");
  const [message, setMessage] = useState("");
  const isVoucherValid = voucherValidation?.valid === true;

  function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = applyVoucher(code);
    setMessage(result.success ? "" : result.message);
  }

  return (
    <section
      aria-label="Voucher code"
      className="mt-5 border-t border-neutral-200 pt-4"
    >
      <h2 className="text-sm font-semibold text-neutral-900">Voucher code</h2>
      {appliedVoucherCode && isVoucherValid ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-emerald-800" role="status">
            {appliedVoucherCode} applied
          </p>
          <button
            className="min-h-11 rounded-lg px-3 text-sm font-medium text-neutral-700 underline underline-offset-2 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            onClick={() => {
              removeVoucher();
              setMessage("");
              setCode("");
            }}
            type="button"
          >
            Remove voucher
          </button>
        </div>
      ) : (
        <form className="mt-3 flex gap-2" onSubmit={submitCode}>
          <label className="sr-only" htmlFor="voucher-code">
            Enter voucher code
          </label>
          <input
            autoCapitalize="characters"
            autoComplete="off"
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-3 text-base uppercase text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            id="voucher-code"
            maxLength={40}
            onChange={(event) => {
              setCode(event.currentTarget.value);
              setMessage("");
            }}
            placeholder="Enter code"
            value={code}
          />
          <button
            className="min-h-11 rounded-lg bg-neutral-900 px-4 text-sm font-semibold text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            type="submit"
          >
            Apply
          </button>
        </form>
      )}
      {message && (
        <p
          aria-live="polite"
          className={`mt-2 text-sm ${
            isVoucherValid ? "text-emerald-800" : "text-red-700"
          }`}
          role="status"
        >
          {message}
        </p>
      )}
      {appliedVoucherCode && !isVoucherValid && voucherValidation && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {voucherValidation.message} The discount is not included in your total.
        </p>
      )}
      {!appliedVoucherCode && (
        <p className="mt-2 text-xs leading-5 text-neutral-500">
          Try WELCOME10 on orders over {formatCurrency(5000)}, or SAVE5.
          Voucher usage limits apply.
        </p>
      )}
      <p className="sr-only">Cart subtotal: {formatCurrency(subtotalInCents)}</p>
    </section>
  );
}
