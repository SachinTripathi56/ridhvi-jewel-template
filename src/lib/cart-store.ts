/**
 * Cart store — backend-authoritative when backend is available.
 *
 * Backend uses cart item UUIDs for updates/removes, so we cache the last
 * fetched cart state and use item IDs for mutations.
 *
 * Public API:
 *   cart.add(productId, qty)       → POST /cart/items
 *   cart.remove(itemId)            → DELETE /cart/items/{id}  (backend item UUID)
 *   cart.update(itemId, qty)       → PUT  /cart/items/{id}
 *   cart.clear()                   → DELETE /cart
 *   cart.fetch()                   → GET /cart  (returns BackendCart | null)
 *   useCartCount()                 → reactive count for navbar badge
 */

import { useEffect, useState } from "react";
import { api } from "./api";
import { apiAvailable } from "./http";
import type { BackendCart } from "./types";

// ── local count cache (just for the navbar badge) ──────────────────────────
const COUNT_KEY = "parvior_cart_count_v1";
const listeners = new Set<() => void>();

function readCount(): number {
  if (typeof window === "undefined") return 0;
  try { return Number(localStorage.getItem(COUNT_KEY) ?? "0"); } catch { return 0; }
}
function writeCount(n: number) {
  localStorage.setItem(COUNT_KEY, String(n));
  listeners.forEach((l) => l());
}
function notifyCount() { listeners.forEach((l) => l()); }

export const cart = {
  /** Add item to backend cart; updates local count badge */
  async add(productId: string, qty = 1): Promise<void> {
    if (apiAvailable()) {
      try {
        const updated: BackendCart = await api.addToCart(productId, qty);
        if (updated) writeCount(updated.totalItems ?? (readCount() + qty));
      } catch (err) {
        // If backend fails, still bump local count so UI feels snappy
        writeCount(readCount() + qty);
        throw err;
      }
    } else {
      writeCount(readCount() + qty);
    }
  },

  /** Remove an item by its backend cart-item UUID */
  async remove(itemId: string, qtyRemoved = 1): Promise<void> {
    if (apiAvailable()) {
      try {
        await api.removeCartItem(itemId);
        writeCount(Math.max(0, readCount() - qtyRemoved));
      } catch (err) {
        throw err;
      }
    } else {
      writeCount(Math.max(0, readCount() - qtyRemoved));
    }
  },

  /** Update quantity for a backend cart-item UUID */
  async update(itemId: string, quantity: number): Promise<void> {
    if (quantity <= 0) return cart.remove(itemId);
    if (apiAvailable()) {
      await api.updateCartItem(itemId, quantity);
      // Re-fetch will update the actual items; badge stays same
    }
  },

  /** Clear all items */
  async clear(): Promise<void> {
    if (apiAvailable()) {
      await api.clearCart().catch(() => {});
    }
    writeCount(0);
  },

  /** Fetch full cart from backend (used by CartPage) */
  async fetch(): Promise<BackendCart | null> {
    if (!apiAvailable()) return null;
    try {
      const data: BackendCart = await api.getCart();
      if (data) writeCount(data.totalItems ?? 0);
      return data ?? null;
    } catch {
      return null;
    }
  },

  /** Call once on sign-in to sync count badge */
  async hydrate() {
    if (!apiAvailable()) return;
    try {
      const data: BackendCart = await api.getCart();
      if (data) writeCount(data.totalItems ?? 0);
    } catch {}
  },
};

/** Reactive count for the navbar badge */
export function useCartCount(): number {
  const [count, setCount] = useState<number>(0);
  useEffect(() => {
    setCount(readCount());
    const l = () => setCount(readCount());
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return count;
}

// Legacy hook — kept so nothing breaks; just returns count as array length shim
export function useCart() {
  const count = useCartCount();
  return Array.from({ length: count }, (_, i) => ({ productId: String(i), quantity: 1 }));
}
