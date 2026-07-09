import { Link } from "@tanstack/react-router";
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useAdminAuth, signOut as adminSignOut } from "@/lib/admin-auth";

const baseNav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/shop", label: "Blog" },
  { to: "/shop", label: "Pages" },
  { to: "/shop", label: "Contacts" },
];

export function Header({ transparentOnTop = false }: { transparentOnTop?: boolean }) {
  const { count } = useCart();
  const isAdmin = useAdminAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!transparentOnTop) { setScrolled(true); return; }
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentOnTop]);

  const solid = scrolled;
  const barClass = solid
    ? "bg-white text-neutral-900 shadow-[0_1px_0_rgba(0,0,0,0.06)]"
    : "bg-transparent text-white";
  const logoColor = solid ? "text-[#8B1F2B]" : "text-white";

  const nav = isAdmin ? [...baseNav, { to: "/admin", label: "Admin" }] : baseNav;

  return (
    <>
    <header className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${barClass}`}>
      <div className="hidden md:grid grid-cols-3 items-center px-10 py-6 max-w-[1600px] mx-auto">
        <Link to="/" className={`wordmark text-3xl tracking-[0.3em] ${logoColor}`}>
          RIDHVI
        </Link>

        <nav className="flex items-center justify-center gap-10 text-[15px] tracking-wide">
          {nav.map((n) => (
            <Link key={n.label} to={n.to} className="inline-flex items-center gap-1 hover:opacity-70 transition">
              {n.label}
              {["Shop","Blog","Pages"].includes(n.label) && <ChevronDown className="w-3.5 h-3.5 opacity-70" />}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-6">
          <button aria-label="Search" className="hover:opacity-70"><Search className="w-[20px] h-[20px]" /></button>
          {isAdmin ? (
            <button aria-label="Sign out admin" onClick={adminSignOut} className="hover:opacity-70"><LogOut className="w-[20px] h-[20px]" /></button>
          ) : (
            <Link to="/admin-login" aria-label="Account" className="hover:opacity-70"><User className="w-[20px] h-[20px]" /></Link>
          )}
          <button aria-label="Wishlist" className="hover:opacity-70"><Heart className="w-[20px] h-[20px]" /></button>
          <Link to="/cart" aria-label="Cart" className="relative hover:opacity-70">
            <ShoppingBag className="w-[20px] h-[20px]" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#8B1F2B] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{count}</span>
            )}
          </Link>
        </div>
      </div>

      {/* mobile */}
      <div className="md:hidden flex items-center justify-between px-5 py-4">
        <button aria-label="Menu" onClick={() => setOpen(true)}><Menu className="w-5 h-5" /></button>
        <Link to="/" className={`wordmark text-xl tracking-[0.3em] ${logoColor}`}>RIDHVI</Link>
        <Link to="/cart" className="relative" aria-label="Cart">
          <ShoppingBag className="w-5 h-5" />
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#8B1F2B] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{count}</span>
          )}
        </Link>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-white text-neutral-900 md:hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
            <span className="wordmark text-xl tracking-[0.3em] text-[#8B1F2B]">RIDHVI</span>
            <button aria-label="Close" onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
          </div>
          <div className="flex flex-col p-6 gap-5 text-lg tracking-widest uppercase">
            {nav.map((n) => (
              <Link key={n.label} to={n.to} onClick={() => setOpen(false)}>{n.label}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
    {!transparentOnTop && <div aria-hidden className="h-[92px] md:h-[92px]" />}
    </>
  );
}
