"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";

// The bag (cart) for this site: beans (250 g, with a grind) and bakes. One context, persisted in localStorage,
// read by the nav (count), the bean bags and bake shelf ("Add" buttons) and the BagDrawer (the list + order).
// Nothing is sent anywhere: "Order on WhatsApp" opens WhatsApp with the order typed out (as the contact form does).

export type CartKind = "beans" | "bake";
export type CartItem = {
  id: string; // `${kind}:${name}:${variant}`
  kind: CartKind;
  name: string;
  variant?: string; // the grind for beans, "Out at 8 am" etc. for bakes
  price: number;
  qty: number;
  image?: string; // bakes have a photo; beans draw their label with colours
  label?: string;
  ink?: string;
};

type State = { items: CartItem[]; open: boolean; last?: string };
type Action =
  | { type: "add"; item: Omit<CartItem, "qty" | "id">; qty?: number }
  | { type: "qty"; id: string; qty: number }
  | { type: "remove"; id: string }
  | { type: "clear" }
  | { type: "open"; open: boolean }
  | { type: "load"; items: CartItem[] };

const KEY = "aura-roast:bag";
const makeId = (i: { kind: CartKind; name: string; variant?: string }) => `${i.kind}:${i.name}:${i.variant ?? ""}`;

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "add": {
      const id = makeId(a.item);
      const qty = a.qty ?? 1;
      const has = s.items.find((i) => i.id === id);
      const items = has ? s.items.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i)) : [...s.items, { ...a.item, id, qty }];
      return { ...s, items, last: id };
    }
    case "qty":
      return { ...s, items: a.qty <= 0 ? s.items.filter((i) => i.id !== a.id) : s.items.map((i) => (i.id === a.id ? { ...i, qty: a.qty } : i)) };
    case "remove":
      return { ...s, items: s.items.filter((i) => i.id !== a.id) };
    case "clear":
      return { ...s, items: [] };
    case "open":
      return { ...s, open: a.open };
    case "load":
      return { ...s, items: a.items };
  }
}

type Cart = {
  items: CartItem[];
  count: number;
  subtotal: number;
  open: boolean;
  last?: string;
  hydrated: boolean;
  add: (item: Omit<CartItem, "qty" | "id">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
  has: (kind: CartKind, name: string, variant?: string) => boolean;
};

const CartContext = createContext<Cart | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], open: false });
  const [hydrated, setHydrated] = useState(false);

  // load once on the client, then keep localStorage in step
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const items = JSON.parse(raw) as CartItem[];
        if (Array.isArray(items)) dispatch({ type: "load", items: items.filter((i) => i && i.id && i.qty > 0) });
      }
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state.items));
    } catch {}
  }, [state.items, hydrated]);

  const add = useCallback((item: Omit<CartItem, "qty" | "id">, qty?: number) => dispatch({ type: "add", item, qty }), []);
  const setQty = useCallback((id: string, qty: number) => dispatch({ type: "qty", id, qty }), []);
  const remove = useCallback((id: string) => dispatch({ type: "remove", id }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);
  const setOpen = useCallback((open: boolean) => dispatch({ type: "open", open }), []);

  const value = useMemo<Cart>(() => {
    const count = state.items.reduce((n, i) => n + i.qty, 0);
    const subtotal = state.items.reduce((n, i) => n + i.qty * i.price, 0);
    return {
      items: state.items,
      count,
      subtotal,
      open: state.open,
      last: state.last,
      hydrated,
      add,
      setQty,
      remove,
      clear,
      setOpen,
      has: (kind, name, variant) => state.items.some((i) => i.id === makeId({ kind, name, variant })),
    };
  }, [state, hydrated, add, setQty, remove, clear, setOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): Cart {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart needs <CartProvider>");
  return c;
}

export const cartId = makeId;
