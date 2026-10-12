export type Ga4EcommerceItem = {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
};

export type Ga4EcommerceData = {
  currency?: string;
  value?: number;
  items: Ga4EcommerceItem[];
};

export type Ga4EcommerceEvent =
  | "view_item"
  | "add_to_cart"
  | "begin_checkout";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const pushedDedupeKeys = new Set<string>();

export function pushGa4EcommerceEvent(
  event: Ga4EcommerceEvent,
  ecommerce: Ga4EcommerceData,
  dedupeKey?: string,
): boolean {
  if (typeof window === "undefined") return false;

  if (dedupeKey && pushedDedupeKeys.has(dedupeKey)) return false;
  if (dedupeKey) {
    if (pushedDedupeKeys.size >= 500) pushedDedupeKeys.clear();
    pushedDedupeKeys.add(dedupeKey);
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({ event, ecommerce });
  return true;
}
