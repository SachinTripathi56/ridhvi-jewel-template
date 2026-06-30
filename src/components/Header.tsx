import { Link } from "@tanstack/react-router";
import { Search, User, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/shop", label: "Collections" },
  { to: "/admin", label: "Admin" },
];

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur border-b border-border">
      <div className="hidden md:flex items-center justify-between px-8 py-4 max-w-[1400px] mx-auto">
        <div className="flex-1 flex items-center gap-8 text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
          <span>283 N. Glenwood Street, Levittown</span>
          <span>+1 712-339-9294</span>
        </div>
        <Logo />
        <div className="flex-1 flex items-center justify-end gap-5">
          <button aria-label="Search" className="hover:text-accent transition"><Search className="w-4 h-4" /></button>
          <Link to="/admin" aria-label="Account" className="hover:text-accent transition"><User className="w-4 h-4" /></Link>
          <button aria-label="Wishlist" className="hover:text-accent transition"><Heart className="w-4 h-4" /></button>
          <Link to="/cart" aria-label="Cart" className="relative hover:text-accent transition">
            <ShoppingBag className="w-4 h-4" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{count}</span>
            )}
          </Link>
        </div>
      </div>

      <nav className="hidden md:flex items-center justify-center gap-10 py-3 border-t border-border/60 text-[12px] tracking-[0.22em] uppercase">
        {nav.map((n) => (
          <Link key={n.label} to={n.to} className="hover:text-accent transition">{n.label}</Link>
        ))}
        <Link to="/shop" className="hover:text-accent transition">Contact</Link>
      </nav>

      {/* mobile */}
      <div className="md:hidden flex items-center justify-between px-4 py-3">
        <button aria-label="Menu" onClick={() => setOpen(true)}><Menu className="w-5 h-5" /></button>
        <Logo />
        <Link to="/cart" className="relative" aria-label="Cart">
          <ShoppingBag className="w-5 h-5" />
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{count}</span>
          )}
        </Link>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <Logo />
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
  );
}
