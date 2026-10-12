"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "@/features/marketplace/components/product-card";
import { useCartStore } from "@/features/marketplace/stores/cart.store";
import type { Product } from "@/features/marketplace/types/product";

export function ProductCatalogView({
  products,
  initialCategory,
}: {
  products: Product[];
  initialCategory?: string;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [category, setCategory] = useState(
    initialCategory &&
      products.some((product) => product.categorySlug === initialCategory)
      ? initialCategory
      : "all",
  );
  const [message, setMessage] = useState("");
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const categoryTriggerRef = useRef<HTMLButtonElement>(null);
  const categoryOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const categories = useMemo(
    () =>
      Array.from(
        new Map(
          products.map((product) => [
            product.categorySlug,
            product.category,
          ]),
        ),
      ).sort((a, b) => a[1].localeCompare(b[1])),
    [products],
  );
  const filteredProducts =
    category === "all"
      ? products
      : products.filter((product) => product.categorySlug === category);
  const selectedCategoryLabel =
    categories.find(([slug]) => slug === category)?.[1] ?? "All categories";

  useEffect(() => {
    if (!isCategoryMenuOpen) return;
    const selectedIndex = categories.findIndex(([slug]) => slug === category);
    categoryOptionRefs.current[selectedIndex + 1]?.focus();
  }, [category, categories, isCategoryMenuOpen]);

  function moveCategoryFocus(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsCategoryMenuOpen(false);
      categoryTriggerRef.current?.focus();
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();
    const options = categoryOptionRefs.current.filter(
      (option): option is HTMLButtonElement => option !== null,
    );
    const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement);
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex =
      currentIndex < 0
        ? direction > 0
          ? 0
          : options.length - 1
        : (currentIndex + direction + options.length) % options.length;
    options[nextIndex]?.focus();
  }

  return (
    <>
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="text-sm text-neutral-600">
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "product" : "products"}
        </p>
        <div className="relative sm:w-64" ref={categoryMenuRef}>
          <span className="mb-1.5 block text-sm font-medium text-neutral-900">
            Filter by category
          </span>
          <button
            aria-controls="product-category-menu"
            aria-expanded={isCategoryMenuOpen}
            aria-haspopup="menu"
            className="flex min-h-11 w-full items-center justify-between rounded-lg border border-neutral-300 bg-white px-3 text-left text-base text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            onClick={() => setIsCategoryMenuOpen((open) => !open)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                setIsCategoryMenuOpen(true);
              }
            }}
            ref={categoryTriggerRef}
            type="button"
          >
            {selectedCategoryLabel}
            <svg
              aria-hidden="true"
              className={`ml-3 size-4 transition-transform ${isCategoryMenuOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                d="m5 7.5 5 5 5-5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
          </button>
          {isCategoryMenuOpen && (
            <div
              aria-label="Product categories"
              className="absolute right-0 z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg"
              id="product-category-menu"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsCategoryMenuOpen(false);
                }
              }}
              onKeyDown={moveCategoryFocus}
              role="menu"
            >
              {[
                ["all", "All categories"] as const,
                ...categories,
              ].map(([slug, title], index) => (
                <button
                  aria-checked={category === slug}
                  className={`flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-neutral-900 ${
                    category === slug
                      ? "bg-neutral-100 font-semibold text-neutral-950"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                  key={slug}
                  onClick={() => {
                    setCategory(slug);
                    setIsCategoryMenuOpen(false);
                    categoryTriggerRef.current?.focus();
                  }}
                  ref={(element) => {
                    categoryOptionRefs.current[index] = element;
                  }}
                  role="menuitemradio"
                  type="button"
                >
                  {title}
                  {category === slug && (
                    <span aria-hidden="true" className="text-neutral-900">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {message && (
        <p aria-live="polite" className="mb-5 text-sm text-neutral-700" role="status">
          {message}
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            onAddToCart={(item, selectedPackage) => {
              const result = addItem(item, selectedPackage);
              setMessage(
                result.success
                  ? `${item.name} (${selectedPackage.name}) added to your cart.`
                  : result.message ?? "This item could not be added.",
              );
            }}
            product={product}
          />
        ))}
      </div>
      {filteredProducts.length === 0 && (
        <p className="rounded-xl border border-neutral-200 p-8 text-center text-neutral-600">
          No products are available in this category.
        </p>
      )}
    </>
  );
}
