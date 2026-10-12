"use client";

import {
  createContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/features/marketplace/types/product";

type CartAction =
  | { type: "add"; product: Product }
  | { type: "remove"; productId: string }
  | { type: "setQuantity"; productId: string; quantity: number }
  | { type: "clear" };

type CartContextValue = {
  items: CartItem[];
  dispatch: Dispatch<CartAction>;
};

export const CartContext = createContext<CartContextValue | null>(null);

function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "add": {
      const existing = items.find(
        ({ product }) => product.id === action.product.id,
      );

      return existing
        ? items.map((item) =>
            item.product.id === action.product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...items, { product: action.product, quantity: 1 }];
    }
    case "remove":
      return items.filter(({ product }) => product.id !== action.productId);
    case "setQuantity":
      return action.quantity <= 0
        ? items.filter(({ product }) => product.id !== action.productId)
        : items.map((item) =>
            item.product.id === action.productId
              ? { ...item, quantity: action.quantity }
              : item,
          );
    case "clear":
      return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  return (
    <CartContext.Provider value={{ items, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}
