"use client";

import { useId, useState } from "react";
import type { Product } from "@/features/marketplace/types/product";

export type ProductPackage = {
  id: string;
  name: "Basic" | "Pro" | "Business";
  priceInCents: number;
  promoPriceInCents?: number;
};

export type ProductCardProduct = Product & {
  category: string;
  remainingLicenses: number;
  packages: ProductPackage[];
};

type ProductCardProps = {
  product: ProductCardProduct;
  currency?: string;
  locale?: string;
  onAddToCart?: (product: ProductCardProduct, selectedPackage: ProductPackage) => void;
};

function formatPrice(amountInCents: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amountInCents / 100);
}

export function ProductCard({
  product,
  currency = "USD",
  locale = "en-US",
  onAddToCart,
}: ProductCardProps) {
  const id = useId();
  const [selectedPackageId, setSelectedPackageId] = useState(
    product.packages[0]?.id ?? "",
  );
  const selectedPackage = product.packages.find(
    (item) => item.id === selectedPackageId,
  );

  return (
    <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <div
        aria-hidden="true"
        className="mb-5 aspect-[4/3] rounded-xl bg-neutral-100"
        role="img"
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-600">{product.category}</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">
            {product.name}
          </h2>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
          {product.remainingLicenses}{" "}
          {product.remainingLicenses === 1 ? "license" : "licenses"} left
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-neutral-600">
        {product.description}
      </p>
      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-medium text-neutral-800">
          Choose a package
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {product.packages.map((item) => {
            const optionId = `${id}-${item.id}`;
            return (
              <label
                key={item.id}
                className={`flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-2 py-2 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neutral-900 ${
                  selectedPackageId === item.id
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 text-neutral-800 hover:border-neutral-500"
                }`}
              >
                <input
                  checked={selectedPackageId === item.id}
                  className="sr-only"
                  id={optionId}
                  name={`${id}-package`}
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
      <div className="mt-5 flex items-baseline gap-2">
        {selectedPackage ? (
          <>
            <p className="text-xl font-semibold text-neutral-950">
              {formatPrice(
                selectedPackage.promoPriceInCents ?? selectedPackage.priceInCents,
                locale,
                currency,
              )}
            </p>
            {selectedPackage.promoPriceInCents !== undefined && (
              <p className="text-sm text-neutral-500">
                <span className="sr-only">Original price: </span>
                <s>{formatPrice(selectedPackage.priceInCents, locale, currency)}</s>
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-neutral-600">No packages are available.</p>
        )}
      </div>
      {onAddToCart && (
        <button
          className="mt-5 min-h-11 w-full rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-400"
          disabled={!selectedPackage || product.remainingLicenses < 1}
          onClick={() => {
            if (selectedPackage) onAddToCart(product, selectedPackage);
          }}
          type="button"
        >
          Add to cart
        </button>
      )}
    </article>
  );
}
