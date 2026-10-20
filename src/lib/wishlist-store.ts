// Wishlist store — syncs with backend when apiAvailable(), falls back to localStorage.
// The store always exposes a string[] of productIds for compatibility.
import { useEffect, useState } from "react";
import { api } from "./api";
import { apiAvailable } from "./http";

const KEY = "parvior_wishlist_v1";
const listeners = new Set<() => void>();

function readLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}
function writeLocal(ids: string[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  listeners.forEach((l) => l());
}
function notify() {
  listeners.forEach((l) => l());
}

export const wishlist = {
  get: readLocal,

  async toggle(id: string): Promise<void> {
    const ids = readLocal();
    const has = ids.includes(id);
    if (apiAvailable()) {
      if (has) {
        writeLocal(ids.filter((x) => x !== id));
        await api.removeFromWishlist(id).catch(() => {});
      } else {
        writeLocal([...ids, id]);
        await api.addToWishlist(id).catch(() => {});
      }
    } else {
      writeLocal(has ? ids.filter((x) => x !== id) : [...ids, id]);
    }
  },

  remove(id: string) {
    writeLocal(readLocal().filter((x) => x !== id));
    if (apiAvailable()) api.removeFromWishlist(id).catch(() => {});
  },

  has(id: string) {
    return readLocal().includes(id);
  },

  clear() {
    writeLocal([]);
  },

  /** Call once on app load / sign-in to hydrate from backend */
  async hydrate(): Promise<void> {
    if (!apiAvailable()) return;
    try {
      const ids = await api.listWishlist();
      writeLocal(ids);
      notify();
    } catch {
      // silently fail — local state is fine
    }
  },
};

export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(readLocal());
    const l = () => setIds(readLocal());
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return ids;
}
