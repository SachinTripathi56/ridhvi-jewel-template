import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { LayoutDashboard, Package, ShoppingBag, Users, Star, Tag, ArrowLeft, FolderOpen, Image as ImageIcon, Layers, Settings, Loader } from "lucide-react";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderOpen },
  { to: "/admin/collections", label: "Collections", icon: Layers },
  { to: "/admin/banners", label: "Banners", icon: ImageIcon },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/settings", label: "Site Settings", icon: Settings },
  { to: "/admin/splash", label: "Splash Screen", icon: Loader },
];


function AdminLayout() {
  const { user, hasRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !hasRole("ADMIN")) {
      navigate("/", { replace: true });
    }
  }, [loading, hasRole, navigate]);

  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</div>;
  if (!user || !hasRole("ADMIN")) return null;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-60 border-r border-border bg-secondary/50 p-6">
        <div className="mb-10">
          <span className="wordmark text-2xl tracking-[0.3em] text-foreground">Parvior</span>
          <p className="text-[10px] tracking-widest text-muted-foreground mt-1">Admin Panel</p>
        </div>
        <nav className="space-y-1">
          {items.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === to : location.pathname === to || location.pathname.startsWith(to + "/");
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-sm transition ${active ? "bg-foreground text-background" : "text-foreground/80 hover:bg-background"}`}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-10 border-t border-border pt-6">
          <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Back to store
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-10"><Outlet /></main>
    </div>
  );
}

export default AdminLayout;
