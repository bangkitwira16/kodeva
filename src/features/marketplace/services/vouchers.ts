export type Voucher = {
  code: string;
  active: boolean;
  minimumSubtotalInCents: number;
  maxRedemptions: number;
  discount:
    | { type: "percentage"; value: number }
    | { type: "fixed"; valueInCents: number };
};

export type VoucherValidation =
  | { valid: true; voucher: Voucher }
  | {
      valid: false;
      reason: "unknown" | "inactive" | "minimum" | "quota";
      message: string;
    };

export const VOUCHERS: readonly Voucher[] = [
  {
    code: "WELCOME10",
    active: true,
    minimumSubtotalInCents: 5000,
    maxRedemptions: 100,
    discount: { type: "percentage", value: 10 },
  },
  {
    code: "SAVE5",
    active: true,
    minimumSubtotalInCents: 0,
    maxRedemptions: 50,
    discount: { type: "fixed", valueInCents: 500 },
  },
  {
    code: "PAUSED20",
    active: false,
    minimumSubtotalInCents: 0,
    maxRedemptions: 25,
    discount: { type: "percentage", value: 20 },
  },
];

export function normalizeVoucherCode(code: string): string {
  return code.trim().toUpperCase();
}

export function validateVoucher(
  code: string,
  subtotalInCents: number,
  usedRedemptions: number,
): VoucherValidation {
  const normalizedCode = normalizeVoucherCode(code);
  const voucher = VOUCHERS.find((candidate) => candidate.code === normalizedCode);

  if (!voucher) {
    return {
      valid: false,
      reason: "unknown",
      message: "That voucher code was not found.",
    };
  }
  if (!voucher.active) {
    return {
      valid: false,
      reason: "inactive",
      message: "That voucher is no longer active.",
    };
  }
  if (usedRedemptions >= voucher.maxRedemptions) {
    return {
      valid: false,
      reason: "quota",
      message: "That voucher has reached its usage limit.",
    };
  }
  if (subtotalInCents < voucher.minimumSubtotalInCents) {
    return {
      valid: false,
      reason: "minimum",
      message: `Add ${formatVoucherCurrency(voucher.minimumSubtotalInCents - subtotalInCents)} more to use this voucher.`,
    };
  }

  return { valid: true, voucher };
}

export function getVoucherDiscountInCents(
  voucher: Voucher,
  subtotalInCents: number,
): number {
  const rawDiscount =
    voucher.discount.type === "percentage"
      ? Math.floor((subtotalInCents * voucher.discount.value) / 100)
      : voucher.discount.valueInCents;

  return Math.min(subtotalInCents, Math.max(0, rawDiscount));
}

function formatVoucherCurrency(amountInCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountInCents / 100);
}
