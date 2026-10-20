import { Link, useNavigate } from "react-router-dom";
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown, LogOut, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCartCount } from "@/lib/cart-store";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist-store";
import { useAuth } from "@/lib/auth-context";
import { apiAvailable } from "@/lib/http";

const baseNav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/shop", label: "Blog" },
  { to: "/shop", label: "Pages" },
  { to: "/shop", label: "Contacts" },
];

export function Header({ transparentOnTop = false }: { transparentOnTop?: boolean }) {
  const backendCount = useCartCount();
  const localCart = useCart();
  // When backend is available use backend count, otherwise use local cart count
  const count = apiAvailable() ? backendCount : localCart.count;
  const wishIds = useWishlist();
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!transparentOnTop) { setScrolled(true); return; }
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentOnTop]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setSearchOpen(false);
    navigate(`/shop?search=${encodeURIComponent(q.trim())}`);
  }

  const solid = scrolled;
  const barClass = solid
    ? "bg-white text-neutral-900 shadow-[0_1px_0_rgba(0,0,0,0.06)]"
    : "bg-transparent text-white";
  const logoColor = solid ? "text-foreground" : "text-white";

  const nav = hasRole("ADMIN")
    ? [...baseNav, { to: "/admin", label: "Admin" }]
    : baseNav;

  return (
    <>
    <header className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${barClass}`}>
      <div className="hidden md:grid grid-cols-3 items-center px-10 py-6 max-w-[1600px] mx-auto">
        <Link to="/" className="flex items-center gap-3">
          <img src="/parvior-logo.svg" alt="Parvior" className={`h-10 w-10 object-contain ${logoColor}`} />
          <span className={`wordmark text-3xl tracking-[0.3em] ${logoColor}`}>PARVIOR</span>
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
          {/* Search */}
          <button aria-label="Search" onClick={() => setSearchOpen((v) => !v)} className="hover:opacity-70">
            <Search className="w-[20px] h-[20px]" />
          </button>

          {/* Wishlist */}
          {user ? (
            <Link to="/account/wishlist" aria-label="Wishlist" className="relative hover:opacity-70">
              <Heart className="w-[20px] h-[20px]" />
              {wishIds.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishIds.length}
                </span>
              )}
            </Link>
          ) : (
            <button aria-label="Wishlist" onClick={() => navigate("/login")} className="relative hover:opacity-70">
              <Heart className="w-[20px] h-[20px]" />
            </button>
          )}

          {/* User account dropdown */}
          <div className="relative" ref={menuRef}>
            <button aria-label="Account" onClick={() => setMenuOpen((v) => !v)} className="hover:opacity-70">
              <User className="w-[20px] h-[20px]" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-3 w-56 border border-border bg-white text-neutral-900 shadow-lg z-50">
                {user ? (
                  <>
                    <div className="border-b border-border px-4 py-3">
                      <p className="text-xs text-muted-foreground">Signed in as</p>
                      <p className="truncate text-sm">{user.email}</p>
                    </div>
                    <Link to="/account/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-secondary">Profile</Link>
                    <Link to="/account/orders" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-secondary">Orders</Link>
                    <Link to="/account/addresses" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-secondary">Addresses</Link>
                    <Link to="/account/wishlist" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-secondary">Wishlist</Link>
                    {hasRole("ADMIN") && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 border-t border-border px-4 py-2 text-sm hover:bg-secondary">
                        <ShieldCheck className="h-4 w-4" /> Admin
                      </Link>
                    )}
                    <button
                      onClick={() => { setMenuOpen(false); logout(); navigate("/"); }}
                      className="flex w-full items-center gap-2 border-t border-border px-4 py-2 text-left text-sm hover:bg-secondary"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-secondary">Sign in</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-secondary">Create account</Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          {user ? (
            <Link to="/cart" aria-label="Cart" className="relative hover:opacity-70">
              <ShoppingBag className="w-[20px] h-[20px]" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{count}</span>
              )}
            </Link>
          ) : (
            <button aria-label="Cart" onClick={() => navigate("/login")} className="relative hover:opacity-70">
              <ShoppingBag className="w-[20px] h-[20px]" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-center justify-between px-5 py-4">
        <button aria-label="Menu" onClick={() => setOpen(true)}><Menu className="w-5 h-5" /></button>
        <Link to="/" className="flex items-center gap-2">
          <img src="/parvior-logo.svg" alt="Parvior" className={`h-8 w-8 object-contain ${logoColor}`} />
          <span className={`wordmark text-xl tracking-[0.3em] ${logoColor}`}>PARVIOR</span>
        </Link>
        {user ? (
          <Link to="/cart" className="relative" aria-label="Cart">
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{count}</span>
            )}
          </Link>
        ) : (
          <button aria-label="Cart" onClick={() => navigate("/login")}>
            <ShoppingBag className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search bar */}
      {searchOpen && (
        <form onSubmit={submitSearch} className="border-t border-border bg-background text-foreground">
          <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-10 py-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search jewellery…"
              className="flex-1 bg-transparent py-2 text-sm focus:outline-none"
            />
            <button type="button" onClick={() => setSearchOpen(false)} className="text-xs uppercase text-muted-foreground">Close</button>
          </div>
        </form>
      )}

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-50 bg-white text-neutral-900 md:hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
            <span className="wordmark text-xl tracking-[0.3em] text-foreground">PARVIOR</span>
            <button aria-label="Close" onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
          </div>
          <div className="flex flex-col p-6 gap-5 text-lg tracking-widest uppercase">
            {nav.map((n) => (
              <Link key={n.label} to={n.to} onClick={() => setOpen(false)}>{n.label}</Link>
            ))}
            <div className="border-t border-neutral-200 pt-4 flex flex-col gap-3 text-base">
              {user ? (
                <>
                  <Link to="/account/profile" onClick={() => setOpen(false)}>Profile</Link>
                  <Link to="/account/orders" onClick={() => setOpen(false)}>Orders</Link>
                  <button onClick={() => { setOpen(false); logout(); navigate("/"); }} className="text-left">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)}>Sign in</Link>
                  <Link to="/register" onClick={() => setOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
    {!transparentOnTop && <div aria-hidden className="h-[92px] md:h-[92px]" />}
    </>
  );
}
