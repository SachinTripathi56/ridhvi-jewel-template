// Shared order/address/review/coupon types — aligned with Spring Boot backend DTOs.

// ── Address ─────────────────────────────────────────────────────────────────
export interface Address {
  id?: string;
  label?: string;            // e.g. "Home", "Work", "Other"
  fullName: string;
  phone: string;
  addressLine1?: string;     // backend field name
  addressLine2?: string;
  line1?: string;            // alias (used by checkout / address pages)
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;          // kept for compat (backend doesn't use it)
  defaultAddress?: boolean;
  isDefault?: boolean;       // alias
}

// ── Orders ───────────────────────────────────────────────────────────────────
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderItem {
  id?: string;
  productId: string;
  productName?: string;
  name?: string;             // alias
  productImage?: string;
  image?: string;            // alias
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber?: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  items: OrderItem[];

  // Amount fields — backend uses these names
  subtotal?: number;
  shippingCharge?: number;
  discountAmount?: number;
  totalAmount?: number;
  couponCode?: string;

  // Backward-compat aliases used by existing pages
  shipping?: number;         // alias for shippingCharge
  tax?: number;              // not in backend (kept for mock compat)
  total?: number;            // alias for totalAmount

  currency?: string;

  // Flat shipping address snapshot (backend)
  shippingFullName?: string;
  shippingPhone?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPincode?: string;

  // Nested address (mock compat — pages that do order.address.city)
  address?: Address;

  customerNote?: string;
  trackingNumber?: string;
  trackingUrl?: string;      // alias (mock compat)

  // Payment info
  paymentProvider?: "PHONEPE" | "COD";
  paymentRef?: string;

  createdAt: string;
  updatedAt?: string;
}

// ── Reviews ──────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  rating: number; // 1..5
  title?: string;
  body: string;
  approved?: boolean;
  images?: { id: string; imageUrl: string }[];
  createdAt: string;
}

// ── Coupons ──────────────────────────────────────────────────────────────────
export interface Coupon {
  id: string;
  code: string;
  type: "PERCENT" | "FLAT";
  value?: number;
  discountValue?: number;
  minSubtotal?: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount?: number;
  expiresAt?: string;
  active: boolean;
}

// ── Create Order Request ──────────────────────────────────────────────────────
export interface CreateOrderRequest {
  addressId: string;
  couponCode?: string;
  customerNote?: string;
  // Legacy fields kept for mock fallback (ignored by backend)
  items?: { productId: string; quantity: number }[];
  address?: Address;
  paymentProvider?: "PHONEPE" | "COD";
}
