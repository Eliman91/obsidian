"use client";

/* =============================================================
   ÉTAT GLOBAL — PANIER
   Provider React (Context + useReducer) pour un panier typé,
   persisté en localStorage. Consommé via le hook useCart().
   ============================================================= */

import {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

export interface CartLine {
  /** Variant ID Shopify (merchandiseId pour le checkout). */
  variantId: string;
  handle: string;
  title: string;
  imageUrl: string | null;
  unitPrice: number;
  currencyCode: string;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
}

type CartAction =
  | { type: "ADD"; line: CartLine }
  | { type: "REMOVE"; variantId: string }
  | { type: "SET_QTY"; variantId: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; state: CartState };

const STORAGE_KEY = "obsidian.cart.v1";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "ADD": {
      const existing = state.lines.find(
        (l) => l.variantId === action.line.variantId,
      );
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.variantId === action.line.variantId
              ? { ...l, quantity: l.quantity + action.line.quantity }
              : l,
          ),
        };
      }
      return { lines: [...state.lines, action.line] };
    }
    case "REMOVE":
      return { lines: state.lines.filter((l) => l.variantId !== action.variantId) };
    case "SET_QTY":
      return {
        lines: state.lines
          .map((l) =>
            l.variantId === action.variantId
              ? { ...l, quantity: Math.max(0, action.quantity) }
              : l,
          )
          .filter((l) => l.quantity > 0),
      };
    case "CLEAR":
      return { lines: [] };
    default:
      return state;
  }
}

export interface CartContextValue {
  lines: CartLine[];
  totalQuantity: number;
  subtotal: number;
  currencyCode: string;
  addLine: (line: CartLine) => void;
  removeLine: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { lines: [] });

  // Hydratation depuis localStorage (client uniquement).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", state: JSON.parse(raw) as CartState });
    } catch {
      /* localStorage indisponible : on ignore silencieusement. */
    }
  }, []);

  // Persistance à chaque changement.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota / mode privé : on ignore. */
    }
  }, [state]);

  const value = useMemo<CartContextValue>(() => {
    const totalQuantity = state.lines.reduce((sum, l) => sum + l.quantity, 0);
    const subtotal = state.lines.reduce(
      (sum, l) => sum + l.unitPrice * l.quantity,
      0,
    );
    return {
      lines: state.lines,
      totalQuantity,
      subtotal,
      currencyCode: state.lines[0]?.currencyCode ?? "EUR",
      addLine: (line) => dispatch({ type: "ADD", line }),
      removeLine: (variantId) => dispatch({ type: "REMOVE", variantId }),
      setQuantity: (variantId, quantity) =>
        dispatch({ type: "SET_QTY", variantId, quantity }),
      clear: () => dispatch({ type: "CLEAR" }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
