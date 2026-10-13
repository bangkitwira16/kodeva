"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ProductCard } from "@/features/marketplace/components/product-card";
import { useCartStore } from "@/features/marketplace/stores/cart.store";
import { pushGa4EcommerceEvent } from "@/features/analytics/ga4";
import type { Product } from "@/features/marketplace/types/product";

const SORT_OPTIONS = [
  ["", "Featured"],
  ["asc", "Price: low to high"],
  ["desc", "Price: high to low"],
] as const;

export function ProductCatalogView({
  products,
}: {
  products: Product[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const search = searchParams.get("search") ?? "";
  const requestedCategory = searchParams.get("category");
  const category = products.some(
    (product) => product.categorySlug === requestedCategory,
  )
    ? requestedCategory!
    : "all";
  const requestedSort = searchParams.get("sort");
  const sort = requestedSort === "asc" || requestedSort === "desc"
    ? requestedSort
    : "";
  const [message, setMessage] = useState("");
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const categoryTriggerRef = useRef<HTMLButtonElement>(null);
  const categoryOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const sortTriggerRef = useRef<HTMLButtonElement>(null);
  const sortOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);
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
  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const matchingProducts = products.filter((product) => {
      const matchesCategory =
        category === "all" || product.categorySlug === category;
      const matchesSearch =
        !normalizedSearch ||
        [product.name, product.category, product.description]
          .some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
      return matchesCategory && matchesSearch;
    });

    if (sort) {
      const getStartingPrice = (product: Product) =>
        Math.min(
          ...product.packages.map(
            (item) =>
              item.promoPriceInCents ?? item.priceInCents,
          ),
        );
      matchingProducts.sort((a, b) =>
        sort === "asc"
          ? getStartingPrice(a) - getStartingPrice(b)
          : getStartingPrice(b) - getStartingPrice(a),
      );
    }

    return matchingProducts;
  }, [category, products, search, sort]);
  const selectedCategoryLabel =
    categories.find(([slug]) => slug === category)?.[1] ?? "All categories";
  const selectedSortLabel =
    SORT_OPTIONS.find(([value]) => value === sort)?.[1] ?? "Featured";

  function updateUrlParameter(
    key: "search" | "sort" | "category",
    value: string,
    replace = false,
  ) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    if (replace) {
      window.history.replaceState(null, "", nextUrl);
    } else {
      window.history.pushState(null, "", nextUrl);
    }
  }

  useEffect(() => {
    if (!isCategoryMenuOpen) return;
    const selectedIndex = categories.findIndex(([slug]) => slug === category);
    categoryOptionRefs.current[selectedIndex + 1]?.focus();
  }, [category, categories, isCategoryMenuOpen]);

  useEffect(() => {
    if (!isCategoryMenuOpen) return;

    function closeCategoryMenuOnOutsidePointerDown(event: PointerEvent) {
      const target = event.target;
      if (
        target instanceof Node &&
        !categoryMenuRef.current?.contains(target) &&
        !categoryTriggerRef.current?.contains(target)
      ) {
        setIsCategoryMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeCategoryMenuOnOutsidePointerDown);
    return () =>
      document.removeEventListener(
        "pointerdown",
        closeCategoryMenuOnOutsidePointerDown,
      );
  }, [isCategoryMenuOpen]);

  useEffect(() => {
    if (!isSortMenuOpen) return;

    function closeSortMenuOnOutsidePointerDown(event: PointerEvent) {
      const target = event.target;
      if (
        target instanceof Node &&
        !sortMenuRef.current?.contains(target) &&
        !sortTriggerRef.current?.contains(target)
      ) {
        setIsSortMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeSortMenuOnOutsidePointerDown);
    return () =>
      document.removeEventListener(
        "pointerdown",
        closeSortMenuOnOutsidePointerDown,
      );
  }, [isSortMenuOpen]);

  useEffect(() => {
    if (!isSortMenuOpen) return;
    const selectedIndex = SORT_OPTIONS.findIndex(([value]) => value === sort);
    sortOptionRefs.current[selectedIndex]?.focus();
  }, [isSortMenuOpen, sort]);

  function moveMenuFocus(
    event: React.KeyboardEvent<HTMLDivElement>,
    optionRefs: React.RefObject<Array<HTMLButtonElement | null>>,
    triggerRef: React.RefObject<HTMLButtonElement | null>,
    setMenuOpen: (open: boolean) => void,
  ) {
    if (event.key === "Escape") {
      event.preventDefault();
      setMenuOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();
    const options = optionRefs.current?.filter(
      (option): option is HTMLButtonElement => option !== null,
    ) ?? [];
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
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-neutral-900"
              htmlFor="marketplace-search"
            >
              Search products
            </label>
            <input
              autoComplete="off"
              className="min-h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              id="marketplace-search"
              maxLength={100}
              onChange={(event) =>
                updateUrlParameter("search", event.currentTarget.value, true)
              }
              placeholder="Search name, category, or description"
              type="search"
              value={search}
            />
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-neutral-900">
              Sort by price
            </span>
            <div className="relative" ref={sortMenuRef}>
              <button
                aria-controls="marketplace-sort-menu"
                aria-expanded={isSortMenuOpen}
                aria-haspopup="menu"
                className="flex min-h-11 w-full items-center justify-between rounded-lg border border-neutral-300 bg-white px-3 text-left text-base text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                onClick={() => setIsSortMenuOpen((open) => !open)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    setIsSortMenuOpen(true);
                  }
                }}
                ref={sortTriggerRef}
                type="button"
              >
                {selectedSortLabel}
                <svg
                  aria-hidden="true"
                  className={`ml-3 size-4 transition-transform ${isSortMenuOpen ? "rotate-180" : ""}`}
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
              {isSortMenuOpen && (
                <div
                  aria-label="Sort products by price"
                  className="absolute right-0 z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg"
                  id="marketplace-sort-menu"
                  onBlur={(event) => {
                    if (
                      event.relatedTarget &&
                      !event.currentTarget.contains(event.relatedTarget)
                    ) {
                      setIsSortMenuOpen(false);
                    }
                  }}
                  onKeyDown={(event) =>
                    moveMenuFocus(
                      event,
                      sortOptionRefs,
                      sortTriggerRef,
                      setIsSortMenuOpen,
                    )
                  }
                  role="menu"
                >
                  {SORT_OPTIONS.map(([value, label], index) => (
                    <button
                      aria-checked={sort === value}
                      className={`flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-neutral-900 ${
                        sort === value
                          ? "bg-neutral-100 font-semibold text-neutral-950"
                          : "text-neutral-700 hover:bg-neutral-50"
                      }`}
                      key={value || "featured"}
                      onClick={() => {
                        updateUrlParameter("sort", value);
                        setIsSortMenuOpen(false);
                        sortTriggerRef.current?.focus();
                      }}
                      ref={(element) => {
                        sortOptionRefs.current[index] = element;
                      }}
                      role="menuitemradio"
                      type="button"
                    >
                      {label}
                      {sort === value && (
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
          <div className="relative" ref={categoryMenuRef}>
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
                if (
                  event.relatedTarget &&
                  !event.currentTarget.contains(event.relatedTarget)
                ) {
                  setIsCategoryMenuOpen(false);
                }
              }}
              onKeyDown={(event) =>
                moveMenuFocus(
                  event,
                  categoryOptionRefs,
                  categoryTriggerRef,
                  setIsCategoryMenuOpen,
                )
              }
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
                    updateUrlParameter("category", slug === "all" ? "" : slug);
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
              if (result.success) {
                const promoUsed = cartItems
                  .filter(
                    (cartItem) =>
                      cartItem.product.id === item.id &&
                      cartItem.selectedPackage.promoPriceInCents !== undefined,
                  )
                  .reduce((quantity, cartItem) => quantity + cartItem.quantity, 0);
                const priceInCents =
                  selectedPackage.promoPriceInCents !== undefined &&
                  promoUsed < item.promoLicenseQuota
                    ? selectedPackage.promoPriceInCents
                    : selectedPackage.priceInCents;
                pushGa4EcommerceEvent("add_to_cart", {
                  currency: "USD",
                  value: priceInCents / 100,
                  items: [
                    {
                      item_id: item.id,
                      item_name: item.name,
                      item_category: item.category,
                      item_variant: selectedPackage.name,
                      price: priceInCents / 100,
                      quantity: 1,
                    },
                  ],
                });
              }
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
