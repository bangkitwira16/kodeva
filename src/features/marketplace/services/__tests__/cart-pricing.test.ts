import { beforeEach, describe, expect, it } from "@jest/globals";
import { getCartPricing } from "@/features/marketplace/services/cart-pricing";
import { useCartStore } from "@/features/marketplace/stores/cart.store";
import type {
  CartItem,
  Product,
  ProductPackage,
} from "@/features/marketplace/types/product";

const productPackages: ProductPackage[] = [
  { id: "basic", name: "Basic", priceInCents: 1000, promoPriceInCents: 800 },
  { id: "pro", name: "Pro", priceInCents: 2500, promoPriceInCents: 2000 },
  {
    id: "business",
    name: "Business",
    priceInCents: 5000,
    promoPriceInCents: 4000,
  },
];

const product: Product = {
  id: "product-1",
  slug: "product-1",
  name: "Test Product",
  description: "A product for pricing tests.",
  category: "Operations",
  categorySlug: "operations",
  imageUrl: null,
  imageAlt: "Test product",
  screenshots: [],
  remainingLicenses: 20,
  promoLicenseQuota: 3,
  packages: productPackages,
};

function cartItem(
  selectedPackage: ProductPackage,
  quantity: number,
  billingPeriod: "monthly" | "annually" = "monthly",
): CartItem {
  return { product, selectedPackage, quantity, billingPeriod };
}

describe("cart quota validation", () => {
  beforeEach(() => {
    useCartStore.setState({
      items: [],
      appliedVoucherCode: null,
      voucherRedemptionCounts: {},
      hasHydrated: true,
    });
  });

  it("accepts quantities up to the remaining product license quota", () => {
    const store = useCartStore.getState();

    expect(store.addItem(product, productPackages[0])).toEqual({
      success: true,
    });
    expect(
      useCartStore
        .getState()
        .setQuantity(product.id, "basic", product.remainingLicenses),
    ).toEqual({ success: true });
    expect(useCartStore.getState().items[0]?.quantity).toBe(20);
  });

  it("rejects additions that exceed combined remaining licenses across packages and billing periods", () => {
    const store = useCartStore.getState();
    store.addItem(product, productPackages[0], "monthly");
    useCartStore
      .getState()
      .setQuantity(product.id, "basic", 19, "monthly");
    const finalAvailableLicense = useCartStore
      .getState()
      .addItem(product, productPackages[1], "annually");
    const result = useCartStore
      .getState()
      .addItem(product, productPackages[2], "monthly");

    expect(finalAvailableLicense.success).toBe(true);
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/only 20 licenses/i);
    expect(useCartStore.getState().items).toHaveLength(2);
    expect(useCartStore.getState().items[1]?.quantity).toBe(1);
  });

  it("rejects non-positive and non-integer quantities", () => {
    useCartStore.getState().addItem(product, productPackages[0]);

    expect(
      useCartStore.getState().setQuantity(product.id, "basic", 0),
    ).toMatchObject({ success: false });
    expect(
      useCartStore.getState().setQuantity(product.id, "basic", 1.5),
    ).toMatchObject({ success: false });
  });

  it("allocates the shared promotional quota across package variants and charges regular price above it", () => {
    const pricing = getCartPricing([
      cartItem(productPackages[0], 2),
      cartItem(productPackages[1], 2),
    ]);

    expect(pricing.items.map(({ promoQuantity }) => promoQuantity)).toEqual([
      2, 1,
    ]);
    expect(pricing.subtotalInCents).toBe(800 * 2 + 2000 + 2500);
    expect(pricing.totalInCents).toBe(pricing.subtotalInCents);
  });
});

describe("cart totals", () => {
  it("calculates independent Basic, Pro, and Business package prices", () => {
    const pricing = getCartPricing([
      cartItem(productPackages[0], 1),
      cartItem(productPackages[1], 1),
      cartItem(productPackages[2], 1),
    ]);

    expect(pricing.items.map(({ totalInCents }) => totalInCents)).toEqual([
      800, 2000, 4000,
    ]);
    expect(pricing.subtotalInCents).toBe(6800);
    expect(pricing.totalInCents).toBe(6800);
  });

  it("uses regular price for quantities beyond the promo quota", () => {
    const pricing = getCartPricing([cartItem(productPackages[0], 5)]);

    expect(pricing.items[0]?.promoQuantity).toBe(3);
    expect(pricing.items[0]?.totalInCents).toBe(800 * 3 + 1000 * 2);
    expect(pricing.subtotalInCents).toBe(4400);
  });

  it("applies the annual billing multiplier before summing quantity", () => {
    const pricing = getCartPricing([
      cartItem(productPackages[1], 2, "annually"),
    ]);

    expect(pricing.items[0]?.totalInCents).toBe(19200 * 2);
    expect(pricing.subtotalInCents).toBe(38400);
  });

  it("updates the cart total after a quantity change", () => {
    const store = useCartStore.getState();
    store.addItem(product, productPackages[0]);
    store.setQuantity(product.id, "basic", 2);

    expect(getCartPricing(useCartStore.getState().items).subtotalInCents).toBe(
      1600,
    );
  });

  it("returns a zero subtotal for an empty cart", () => {
    expect(getCartPricing([])).toMatchObject({
      items: [],
      subtotalInCents: 0,
      voucherDiscountInCents: 0,
      totalInCents: 0,
    });
  });
});
