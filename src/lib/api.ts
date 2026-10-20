// API service layer — uses Spring Boot backend when VITE_API_BASE_URL is set,
// otherwise falls back to mock data so the app keeps working without a backend.
//
// Backend URL map (all relative to VITE_API_BASE_URL):
//   GET  /products                     → paged product list
//   GET  /products/featured            → featured products for home page
//   GET  /products/search?q=...        → search
//   GET  /products/{slug}              → product detail
//   GET  /categories                   → category list
//   POST /auth/sync                    → sync Clerk user to DB (called on login)
//   GET  /auth/me                      → current user profile
//   GET  /cart                         → user cart
//   POST /cart/items                   → add item
//   PUT  /cart/items/{id}?quantity=N   → update quantity
//   DEL  /cart/items/{id}              → remove item
//   DEL  /cart                         → clear cart
//   GET  /orders                       → list my orders
//   POST /orders                       → place order (uses server-side cart)
//   GET  /orders/{id}                  → order detail
//   PUT  /orders/{id}/cancel           → cancel order
//   GET  /addresses                    → list addresses
//   POST /addresses                    → add address
//   PUT  /addresses/{id}               → update address
//   DEL  /addresses/{id}               → delete address
//   PUT  /addresses/{id}/default       → set default
//   GET  /wishlist                     → list wishlist items
//   POST /wishlist/{productId}         → add to wishlist
//   DEL  /wishlist/{productId}         → remove from wishlist
//   POST /coupons/validate             → validate coupon code
//   POST /payments/initiate/{orderId}  → initiate PhonePe payment
//   POST /contact                      → contact form
//   GET  /reviews/product/{productId}  → product reviews
//   POST /reviews/product/{productId}  → write review
//   PUT  /reviews/{id}                 → edit review
//   DEL  /reviews/{id}                 → delete review
//   GET  /admin/dashboard              → admin stats
//   GET  /admin/products               → admin product list (paged)
//   POST /admin/products               → create product
//   PUT  /admin/products/{id}          → update product
//   DEL  /admin/products/{id}          → delete product
//   GET  /admin/orders                 → admin order list
//   PUT  /admin/orders/{id}/status     → update order status
//   GET  /admin/users                  → user list
//   PUT  /admin/users/{id}/role?role=X → change user role
//   GET  /admin/coupons                → coupon list
//   POST /admin/coupons                → create coupon
//   PUT  /admin/coupons/{id}           → update coupon
//   DEL  /admin/coupons/{id}           → delete coupon
//   PUT  /admin/reviews/{id}           → admin edit review
//   DEL  /admin/reviews/{id}           → admin delete review
//   GET  /admin/categories             → category list (admin)
//   POST /admin/categories             → create category
//   PUT  /admin/categories/{id}        → update category
//   DEL  /admin/categories/{id}        → delete category

import { PRODUCTS as mockProducts } from "./products";
import type { Product, Category, CouponValidateResult, SiteSettings, Collection } from "./types";
import { adaptProduct } from "./types";
import type { Address, Order, Review, Coupon, CreateOrderRequest } from "./orders-types";
import type { AuthUser } from "./auth-context";
import { http, apiAvailable, getClerkToken, API_BASE } from "./http";

const wait = (ms = 150) => new Promise((r) => setTimeout(r, ms));

// ── Sort helpers for mock data ──────────────────────────────────────────────
function sortAndFilter(
  list: Product[],
  opts?: { sort?: string; search?: string; category?: string },
) {
  let out = [...list];
  if (opts?.search) {
    const q = opts.search.toLowerCase();
    out = out.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.tagline ?? "").toLowerCase().includes(q),
    );
  }
  if (opts?.category) out = out.filter((p) => p.category === opts.category);
  switch (opts?.sort) {
    case "newest":
      out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "bestselling":
      out.sort(
        (a, b) =>
          Number(b.bestseller ?? false) - Number(a.bestseller ?? false),
      );
      break;
    case "price-asc":
    case "low":
      out.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
    case "high":
      out.sort((a, b) => b.price - a.price);
      break;
    case "alpha":
      out.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      out.sort(
        (a, b) =>
          Number(b.featured ?? false) - Number(a.featured ?? false),
      );
  }
  return out;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
