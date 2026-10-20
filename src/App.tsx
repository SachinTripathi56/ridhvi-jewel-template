import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

// Public pages (Ridhvi's original pages, converted to React Router)
import Home from "@/pages/index";
import Shop from "@/pages/shop";
import ProductPage from "@/pages/product.$slug";
import Cart from "@/pages/cart";
import AdminLoginPage from "@/pages/admin-login";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";

// Authenticated pages
import AccountLayout from "@/pages/_authenticated/account";
import AccountProfile from "@/pages/_authenticated/account.profile";
import AccountOrders from "@/pages/_authenticated/account.orders";
import AccountOrderDetail from "@/pages/_authenticated/account.orders.$id";
import AccountWishlist from "@/pages/_authenticated/account.wishlist";
import AccountAddresses from "@/pages/_authenticated/account.addresses";
import Checkout from "@/pages/_authenticated/checkout";
import OrderSuccess from "@/pages/_authenticated/order-success.$id";

// Admin pages
import AdminLayout from "@/pages/_authenticated/admin";
import AdminIndex from "@/pages/_authenticated/admin.index";
import AdminProducts from "@/pages/_authenticated/admin.products";
import AdminProductNew from "@/pages/_authenticated/admin.products.new";
import AdminProductEdit from "@/pages/_authenticated/admin.products.$id";
import AdminOrders from "@/pages/_authenticated/admin.orders";
import AdminOrderDetail from "@/pages/_authenticated/admin.orders.$id";
import AdminUsers from "@/pages/_authenticated/admin.users";
import AdminCoupons from "@/pages/_authenticated/admin.coupons";
import AdminReviews from "@/pages/_authenticated/admin.reviews";
import AdminCategories from "@/pages/_authenticated/admin.categories";
import AdminBanners from "@/pages/_authenticated/admin.banners";
import AdminCollections from "@/pages/_authenticated/admin.collections";
import AdminSettings from "@/pages/_authenticated/admin.settings";
import AdminSplash from "@/pages/_authenticated/admin.splash";

// 404
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

function NotFound() {
  return (
    <div className="min-h-screen">
      <Header />
      <section className="flex min-h-[60vh] items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="text-7xl">404</h1>
          <h2 className="mt-4 text-xl">Page not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">This page doesn't exist.</p>
          <div className="mt-6">
            <a href="/" className="inline-flex items-center justify-center bg-primary px-5 py-2.5 text-xs tracking-widest uppercase text-primary-foreground">
              Go home
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

/** Redirects unauthenticated users to /login */
function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${next}`} replace />;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/products/:slug" element={<ProductPage />} />
      {/* legacy route kept for backward compat */}
      <Route path="/product/:slug" element={<ProductPage />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />

      {/* ── Authenticated ── */}
      <Route element={<ProtectedRoute />}>
        {/* Account */}
        <Route path="/account" element={<AccountLayout />}>
          <Route index element={<Navigate to="/account/profile" replace />} />
          <Route path="profile" element={<AccountProfile />} />
          <Route path="orders" element={<AccountOrders />} />
          <Route path="orders/:id" element={<AccountOrderDetail />} />
          <Route path="wishlist" element={<AccountWishlist />} />
          <Route path="addresses" element={<AccountAddresses />} />
        </Route>

        {/* Checkout */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminIndex />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductNew />} />
          <Route path="products/:id" element={<AdminProductEdit />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="collections" element={<AdminCollections />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="splash" element={<AdminSplash />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
