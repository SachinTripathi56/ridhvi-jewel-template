// Domain types — aligned with Spring Boot backend DTOs.
// adaptProduct() maps backend ProductSummaryResponse / ProductDetailResponse → Product.

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;          // ← shortDescription from backend
  price: number;            // ← basePrice from backend
  mrp?: number;
  currency: string;
  category: string;         // ← categoryName from backend
  collection?: string;       // kept for mock-data compat
  image: string;            // ← primaryImageUrl from backend
  gallery: string[];        // ← images[].imageUrl from ProductDetailResponse
  shortDescription: string;
  description: string;      // ← longDescription
  benefits: string[];       // ← benefits (newline-split string from backend)
  ingredients: string[];    // ← ingredients (newline-split string)
  howToUse: string[];       // ← directionsToUse (newline-split string)
  faqs: { q: string; a: string }[];
  size?: string;            // ← netQuantity
  inStock: boolean;
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
  badge?: "NEW" | "FEATURED" | "SALE"; // PARVIOR badge compat
  oldPrice?: number;        // PARVIOR compat alias for mrp
  sku?: string;             // PARVIOR compat
  tags?: string[];          // PARVIOR compat
  brand?: string;           // PARVIOR compat
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
}

/** Maps a raw backend ProductSummaryResponse or ProductDetailResponse to Product */
export function adaptProduct(raw: any): Product {
  const splitLines = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(String);
    return String(val).split(/\n|,/).map((s) => s.trim()).filter(Boolean);
  };

  return {
    id: raw.id ?? "",
    slug: raw.slug ?? "",
    name: raw.name ?? "",
    tagline: raw.shortDescription ?? "",
    price: Number(raw.basePrice ?? 0),
    mrp: raw.mrp != null ? Number(raw.mrp) : undefined,
    oldPrice: raw.mrp != null ? Number(raw.mrp) : undefined,
    currency: "INR",
    category: raw.categoryName ?? raw.category?.name ?? "",
    image: raw.primaryImageUrl ?? (raw.images?.[0]?.imageUrl ?? ""),
    gallery: (raw.images ?? []).map((img: any) => img.imageUrl ?? img.url ?? img),
    shortDescription: raw.shortDescription ?? "",
    description: raw.longDescription ?? raw.description ?? "",
    benefits: splitLines(raw.benefits),
    ingredients: splitLines(raw.ingredients),
    howToUse: splitLines(raw.directionsToUse ?? raw.howToUse),
    faqs: (raw.faqs ?? []).map((f: any) => ({ q: f.question ?? f.q, a: f.answer ?? f.a })),
    size: raw.netQuantity ?? raw.size ?? "",
    inStock: raw.inStock ?? true,
    featured: raw.featured ?? false,
    isNew: raw.isNew ?? false,
    badge: raw.featured ? "FEATURED" : raw.isNew ? "NEW" : undefined,
    sku: raw.sku ?? "",
    tags: raw.tags ?? [],
    brand: raw.brand ?? "Parvior Atelier",
    averageRating: raw.averageRating != null ? Number(raw.averageRating) : undefined,
    totalReviews: raw.totalReviews ?? 0,
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

export type ProductCategory = "rings" | "earrings" | "necklaces" | "bracelets";

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  offer?: string;       // e.g. "15% Off"
  linkUrl?: string;
  active: boolean;
  displayOrder?: number;
}

export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  category: string;
  readTime: string;
  publishedAt: string;
  author: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export type SortKey =
  | "featured"
  | "newest"
  | "bestselling"
  | "price-asc"
  | "price-desc"
  | "alpha";

// ── Backend cart types (matches CartResponse / CartItemResponse DTOs) ────────
export interface BackendCartItem {
  id: string;              // cart item UUID
  productId: string;
  productName: string;
  productSlug: string;
  productImageUrl: string; // was productImage — backend field name
  variantId?: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  inStock?: boolean;
}

export interface BackendCart {
  cartId?: string;         // backend field
  id?: string;             // alias kept for compat
  items: BackendCartItem[];
  totalItems: number;
  subtotal: number;        // backend field (was totalAmount)
}

// ── Category ────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
}

// ── Coupon validate ─────────────────────────────────────────────────────────
export interface CouponValidateResult {
  code: string;
  type: "PERCENT" | "FLAT";
  discountAmount: number;
  finalTotal: number;
  message: string;
}

// ── Site Settings ────────────────────────────────────────────────────────────
export interface SiteSettings {
  address?: string;
  phone?: string;
  hours?: string;
  tagline?: string;
  footerText?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  email?: string;
}
