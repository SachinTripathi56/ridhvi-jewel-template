import { useEffect, useState } from "react";

const KEY = "parvior.admin.session";
const CREDS_KEY = "parvior.admin.creds";

export type AdminCreds = { email: string; password: string };

// Seed default admin (change from Admin → Settings)
export function getCreds(): AdminCreds {
  if (typeof window === "undefined") return { email: "admin@parvior.com", password: "parvior123" };
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const seed = { email: "admin@parvior.com", password: "parvior123" };
  localStorage.setItem(CREDS_KEY, JSON.stringify(seed));
  return seed;
}

export function setCreds(c: AdminCreds) {
  localStorage.setItem(CREDS_KEY, JSON.stringify(c));
  window.dispatchEvent(new Event("admin-auth:update"));
}

export function signIn(email: string, password: string): boolean {
  const c = getCreds();
  if (email.trim().toLowerCase() === c.email.toLowerCase() && password === c.password) {
    localStorage.setItem(KEY, "1");
    window.dispatchEvent(new Event("admin-auth:update"));
    return true;
  }
  return false;
}

export function signOut() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("admin-auth:update"));
}

export function useAdminAuth() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    const read = () => setSignedIn(typeof window !== "undefined" && localStorage.getItem(KEY) === "1");
    read();
    window.addEventListener("admin-auth:update", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("admin-auth:update", read);
      window.removeEventListener("storage", read);
    };
  }, []);
  return signedIn;
}
