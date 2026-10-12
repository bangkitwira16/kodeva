"use client";

import Image from "next/image";
import { useState } from "react";
import type {
  Product,
  ProductPackage,
} from "@/features/marketplace/types/product";

type CartItemRowProps = {
  product: Product;
  selectedPackage: ProductPackage;
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  promoQuantity?: number;
  currency?: string;
  locale?: string;
};

export function CartItemRow({
  product,
  selectedPackage,
  quantity,
  maxQuantity,
  onQuantityChange,
  onRemove,
  promoQuantity,
  currency = "USD",
  locale = "en-US",
}: CartItemRowProps) {
  const [limitMessage, setLimitMessage] = useState("");
  const quantityInputId = `cart-quantity-${product.id}-${selectedPackage.id}`;
  const safeMaximum = Math.max(0, Math.floor(maxQuantity));
  const isOverQuota = quantity > safeMaximum;
  const unitPrice =
    selectedPackage.promoPriceInCents ?? selectedPackage.priceInCents;
  const discountedQuantity = Math.min(quantity, promoQuantity ?? quantity);
  const totalInCents =
    unitPrice * discountedQuantity +
    selectedPackage.priceInCents * (quantity - discountedQuantity);
  const totalPrice = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(totalInCents / 100);

  function updateQuantity(nextQuantity: number) {
    if (nextQuantity > safeMaximum) {
      setLimitMessage(`Only ${safeMaximum} license${safeMaximum === 1 ? "" : "s"} available.`);
      return;
    }
    if (nextQuantity < 1) return;
    setLimitMessage("");
    onQuantityChange(nextQuantity);
  }

  return (
    <article className="grid gap-4 border-b border-neutral-200 py-5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
      <div className="flex min-w-0 items-center gap-4">
        {product.imageUrl ? (
          <Image
            alt=""
            className="size-16 shrink-0 rounded-xl bg-neutral-100 object-cover sm:size-20"
            height={80}
            sizes="(max-width: 640px) 64px, 80px"
            src={product.imageUrl}
            width={80}
          />
        ) : (
          <div
            aria-hidden="true"
            className="size-16 shrink-0 rounded-xl bg-neutral-100 sm:size-20"
          />
        )}
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-neutral-950">{product.name}</h3>
          <p className="mt-1 text-sm text-neutral-600">
            {selectedPackage.name} package
          </p>
        </div>
      </div>
      <div>
        <label
          className="mb-1.5 block text-sm font-medium text-neutral-800"
          htmlFor={quantityInputId}
        >
          Licenses
        </label>
        <div className="flex items-center gap-1">
          <button
            aria-label={`Decrease ${product.name} license quantity`}
            className="min-h-11 min-w-11 rounded-full border border-neutral-300 text-lg text-neutral-900 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={quantity <= 1}
            onClick={() => updateQuantity(quantity - 1)}
            type="button"
          >
            <span aria-hidden="true">-</span>
          </button>
          <input
            aria-describedby={`${quantityInputId}-hint`}
            aria-invalid={isOverQuota || undefined}
            className="min-h-11 w-16 rounded-lg border border-neutral-300 text-center text-base text-neutral-950 outline-none focus-visible:border-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900"
            id={quantityInputId}
            inputMode="numeric"
            max={safeMaximum}
            min={1}
            onChange={(event) => {
              const nextQuantity = Number(event.currentTarget.value);
              if (Number.isInteger(nextQuantity) && nextQuantity >= 1) {
                updateQuantity(nextQuantity);
              }
            }}
            type="number"
            value={quantity}
          />
          <button
            aria-label={`Increase ${product.name} license quantity`}
            className="min-h-11 min-w-11 rounded-full border border-neutral-300 text-lg text-neutral-900 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={quantity >= safeMaximum}
            onClick={() => updateQuantity(quantity + 1)}
            type="button"
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>
        <p className="mt-1 text-xs text-neutral-600" id={`${quantityInputId}-hint`}>
          Maximum available: {safeMaximum}
        </p>
        <p
          aria-live="polite"
          className="mt-1 min-h-5 text-sm text-red-700"
          role="status"
        >
          {isOverQuota
            ? `Quantity exceeds the ${safeMaximum}-license quota.`
            : limitMessage}
        </p>
      </div>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <p aria-label={`Total: ${totalPrice}`} className="font-semibold text-neutral-950">
          {totalPrice}
        </p>
        <button
          aria-label={`Remove ${product.name} from cart`}
          className="min-h-11 min-w-11 rounded-full px-3 text-sm font-medium text-red-700 underline underline-offset-2 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          onClick={onRemove}
          type="button"
        >
          Remove
        </button>
      </div>
    </article>
  );
}
