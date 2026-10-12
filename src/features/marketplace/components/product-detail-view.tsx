"use client";

import Image from "next/image";
import { useState } from "react";
import { useCartStore } from "@/features/marketplace/stores/cart.store";
import type { Product } from "@/features/marketplace/types/product";

export function ProductDetailView({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const [selectedPackageId, setSelectedPackageId] = useState(
    product.packages[0]?.id ?? "",
  );
  const [message, setMessage] = useState("");
  const selectedPackage = product.packages.find(
    ({ id }) => id === selectedPackageId,
  );
  const cartQuantity = cartItems
    .filter((item) => item.product.id === product.id)
    .reduce((sum, item) => sum + item.quantity, 0);
  const promoRemaining = Math.max(
    0,
    product.promoLicenseQuota -
      cartItems
        .filter((item) => item.product.id === product.id)
        .filter((item) => item.selectedPackage.promoPriceInCents !== undefined)
        .reduce((sum, item) => sum + item.quantity, 0),
  );

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        {product.imageUrl && (
          <Image
            alt={product.imageAlt}
            className="aspect-[4/3] w-full rounded-2xl bg-neutral-100 object-cover"
            height={720}
            priority
            src={product.imageUrl}
            width={960}
          />
        )}
        {product.screenshots.length > 0 && (
          <section aria-label="Product feature screenshots" className="mt-5">
            <h2 className="mb-3 text-sm font-semibold text-neutral-900">
              Feature screenshots
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {product.screenshots.map((screenshot, index) => (
                <figure className="overflow-hidden rounded-xl" key={`${screenshot.url}-${index}`}>
                  <Image
                    alt={screenshot.alt}
                    className="aspect-video w-full bg-neutral-100 object-cover"
                    height={360}
                    src={screenshot.url}
                    width={640}
                  />
                  <figcaption className="sr-only">{screenshot.alt}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}
        {!product.imageUrl && product.screenshots.length === 0 && (
          <div
            aria-hidden="true"
            className="aspect-[4/3] rounded-2xl bg-neutral-100"
          />
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-600">{product.category}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
          {product.name}
        </h1>
        {product.isSample && (
          <p className="mt-2 text-sm font-medium text-amber-800">Sample listing</p>
        )}
        <p className="mt-4 leading-7 text-neutral-700">{product.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            {Math.max(0, product.remainingLicenses - cartQuantity)} licenses available
          </span>
          <span className="rounded-full bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
            {promoRemaining} promo licenses across all packages
          </span>
        </div>
        <fieldset className="mt-8">
          <legend className="mb-3 text-sm font-semibold text-neutral-900">
            Select your package
          </legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {product.packages.map((item) => {
              const checked = selectedPackageId === item.id;
              return (
                <label
                  className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-neutral-900 ${
                    checked
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 text-neutral-900 hover:border-neutral-500"
                  }`}
                  key={item.id}
                >
                  <input
                    checked={checked}
                    className="sr-only"
                    name={`package-${product.id}`}
                    onChange={() => setSelectedPackageId(item.id)}
                    type="radio"
                    value={item.id}
                  />
                  {item.name}
                </label>
              );
            })}
          </div>
        </fieldset>
        {selectedPackage && (
          <div aria-live="polite" className="mt-6 flex items-baseline gap-3">
            <p className="text-2xl font-semibold text-neutral-950">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(
                ((selectedPackage.promoPriceInCents !== undefined &&
                promoRemaining > 0
                  ? selectedPackage.promoPriceInCents
                  : selectedPackage.priceInCents) /
                  100),
              )}
            </p>
            {selectedPackage.promoPriceInCents !== undefined &&
              promoRemaining > 0 && (
                <p className="text-neutral-500">
                  <span className="sr-only">Original price: </span>
                  <s>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(selectedPackage.priceInCents / 100)}
                  </s>
                </p>
              )}
          </div>
        )}
        <button
          className="mt-6 min-h-11 w-full rounded-full bg-neutral-900 px-6 py-3 font-semibold text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-400 sm:w-auto"
          disabled={
            !selectedPackage ||
            product.remainingLicenses - cartQuantity < 1
          }
          onClick={() => {
            if (!selectedPackage) return;
            const result = addItem(product, selectedPackage);
            setMessage(
              result.success
                ? `${product.name} (${selectedPackage.name}) added to your cart.`
                : result.message ?? "This product could not be added.",
            );
          }}
          type="button"
        >
          Add to cart
        </button>
        <p aria-live="polite" className="mt-3 min-h-6 text-sm text-neutral-700" role="status">
          {message}
        </p>
      </div>
    </div>
  );
}
