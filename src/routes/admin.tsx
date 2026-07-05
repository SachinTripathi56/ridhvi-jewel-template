import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { PRODUCTS } from "@/lib/products";
import { useBanners, type Banner } from "@/lib/banners";
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, TrendingUp, DollarSign, Eye, Plus, Trash2, Pencil, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Ridhvi" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "banners", label: "Banners", icon: ImageIcon },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "customers", label: "Customers", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

function AdminPage() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-secondary border-r border-border p-6 flex flex-col">
        <Logo />
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-2">Admin Panel</p>
        <nav className="mt-10 flex-1 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition ${tab === id ? "bg-background text-accent" : "text-muted-foreground hover:text-foreground"}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </nav>
        <Link to="/" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-accent"><LogOut className="w-4 h-4" /> Back to store</Link>
      </aside>

      <main className="flex-1 p-10 overflow-auto">
        {tab === "dashboard" && <Dashboard />}
        {tab === "products" && <Products />}
        {tab === "banners" && <Banners />}
        {tab === "orders" && <Orders />}
        {tab === "customers" && <Customers />}
        {tab === "settings" && <SettingsPanel />}
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint }: any) {
  return (
    <div className="bg-card border border-border p-6">
      <div className="flex items-center justify-between"><span className="text-xs tracking-widest uppercase text-muted-foreground">{label}</span><Icon className="w-4 h-4 text-accent" /></div>
      <p className="mt-3 text-3xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl">Dashboard</h1>
      <p className="text-sm text-muted-foreground mt-1">Welcome back to Ridhvi Admin.</p>
      <div className="grid md:grid-cols-4 gap-5 mt-8">
        <Stat icon={DollarSign} label="Revenue" value="$12,480" hint="+12% this month" />
        <Stat icon={ShoppingBag} label="Orders" value="184" hint="+8 today" />
        <Stat icon={Users} label="Customers" value="1,240" hint="+34 this week" />
        <Stat icon={Eye} label="Visitors" value="9,830" hint="Last 30 days" />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-10">
        <div className="bg-card border border-border p-6">
          <h3 className="text-lg mb-4">Recent Orders</h3>
          <div className="space-y-3 text-sm">
            {["#1024 — Aanya S.", "#1023 — Priya M.", "#1022 — Riya K.", "#1021 — Meera N."].map((o, i) => (
              <div key={o} className="flex justify-between border-b border-border pb-2">
                <span>{o}</span><span className="text-accent">${[450, 280, 720, 195][i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border p-6">
          <h3 className="text-lg mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" />Top Products</h3>
          <div className="space-y-3 text-sm">
            {PRODUCTS.slice(0, 4).map((p) => (
              <div key={p.slug} className="flex items-center gap-3 border-b border-border pb-2">
                <img src={p.image} className="w-10 h-10 object-cover" alt={p.name} />
                <span className="flex-1">{p.name}</span>
                <span>${p.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Products() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Products</h1>
        <button className="bg-primary text-primary-foreground px-5 py-2.5 text-xs tracking-widest uppercase flex items-center gap-2"><Plus className="w-3.5 h-3.5" />Add Product</button>
      </div>
      <div className="mt-8 bg-card border border-border">
        <table className="w-full text-sm">
          <thead className="text-[11px] tracking-widest uppercase text-muted-foreground border-b border-border">
            <tr><th className="text-left p-4">Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p) => (
              <tr key={p.slug} className="border-b border-border">
                <td className="p-4"><div className="flex items-center gap-3"><img src={p.image} className="w-10 h-10 object-cover" alt={p.name} /><span>{p.name}</span></div></td>
                <td className="text-center text-muted-foreground">{p.sku}</td>
                <td className="text-center">{p.category}</td>
                <td className="text-center">${p.price}</td>
                <td className="text-center">In stock</td>
                <td className="p-4 text-right"><div className="flex justify-end gap-2"><button className="p-1.5 hover:text-accent"><Pencil className="w-3.5 h-3.5" /></button><button className="p-1.5 hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Orders() {
  const orders = [
    { id: "#1024", name: "Aanya S.", total: 450, status: "Pending", date: "2026-06-29" },
    { id: "#1023", name: "Priya M.", total: 280, status: "Shipped", date: "2026-06-28" },
    { id: "#1022", name: "Riya K.", total: 720, status: "Delivered", date: "2026-06-27" },
    { id: "#1021", name: "Meera N.", total: 195, status: "Delivered", date: "2026-06-26" },
  ];
  return (
    <div>
      <h1 className="text-3xl">Orders</h1>
      <div className="mt-8 bg-card border border-border">
        <table className="w-full text-sm">
          <thead className="text-[11px] tracking-widest uppercase text-muted-foreground border-b border-border">
            <tr><th className="text-left p-4">Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border">
                <td className="p-4 text-accent">{o.id}</td>
                <td className="text-center">{o.name}</td>
                <td className="text-center text-muted-foreground">{o.date}</td>
                <td className="text-center">${o.total}</td>
                <td className="text-center"><span className={`text-[10px] tracking-widest uppercase px-2 py-1 ${o.status === "Delivered" ? "bg-secondary text-foreground" : o.status === "Shipped" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Customers() {
  const customers = [
    { name: "Aanya Sharma", email: "aanya@example.com", orders: 4, spent: 1820 },
    { name: "Priya Mehta", email: "priya@example.com", orders: 2, spent: 540 },
    { name: "Riya Kapoor", email: "riya@example.com", orders: 7, spent: 3140 },
  ];
  return (
    <div>
      <h1 className="text-3xl">Customers</h1>
      <div className="mt-8 bg-card border border-border">
        <table className="w-full text-sm">
          <thead className="text-[11px] tracking-widest uppercase text-muted-foreground border-b border-border">
            <tr><th className="text-left p-4">Name</th><th>Email</th><th>Orders</th><th>Spent</th></tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.email} className="border-b border-border">
                <td className="p-4">{c.name}</td>
                <td className="text-center text-muted-foreground">{c.email}</td>
                <td className="text-center">{c.orders}</td>
                <td className="text-center">${c.spent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div>
      <h1 className="text-3xl">Settings</h1>
      <div className="mt-8 max-w-xl space-y-5 bg-card border border-border p-8">
        <div><label className="text-xs tracking-widest uppercase">Store name</label><input defaultValue="Ridhvi Atelier" className="mt-2 w-full bg-background border border-border px-4 py-2.5 text-sm" /></div>
        <div><label className="text-xs tracking-widest uppercase">Contact email</label><input defaultValue="hello@ridhvi.com" className="mt-2 w-full bg-background border border-border px-4 py-2.5 text-sm" /></div>
        <div><label className="text-xs tracking-widest uppercase">Currency</label><select className="mt-2 w-full bg-background border border-border px-4 py-2.5 text-sm"><option>USD ($)</option><option>INR (₹)</option><option>EUR (€)</option></select></div>
        <button className="bg-primary text-primary-foreground px-8 py-3 text-xs tracking-widest uppercase">Save Changes</button>
      </div>
    </div>
  );
}

function Banners() {
  const { banners, intervalSec, save, saveInterval } = useBanners();
  const [draft, setDraft] = useState<Banner>({ id: "", image: "", title: "", subtitle: "", cta: "Shop Now", href: "/shop" });

  const add = () => {
    if (!draft.image) return;
    save([...banners, { ...draft, id: crypto.randomUUID() }]);
    setDraft({ id: "", image: "", title: "", subtitle: "", cta: "Shop Now", href: "/shop" });
  };
  const remove = (id: string) => save(banners.filter((b) => b.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Home Banners</h1>
        <div className="flex items-center gap-3">
          <label className="text-xs tracking-widest uppercase text-muted-foreground">Rotate every</label>
          <input type="number" min={2} value={intervalSec} onChange={(e) => saveInterval(Math.max(2, Number(e.target.value) || 5))} className="w-20 bg-background border border-border px-3 py-2 text-sm" />
          <span className="text-xs text-muted-foreground">seconds</span>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-5">
        {banners.map((b) => (
          <div key={b.id} className="bg-card border border-border overflow-hidden">
            <img src={b.image} alt={b.title} className="w-full h-40 object-cover" />
            <div className="p-4 flex items-start justify-between gap-4">
              <div className="text-sm">
                <p className="font-medium whitespace-pre-line">{b.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{b.subtitle}</p>
              </div>
              <button onClick={() => remove(b.id)} className="p-2 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-card border border-border p-6 max-w-2xl">
        <h3 className="text-lg mb-4 flex items-center gap-2"><Plus className="w-4 h-4" />Add banner</h3>
        <div className="space-y-3 text-sm">
          <div><label className="text-xs tracking-widest uppercase">Image URL</label><input value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} placeholder="https://…" className="mt-1 w-full bg-background border border-border px-3 py-2" /></div>
          <div><label className="text-xs tracking-widest uppercase">Title</label><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="mt-1 w-full bg-background border border-border px-3 py-2" /></div>
          <div><label className="text-xs tracking-widest uppercase">Subtitle</label><input value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} className="mt-1 w-full bg-background border border-border px-3 py-2" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs tracking-widest uppercase">CTA label</label><input value={draft.cta} onChange={(e) => setDraft({ ...draft, cta: e.target.value })} className="mt-1 w-full bg-background border border-border px-3 py-2" /></div>
            <div><label className="text-xs tracking-widest uppercase">CTA link</label><input value={draft.href} onChange={(e) => setDraft({ ...draft, href: e.target.value })} className="mt-1 w-full bg-background border border-border px-3 py-2" /></div>
          </div>
          <button onClick={add} className="bg-primary text-primary-foreground px-6 py-2.5 text-xs tracking-widest uppercase">Add Banner</button>
        </div>
      </div>
    </div>
  );
}
