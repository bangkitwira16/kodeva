import { describe, expect, it } from "@jest/globals";
import {
  getVoucherDiscountInCents,
  normalizeVoucherCode,
  validateVoucher,
  VOUCHERS,
} from "@/features/marketplace/services/vouchers";
import { getCartPricing } from "@/features/marketplace/services/cart-pricing";
import { useCartStore } from "@/features/marketplace/stores/cart.store";
import type { CartItem, Product, ProductPackage } from "@/features/marketplace/types/product";

const product: Product = {
  id: "voucher-test",
  slug: "voucher-test",
  name: "Voucher Test Product",
  description: "A product fixture for voucher testing.",
  category: "Business",
  categorySlug: "business",
  imageUrl: null,
  imageAlt: "Voucher test product",
  screenshots: [],
  remainingLicenses: 10,
  promoLicenseQuota: 0,
  packages: [],
};

const packageFixture: ProductPackage = {
  id: "basic",
  name: "Basic",
  priceInCents: 6000,
};

const cart: CartItem[] = [
  { product, selectedPackage: packageFixture, quantity: 1 },
];

describe("voucher validation", () => {
  beforeEach(() => {
    useCartStore.setState({
      items: cart,
      appliedVoucherCode: null,
      voucherRedemptionCounts: {},
      hasHydrated: true,
    });
  });

  it("normalizes voucher codes by trimming whitespace and ignoring case", () => {
    expect(normalizeVoucherCode("  welcome10 ")).toBe("WELCOME10");
    expect(validateVoucher(" welcome10 ", 5000, 0)).toMatchObject({
      valid: true,
      voucher: { code: "WELCOME10" },
    });
  });

  it("rejects unknown voucher codes", () => {
    expect(validateVoucher("NOT-A-CODE", 10000, 0)).toMatchObject({
      valid: false,
      reason: "unknown",
    });
  });

  it("rejects inactive vouchers even when spend and quota otherwise qualify", () => {
    const inactive = VOUCHERS.find(({ code }) => code === "PAUSED20");
    expect(inactive).toBeDefined();
    expect(validateVoucher("PAUSED20", 100000, 0)).toMatchObject({
      valid: false,
      reason: "inactive",
    });
  });

  it("rejects WELCOME10 below its minimum subtotal and accepts the exact minimum", () => {
    expect(validateVoucher("WELCOME10", 4999, 0)).toMatchObject({
      valid: false,
      reason: "minimum",
    });
    expect(validateVoucher("WELCOME10", 5000, 0)).toMatchObject({
      valid: true,
      voucher: { code: "WELCOME10" },
    });
  });

  it("rejects vouchers at their redemption quota but allows one redemption before the limit", () => {
    expect(validateVoucher("SAVE5", 1000, 49)).toMatchObject({
      valid: true,
    });
    expect(validateVoucher("SAVE5", 1000, 50)).toMatchObject({
      valid: false,
      reason: "quota",
    });
    expect(validateVoucher("SAVE5", 1000, 51)).toMatchObject({
      valid: false,
      reason: "quota",
    });
  });

  it("applies percentage discounts using whole cents and caps fixed discounts at the subtotal", () => {
    const percentageVoucher = VOUCHERS.find(
      ({ code }) => code === "WELCOME10",
    );
    const fixedVoucher = VOUCHERS.find(({ code }) => code === "SAVE5");
    if (!percentageVoucher || !fixedVoucher) {
      throw new Error("Expected voucher fixtures are missing.");
    }

    expect(getVoucherDiscountInCents(percentageVoucher, 5555)).toBe(555);
    expect(getVoucherDiscountInCents(fixedVoucher, 499)).toBe(499);
    expect(getVoucherDiscountInCents(fixedVoucher, 1200)).toBe(500);
  });

  it("includes an applied voucher in cart pricing and leaves invalid vouchers unapplied", () => {
    const discounted = getCartPricing(cart, "SAVE5");
    const belowMinimumCart: CartItem[] = [
      {
        product,
        selectedPackage: { ...packageFixture, priceInCents: 4999 },
        quantity: 1,
      },
    ];
    const invalid = getCartPricing(belowMinimumCart, "WELCOME10");

    expect(discounted).toMatchObject({
      subtotalInCents: 6000,
      voucherDiscountInCents: 500,
      appliedVoucherCode: "SAVE5",
      totalInCents: 5500,
      voucherValidation: { valid: true },
    });
    expect(invalid).toMatchObject({
      subtotalInCents: 4999,
      voucherDiscountInCents: 0,
      appliedVoucherCode: null,
      totalInCents: 4999,
      voucherValidation: { valid: false, reason: "minimum" },
    });
  });

  it("uses normalized codes when checking redemption counts", () => {
    const pricing = getCartPricing(cart, "save5", { SAVE5: 50 });

    expect(pricing.voucherValidation).toMatchObject({
      valid: false,
      reason: "quota",
    });
    expect(pricing.totalInCents).toBe(6000);
  });

  it("applies a valid voucher to the cart store and rejects invalid applications", () => {
    const store = useCartStore.getState();

    expect(store.applyVoucher("WELCOME10")).toMatchObject({
      success: true,
      message: expect.stringContaining("applied successfully"),
    });
    expect(useCartStore.getState().appliedVoucherCode).toBe("WELCOME10");

    useCartStore.getState().removeVoucher();
    expect(useCartStore.getState().applyVoucher("PAUSED20").success).toBe(
      false,
    );
    expect(useCartStore.getState().applyVoucher("UNKNOWN").success).toBe(false);
    expect(useCartStore.getState().appliedVoucherCode).toBeNull();
  });

  it("blocks applying a voucher that has reached its store redemption quota", () => {
    useCartStore.setState({
      voucherRedemptionCounts: { SAVE5: 50 },
    });

    const result = useCartStore.getState().applyVoucher("SAVE5");

    expect(result).toMatchObject({
      success: false,
      message: expect.stringContaining("usage limit"),
    });
    expect(useCartStore.getState().appliedVoucherCode).toBeNull();
  });

  it("consumes one redemption after a successful checkout action", () => {
    useCartStore.getState().applyVoucher("SAVE5");

    expect(useCartStore.getState().redeemAppliedVoucher()).toBe(true);
    expect(useCartStore.getState().voucherRedemptionCounts.SAVE5).toBe(1);
    expect(useCartStore.getState().appliedVoucherCode).toBeNull();
    expect(useCartStore.getState().redeemAppliedVoucher()).toBe(false);
  });
});
