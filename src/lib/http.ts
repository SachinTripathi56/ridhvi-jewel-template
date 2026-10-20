// Lightweight fetch wrapper for your own backend API.
// Reads VITE_API_BASE_URL at build time. Auth token comes from Clerk
// (window.Clerk.session.getToken()), so logged-in calls are sent as
// `Authorization: Bearer <clerk-jwt>`.
//
// ALL backend responses are wrapped in ApiResponse<T>:
//   { success: boolean, data: T, error?: string, message?: string }
// This wrapper automatically unwraps them so callers receive T directly.

export const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? "";

export class HttpError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any) {
    super(typeof body === "string" ? body : body?.message ?? body?.error ?? `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

// Module-level token getter — can be injected by auth-context
// so we don't rely on window.Clerk timing.
let _injectedTokenGetter: (() => Promise<string | null>) | null = null;
export function setTokenGetter(fn: (() => Promise<string | null>) | null) {
  _injectedTokenGetter = fn;
}

export async function getClerkToken(): Promise<string | null> {
  // Prefer the injected getter (set by auth-context from Clerk hook)
  if (_injectedTokenGetter) {
    try { return await _injectedTokenGetter(); } catch { /* ignore */ }
  }
  // Fallback: window.Clerk global (may not be set yet on first render)
  if (typeof window === "undefined") return null;
  const clerk = (window as any).Clerk;
  try {
    if (clerk?.session) return await clerk.session.getToken();
  } catch {
    /* ignore */
  }
  return null;
}

export async function http<T = any>(
  path: string,
  opts: RequestInit & { json?: any } = {},
): Promise<T> {
  if (!API_BASE) throw new HttpError(0, "VITE_API_BASE_URL not configured");

  const headers = new Headers(opts.headers);
  if (opts.json !== undefined) {
    headers.set("Content-Type", "application/json");
    opts.body = JSON.stringify(opts.json);
  }
  const tok = await getClerkToken();
  if (tok) headers.set("Authorization", `Bearer ${tok}`);

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const ct = res.headers.get("content-type") ?? "";
  const raw = ct.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text();

  if (!res.ok) {
    // Extract error message from ApiResponse wrapper if present
    const errMsg =
      raw && typeof raw === "object"
        ? (raw.error ?? raw.message ?? `HTTP ${res.status}`)
        : (raw ?? `HTTP ${res.status}`);
    throw new HttpError(res.status, errMsg);
  }

  // Unwrap Spring Boot ApiResponse<T> → { success, data, message, timestamp }
  if (raw && typeof raw === "object" && "success" in raw && "data" in raw) {
    if (!raw.success) {
      throw new HttpError(res.status, raw.error || raw.message || "Request failed");
    }
    return raw.data as T;
  }

  return raw as T;
}

export const apiAvailable = () => Boolean(API_BASE);

// Backwards-compat shim: some older code imported `auth` from this module.
// Token storage is owned by Clerk now, so these are no-ops.
export const auth = {
  get token() {
    return null as string | null;
  },
  setTokens(_t: string, _r?: string) {},
  clear() {},
};