/** Extract array from a paginated backend response or plain array */
function extractList<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data?.content && Array.isArray(data.content)) return data.content;
  return [];
}

// ── Public API ───────────────────────────────────────────────────────────────
export const api = {
  // ---------- catalog ----------

  /** Featured products — used on the home page */
  async getFeaturedProducts(): Promise<Product[]> {
    if (apiAvailable()) {
      const data = await http<any>("/products/featured");
      return extractList<any>(data).map(adaptProduct);
    }
    await wait();
    return mockProducts.filter((p) => p.badge === "FEATURED" || p.featured).slice(0, 8);
  },

  /** Paged/filtered product list — used on shop page */
  async getProducts(opts?: {
    sort?: string;
    search?: string;
    category?: string;
    page?: number;
    size?: number;
  }): Promise<Product[]> {
    if (apiAvailable()) {
      if (opts?.search) {
        const q = new URLSearchParams({
          q: opts.search,
          page: String(opts?.page ?? 0),
          size: String(opts?.size ?? 12),
        });
        const data = await http<any>(`/products/search?${q}`);
        return extractList<any>(data).map(adaptProduct);
      }
      const q = new URLSearchParams({
        page: String(opts?.page ?? 0),
        size: String(opts?.size ?? 12),
      });
      const data = await http<any>(`/products?${q}`);
      return extractList<any>(data).map(adaptProduct);
    }
    await wait();
    return sortAndFilter(mockProducts as Product[], opts);
  },

  async getProduct(slug: string): Promise<Product | null> {
    if (apiAvailable()) {
      const data = await http<any>(`/products/${encodeURIComponent(slug)}`);
      return data ? adaptProduct(data) : null;
    }
    await wait();
    return (mockProducts.find((p) => p.slug === slug) as Product) ?? null;
  },

  // ---------- categories ----------

  async getCategories(): Promise<Category[]> {
    if (apiAvailable()) {
      const data = await http<any>("/categories");
      return Array.isArray(data) ? data : (data?.data ?? []);
    }
    await wait();
    return [];
  },

  // ---------- collections (public) ----------

  async getCollections(): Promise<Collection[]> {
    if (apiAvailable()) {
      const data = await http<any>("/collections");
      return Array.isArray(data) ? data : (data?.data ?? []);
    }
    return [];
  },

  // ---------- auth sync ----------

  /** Call once after Clerk sign-in to register/update user in the Spring Boot DB */
  async syncUser(data: {
    clerkUserId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  }): Promise<void> {
    if (!apiAvailable()) return;
    await http("/auth/sync", { method: "POST", json: data });
  },

  /** Get current authenticated user from backend */
  async getMe(): Promise<AuthUser | null> {
    if (!apiAvailable()) return null;
    return http<AuthUser>("/auth/me");
  },

  // ---------- cart ----------

  async getCart() {
    if (apiAvailable()) return http<any>("/cart");
    return null;
  },

  async addToCart(productId: string, quantity = 1, variantId?: string) {
    if (apiAvailable())
      return http<any>("/cart/items", {
        method: "POST",
        json: { productId, quantity, variantId },
      });
    return null;
  },

  async updateCartItem(itemId: string, quantity: number) {
    if (apiAvailable())
      return http<any>(`/cart/items/${itemId}?quantity=${quantity}`, {
        method: "PUT",
      });
    return null;
  },

  async removeCartItem(itemId: string) {
    if (apiAvailable())
      return http<any>(`/cart/items/${itemId}`, { method: "DELETE" });
    return null;
  },

  async clearCart() {
    if (apiAvailable()) return http<any>("/cart", { method: "DELETE" });
    return null;
  },

  // ---------- newsletter / contact ----------

  async subscribeNewsletter(_email: string) {
    await wait(300);
    return { ok: true } as const;
  },

  async sendContact(data: {
    name?: string;
    fullName?: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) {
    if (apiAvailable())
      return http("/contact", {
        method: "POST",
        json: {
          fullName: data.fullName ?? data.name ?? "",
          email: data.email,
          phone: data.phone ?? "",
          subject: data.subject,
          message: data.message,
        },
      });
    await wait(300);
    return { ok: true } as const;
  },

  // ---------- addresses ----------

  async listAddresses(): Promise<Address[]> {
    if (apiAvailable()) return http<Address[]>("/addresses");
    await wait();
    try {
      return JSON.parse(localStorage.getItem("parvior_addresses") ?? "[]");
    } catch {
      return [];
    }
  },

  async saveAddress(a: Address): Promise<Address> {
    if (apiAvailable()) {
      if (a.id) {
        return http<Address>(`/addresses/${a.id}`, { method: "PUT", json: a });
      }
      return http<Address>("/addresses", { method: "POST", json: a });
    }
    // mock
    const list: Address[] = JSON.parse(
      localStorage.getItem("parvior_addresses") ?? "[]",
    );
    const withId = { ...a, id: a.id ?? crypto.randomUUID() };
    const next = a.id
      ? list.map((x) => (x.id === a.id ? withId : x))
      : [...list, withId];
    localStorage.setItem("parvior_addresses", JSON.stringify(next));
    return withId;
  },

  async deleteAddress(id: string) {
    if (apiAvailable())
      return http(`/addresses/${id}`, { method: "DELETE" });
    const list: Address[] = JSON.parse(
      localStorage.getItem("parvior_addresses") ?? "[]",
    );
    localStorage.setItem(
      "parvior_addresses",
      JSON.stringify(list.filter((x) => x.id !== id)),
    );
    return { ok: true } as const;
  },

  async setDefaultAddress(id: string) {
    if (apiAvailable())
      return http(`/addresses/${id}/default`, { method: "PUT" });
    return { ok: true } as const;
  },

  // ---------- wishlist ----------

  async listWishlist(): Promise<string[]> {
    if (apiAvailable()) {
      const items = await http<any[]>("/wishlist");
      return (items ?? []).map(
        (w: any) => w.product?.id ?? w.productId ?? w.id,
      );
    }
    try {
      return JSON.parse(
        localStorage.getItem("parvior_wishlist_v1") ?? "[]",
      );
    } catch {
      return [];
    }
  },

  async addToWishlist(productId: string) {
    if (apiAvailable())
      return http(`/wishlist/${productId}`, { method: "POST" });
    const list: string[] = JSON.parse(
      localStorage.getItem("parvior_wishlist_v1") ?? "[]",
    );
    if (!list.includes(productId)) {
      localStorage.setItem(
        "parvior_wishlist_v1",
        JSON.stringify([...list, productId]),
      );
    }
    return { ok: true } as const;
  },

  async removeFromWishlist(productId: string) {
    if (apiAvailable())
      return http(`/wishlist/${productId}`, { method: "DELETE" });
    const list: string[] = JSON.parse(
      localStorage.getItem("parvior_wishlist_v1") ?? "[]",
    );
    localStorage.setItem(
      "parvior_wishlist_v1",
      JSON.stringify(list.filter((id) => id !== productId)),
    );
    return { ok: true } as const;
  },

  // ---------- coupons ----------

  async validateCoupon(
    code: string,
    cartTotal: number,
  ): Promise<CouponValidateResult> {
    if (apiAvailable())
      return http<CouponValidateResult>("/coupons/validate", {
        method: "POST",
        json: { code, cartTotal },
      });
    throw new Error("Coupon validation requires backend connection.");
  },

  // ---------- orders ----------

  async listOrders(): Promise<Order[]> {
    if (apiAvailable()) {
      const data = await http<any>("/orders");
      return extractList<Order>(data);
    }
    await wait();
    try {
      return JSON.parse(localStorage.getItem("parvior_orders") ?? "[]");
    } catch {
      return [];
    }
  },

  async getOrder(id: string): Promise<Order | null> {
    if (apiAvailable()) return http<Order>(`/orders/${id}`);
    const list = await this.listOrders();
    return list.find((o) => o.id === id) ?? null;
  },

  async createOrder(input: CreateOrderRequest): Promise<{ orderId: string }> {
    if (apiAvailable()) {
      const order = await http<Order>("/orders", {
        method: "POST",
        json: input,
      });
      return { orderId: order.id };
    }
    // Mock fallback
    await wait(500);
    const orderId = "ORD-" + Date.now();
    const list = await this.listOrders();
    const mockOrder: Order = {
      id: orderId,
      status: "PENDING",
      items: [],
      subtotal: 0,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(
      "parvior_orders",
      JSON.stringify([mockOrder, ...list]),
    );
    return { orderId };
  },

  async cancelOrder(id: string) {
    if (apiAvailable())
      return http(`/orders/${id}/cancel`, { method: "PUT" });
    return { ok: true } as const;
  },

  // ---------- payments ----------

  async initiatePayment(orderId: string): Promise<{
    redirectUrl?: string;
    paymentUrl?: string;
    merchantTransactionId?: string;
    orderNumber?: string;
    transactionId?: string;
  }> {
    if (apiAvailable())
      return http(`/payments/initiate/${orderId}`, { method: "POST" });
    return {};
  },

  // ---------- reviews ----------

  async listReviews(productId: string): Promise<Review[]> {
    if (apiAvailable()) {
      const data = await http<any>(`/reviews/product/${productId}`);
      return extractList<Review>(data);
    }
    return [];
  },

  async writeReview(
    productId: string,
    r: { rating: number; title?: string; body: string },
  ): Promise<Review> {
    if (apiAvailable())
      return http<Review>(`/reviews/product/${productId}`, {
        method: "POST",
        json: r,
      });
    return {
      id: crypto.randomUUID(),
      productId,
      userName: "You",
      approved: false,
      createdAt: new Date().toISOString(),
      ...r,
    };
  },

  async updateReview(id: string, r: { rating?: number; title?: string; body?: string }) {
    if (apiAvailable())
      return http<Review>(`/reviews/${id}`, { method: "PUT", json: r });
    return null;
  },

  async deleteReview(id: string) {
    if (apiAvailable())
      return http(`/reviews/${id}`, { method: "DELETE" });
    return { ok: true } as const;
  },

  // ---------- user profile ----------

  async updateProfile(patch: Partial<Pick<AuthUser, "name" | "avatar">>) {
    if (apiAvailable())
      return http<AuthUser>("/users/me", {
        method: "PUT",
        json: {
          firstName: patch.name?.split(" ")[0] ?? "",
          lastName: patch.name?.split(" ").slice(1).join(" ") ?? "",
          profileImageUrl: patch.avatar,
        },
      });
    await wait();
    return {
      ...(patch as any),
      id: "me",
      email: "demo@example.com",
      role: "USER",
    } as AuthUser;
  },

  // Clerk handles passwords, not the backend
  async forgotPassword(_email: string) {
    await wait(300);
    return { ok: true } as const;
  },
  async resetPassword(_token: string, _password: string) {
    await wait(300);
    return { ok: true } as const;
  },
  async changePassword(_currentPassword: string, _newPassword: string) {
    await wait();
    return { ok: true } as const;
  },

  // ---------- admin ----------
  admin: {
    async dashboard() {
      if (apiAvailable()) return http<any>("/admin/dashboard");
      return {
        totalRevenue: 128400,
        revenueThisMonth: 28400,
        totalOrders: 42,
        pendingOrders: 5,
        processingOrders: 8,
        totalUsers: 31,
        newUsersThisMonth: 7,
        activeProducts: 24,
        lowStockProducts: 3,
        outOfStockProducts: 1,
        pendingReviews: 6,
        unreadMessages: 2,
        topSellingProducts: [],
      };
    },

    async listProducts(page = 0, size = 100): Promise<any[]> {
      if (apiAvailable()) {
        const data = await http<any>(`/admin/products?page=${page}&size=${size}`);
        return extractList<any>(data);
      }
      return mockProducts;
    },

    async getProduct(id: string): Promise<any> {
      if (apiAvailable()) return http<any>(`/admin/products/${id}`);
      return (mockProducts as any[]).find((p) => p.id === id) ?? null;
    },

    async listOrders(): Promise<Order[]> {
      if (apiAvailable()) {
        const data = await http<any>("/admin/orders");
        return extractList<Order>(data);
      }
      return [];
    },

    async updateOrderStatus(id: string, status: string) {
      if (apiAvailable())
        return http<Order>(`/admin/orders/${id}/status`, {
          method: "PUT",
          json: { status },
        });
      return { ok: true } as const;
    },

    async listUsers(): Promise<AuthUser[]> {
      if (apiAvailable()) {
        const data = await http<any>("/admin/users");
        return extractList<AuthUser>(data);
      }
      return [];
    },

    async setUserRole(id: string, role: "USER" | "ADMIN") {
      if (apiAvailable())
        return http(`/admin/users/${id}/role?role=${role}`, { method: "PUT" });
      return { ok: true } as const;
    },

    async blockUser(id: string) {
      if (apiAvailable())
        return http(`/admin/users/${id}/block`, { method: "PUT" });
      return { ok: true } as const;
    },

    async unblockUser(id: string) {
      if (apiAvailable())
        return http(`/admin/users/${id}/unblock`, { method: "PUT" });
      return { ok: true } as const;
    },

    async upsertProduct(p: { id?: string; [key: string]: any }): Promise<any> {
      if (apiAvailable()) {
        const { id, ...payload } = p;
        return id
          ? http<any>(`/admin/products/${id}`, { method: "PUT",  json: payload })
          : http<any>("/admin/products",        { method: "POST", json: payload });
      }
      throw new Error("Backend not connected. Set VITE_API_BASE_URL to enable.");
    },

    async deleteProduct(id: string) {
      if (apiAvailable())
        return http(`/admin/products/${id}`, { method: "DELETE" });
      throw new Error("Backend not connected.");
    },

    async uploadProductImages(productId: string, files: File[]): Promise<void> {
      if (!apiAvailable()) return;
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      const token = await getClerkToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/admin/products/${productId}/images`, {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) throw new Error(`Image upload failed: ${res.status}`);
    },

    async deleteProductImage(productId: string, imageId: string): Promise<void> {
      if (apiAvailable())
        await http(`/admin/products/${productId}/images/${imageId}`, { method: "DELETE" });
    },

    async setPrimaryImage(productId: string, imageId: string): Promise<void> {
      if (apiAvailable())
        await http(`/admin/products/${productId}/images/${imageId}/primary`, { method: "PUT" });
    },

    async listReviews(visible?: boolean): Promise<Review[]> {
      if (apiAvailable()) {
        const q = visible !== undefined ? `?visible=${visible}` : "";
        const data = await http<any>(`/admin/reviews${q}`);
        return extractList<Review>(data);
      }
      return [];
    },

    async approveReview(id: string, approved: boolean) {
      if (apiAvailable())
        return http(`/admin/reviews/${id}`, {
          method: "PUT",
          json: { visible: approved },
        });
      return { ok: true } as const;
    },

    async deleteReview(id: string) {
      if (apiAvailable())
        return http(`/admin/reviews/${id}`, { method: "DELETE" });
      return { ok: true } as const;
    },

    async listCoupons(): Promise<Coupon[]> {
      if (apiAvailable()) {
        const data = await http<any>("/admin/coupons");
        return extractList<Coupon>(data);
      }
      return [];
    },

    async upsertCoupon(c: Partial<Coupon>): Promise<Coupon> {
      if (apiAvailable()) {
        return c.id
          ? http<Coupon>(`/admin/coupons/${c.id}`, { method: "PUT", json: c })
          : http<Coupon>("/admin/coupons", { method: "POST", json: c });
      }
      throw new Error("Backend not connected.");
    },

    async deleteCoupon(id: string) {
      if (apiAvailable())
        return http(`/admin/coupons/${id}`, { method: "DELETE" });
      return { ok: true } as const;
    },

    async listCategories(): Promise<Category[]> {
      if (apiAvailable()) return http<Category[]>("/admin/categories");
      return [];
    },

    async createCategory(c: Partial<Category>): Promise<Category> {
      if (apiAvailable())
        return http<Category>("/admin/categories", {
          method: "POST",
          json: c,
        });
      throw new Error("Backend not connected.");
    },

    async updateCategory(id: string, c: Partial<Category>): Promise<Category> {
      if (apiAvailable())
        return http<Category>(`/admin/categories/${id}`, {
          method: "PUT",
          json: c,
        });
      throw new Error("Backend not connected.");
    },

    async deleteCategory(id: string) {
      if (apiAvailable())
        return http(`/admin/categories/${id}`, { method: "DELETE" });
      throw new Error("Backend not connected.");
    },

    async uploadCategoryImage(categoryId: string, file: File): Promise<Category> {
      if (!apiAvailable()) throw new Error("Backend not connected.");
      const formData = new FormData();
      formData.append("file", file);
      const token = await getClerkToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/admin/categories/${categoryId}/image`, {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) throw new Error(`Image upload failed: ${res.status}`);
      const json = await res.json();
      return json.data ?? json;
    },

    // ---------- collections ----------

    async listCollections(): Promise<Collection[]> {
      if (apiAvailable()) {
        const data = await http<any>("/admin/collections");
        return Array.isArray(data) ? data : (data?.data ?? []);
      }
      return [];
    },

    async createCollection(c: Partial<Collection>): Promise<Collection> {
      if (apiAvailable())
        return http<Collection>("/admin/collections", { method: "POST", json: c });
      throw new Error("Backend not connected.");
    },

    async updateCollection(id: string, c: Partial<Collection>): Promise<Collection> {
      if (apiAvailable())
        return http<Collection>(`/admin/collections/${id}`, { method: "PUT", json: c });
      throw new Error("Backend not connected.");
    },

    async uploadCollectionImage(collectionId: string, file: File): Promise<Collection> {
      if (!apiAvailable()) throw new Error("Backend not connected.");
      const formData = new FormData();
      formData.append("file", file);
      const token = await getClerkToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/admin/collections/${collectionId}/image`, {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) throw new Error(`Image upload failed: ${res.status}`);
      const json = await res.json();
      return json.data ?? json;
    },

    async deleteCollection(id: string) {
      if (apiAvailable())
        return http(`/admin/collections/${id}`, { method: "DELETE" });
      throw new Error("Backend not connected.");
    },

    // ---------- site settings ----------

    async getSiteSettings(): Promise<SiteSettings> {
      if (apiAvailable()) {
        const data = await http<any>("/admin/settings");
        return data?.data ?? data;
      }
      return {} as SiteSettings;
    },

    async updateSiteSettings(s: Partial<SiteSettings>): Promise<SiteSettings> {
      if (apiAvailable())
        return http<SiteSettings>("/admin/settings", { method: "PUT", json: s });
      throw new Error("Backend not connected.");
    },
  },
};

export function formatPrice(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
