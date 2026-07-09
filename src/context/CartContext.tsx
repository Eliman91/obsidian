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

/** Attribut de ligne (line item property Shopify), ex. le texte de gravure. */
export interface CartLineAttribute {
  key: string;
  value: string;
}

export interface CartLine {
  /** Variant ID Shopify (merchandiseId pour le checkout). */
  variantId: string;
  handle: string;
  title: string;
  /** Descriptif de la variante choisie (ex. « 9 / Gravure personnalisée »). */
  variantTitle?: string;
  imageUrl: string | null;
  unitPrice: number;
  currencyCode: string;
  quantity: number;
  /** Attributs de ligne (gravure…). Deux lignes identiques SAUF attributs = 2 lignes. */
  attributes?: CartLineAttribute[];
}

/** Ligne enrichie d'un identifiant stable (variante + attributs). */
export type IdentifiedCartLine = CartLine & { id: string };

interface CartState {
  lines: CartLine[];
}

/**
 * Identité d'une ligne = variante + attributs sérialisés. Ainsi une bague
 * gravée « MARIE » et une gravée « PAUL » (même variantId) restent 2 lignes,
 * et deux ajouts identiques fusionnent bien leurs quantités.
 */
function lineId(line: CartLine): string {
  const attrs = line.attributes?.length
    ? line.attributes
        .map((a) => `${a.key}=${a.value}`)
        .sort()
        .join("|")
    : "";
  return attrs ? `${line.variantId}#${attrs}` : line.variantId;
}

type CartAction =
  | { type: "ADD"; line: CartLine }
  | { type: "REMOVE"; id: string }
  | { type: "SET_QTY"; id: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; state: CartState };

const STORAGE_KEY = "obsidian.cart.v1";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "ADD": {
      const id = lineId(action.line);
      const existing = state.lines.find((l) => lineId(l) === id);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            lineId(l) === id
              ? { ...l, quantity: l.quantity + action.line.quantity }
              : l,
          ),
        };
      }
      return { lines: [...state.lines, action.line] };
    }
    case "REMOVE":
      return { lines: state.lines.filter((l) => lineId(l) !== action.id) };
    case "SET_QTY":
      return {
        lines: state.lines
          .map((l) =>
            lineId(l) === action.id
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
  lines: IdentifiedCartLine[];
  totalQuantity: number;
  subtotal: number;
  currencyCode: string;
  addLine: (line: CartLine) => void;
  removeLine: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
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
      lines: state.lines.map((l) => ({ ...l, id: lineId(l) })),
      totalQuantity,
      subtotal,
      currencyCode: state.lines[0]?.currencyCode ?? "EUR",
      addLine: (line) => dispatch({ type: "ADD", line }),
      removeLine: (id) => dispatch({ type: "REMOVE", id }),
      setQuantity: (id, quantity) => dispatch({ type: "SET_QTY", id, quantity }),
      clear: () => dispatch({ type: "CLEAR" }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
