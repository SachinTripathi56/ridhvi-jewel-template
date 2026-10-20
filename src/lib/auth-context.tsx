// Thin adapter around Clerk so the rest of the app can keep using `useAuth()`
// with the same shape it had before. Authentication itself is handled by Clerk.
//
// Role resolution (in priority order):
//   1. Backend /auth/me response  ← AUTHORITATIVE (DB source of truth)
//   2. Clerk publicMetadata.role  ← fallback if backend not available
//   3. "USER"                     ← default
//
// On first sign-in, we call POST /auth/sync to register/update the user in
// the Spring Boot DB. Immediately after (and on every load while signed-in),
// we call GET /auth/me to read the real DB role.

import { useMemo, useEffect, useState } from "react";
import {
  useUser,
  useClerk,
  useAuth as useClerkAuth,
} from "@clerk/clerk-react";
import type { ReactNode } from "react";
import { api } from "./api";
import { apiAvailable, setTokenGetter } from "./http";

// All roles the backend knows about
export type BackendRole = "SUPER_ADMIN" | "ADMIN" | "STAFF" | "USER";
// Simplified role exposed to the frontend
export type Role = "USER" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  backendRole?: BackendRole; // raw DB role for display/debug
  avatar?: string;
}

const CLERK_ENABLED = Boolean(
  (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY,
);

// Passthrough — real provider is <ClerkProvider> in src/main.tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** Roles that get admin access in the frontend */
const ADMIN_ROLES: BackendRole[] = ["SUPER_ADMIN", "ADMIN", "STAFF"];

function resolveAdminRole(rawRole: string | null | undefined): Role {
  if (!rawRole) return "USER";
  return ADMIN_ROLES.includes(rawRole as BackendRole) ? "ADMIN" : "USER";
}

function useClerkBasedAuth() {
  const { isLoaded, isSignedIn, signOut, sessionClaims, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const clerk = useClerk();

  // Backend role state — null means "not yet fetched"
  const [backendRole, setBackendRole] = useState<BackendRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !clerkUser) {
      setTokenGetter(null);
      setBackendRole(null);
      setRoleLoading(false);
      return;
    }

    // Step 1 — inject token getter BEFORE any fetch so Bearer header is set
    setTokenGetter(getToken);

    // Step 2 — sync user to DB (once per browser session)
    if (apiAvailable()) {
      const syncKey = `parvior_synced_${clerkUser.id}`;
      if (!sessionStorage.getItem(syncKey)) {
        sessionStorage.setItem(syncKey, "1");
        api
          .syncUser({
            clerkUserId: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
            firstName: clerkUser.firstName ?? "",
            lastName: clerkUser.lastName ?? "",
            profileImageUrl: clerkUser.imageUrl,
          })
          .catch((err) => {
            sessionStorage.removeItem(syncKey);
            console.warn("[auth] sync failed:", err.message);
          });
      }

      // Hydrate cart count badge and wishlist from backend (fire-and-forget)
      import("./cart-store").then(({ cart }) => cart.hydrate().catch(() => {}));
      import("./wishlist-store").then(({ wishlist }) => wishlist.hydrate().catch(() => {}));

      // Step 3 — fetch real role from backend.
      let cancelled = false;
      setRoleLoading(true);
      api
        .getMe()
        .then((me: any) => {
          if (!cancelled && me?.role) setBackendRole(me.role as BackendRole);
        })
        .catch((err) => {
          if (!cancelled)
            console.warn("[auth] getMe failed:", err.message, "— role defaults to USER");
        })
        .finally(() => {
          if (!cancelled) setRoleLoading(false);
        });

      return () => { cancelled = true; };
    } else {
      setRoleLoading(false);
    }
  }, [isLoaded, isSignedIn, clerkUser, getToken]);


  return useMemo(() => {
    if (!isSignedIn || !clerkUser) {
      return {
        user: null as AuthUser | null,
        loading: !isLoaded || roleLoading,
        async login() { window.location.href = "/login"; },
        async register() { window.location.href = "/register"; },
        loginWithGoogle() { clerk.openSignIn?.({ redirectUrl: window.location.href }); },
        logout() { signOut({ redirectUrl: "/" }); },
        hasRole: (_r: Role) => false,
      };
    }

    // Determine effective role:
    // backendRole (from DB) > Clerk publicMetadata.role > "USER"
    const rawRole: string =
      backendRole ??
      (clerkUser.publicMetadata?.role as string) ??
      (sessionClaims?.role as string) ??
      "USER";

    const role = resolveAdminRole(rawRole);

    const user: AuthUser = {
      id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
      name: clerkUser.fullName ?? clerkUser.firstName ?? clerkUser.username ?? "",
      role,
      backendRole: rawRole as BackendRole,
      avatar: clerkUser.imageUrl,
    };

    return {
      user,
      loading: !isLoaded || roleLoading,
      async login() { window.location.href = "/login"; },
      async register() { window.location.href = "/register"; },
      loginWithGoogle() { clerk.openSignIn?.({ redirectUrl: window.location.href }); },
      logout() {
        setBackendRole(null);
        setRoleLoading(true);
        setTokenGetter(null);
        signOut({ redirectUrl: "/" });
      },
      hasRole: (r: Role) => user.role === r,
    };
  }, [isLoaded, isSignedIn, clerkUser, sessionClaims, backendRole, roleLoading, clerk, signOut]);
}

function useStubAuth() {
  return useMemo(
    () => ({
      user: null as AuthUser | null,
      loading: false,
      async login() { window.location.href = "/login"; },
      async register() { window.location.href = "/register"; },
      loginWithGoogle() {
        alert("Add VITE_CLERK_PUBLISHABLE_KEY to your .env to enable sign-in.");
      },
      logout() {},
      hasRole: (_r: Role) => false,
    }),
    [],
  );
}

export const useAuth = CLERK_ENABLED ? useClerkBasedAuth : useStubAuth;
