import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { PRODUCTS } from "@/lib/products";
import { useBanners, type Banner } from "@/lib/banners";
import { useStory } from "@/lib/story";
import { useAdminAuth, signOut, getCreds, setCreds } from "@/lib/admin-auth";
import { price } from "@/lib/format";
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, TrendingUp, IndianRupee, Eye, Plus, Trash2, Pencil, Image as ImageIcon, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Parvior" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "banners", label: "Banners", icon: ImageIcon },
  { id: "story", label: "Story", icon: BookOpen },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "customers", label: "Customers", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

function AdminPage() {
  const isAdmin = useAdminAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    if (!isAdmin) navigate({ to: "/admin-login" });
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

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
        <button onClick={() => { signOut(); navigate({ to: "/" }); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-accent"><LogOut className="w-4 h-4" /> Sign out</button>
        <Link to="/" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-accent">← Back to store</Link>
      </aside>

      <main className="flex-1 p-10 overflow-auto">
        {tab === "dashboard" && <Dashboard />}
        {tab === "products" && <Products />}
        {tab === "banners" && <Banners />}
        {tab === "story" && <StoryEditor />}
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
      <p className="text-sm text-muted-foreground mt-1">Welcome back to Parvior Admin.</p>
      <div className="grid md:grid-cols-4 gap-5 mt-8">
        <Stat icon={IndianRupee} label="Revenue" value="₹9,86,000" hint="+12% this month" />
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
                <span>{o}</span><span className="text-accent">{price([36000, 22400, 57600, 15600][i])}</span>
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
                <span>{price(p.price)}</span>
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
                <td className="text-center">{price(p.price)}</td>
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
    { id: "#1024", name: "Aanya S.", total: 36000, status: "Pending", date: "2026-06-29" },
    { id: "#1023", name: "Priya M.", total: 22400, status: "Shipped", date: "2026-06-28" },
    { id: "#1022", name: "Riya K.", total: 57600, status: "Delivered", date: "2026-06-27" },
    { id: "#1021", name: "Meera N.", total: 15600, status: "Delivered", date: "2026-06-26" },
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
                <td className="text-center">{price(o.total)}</td>
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
    { name: "Aanya Sharma", email: "aanya@example.com", orders: 4, spent: 145600 },
    { name: "Priya Mehta", email: "priya@example.com", orders: 2, spent: 43200 },
    { name: "Riya Kapoor", email: "riya@example.com", orders: 7, spent: 251200 },
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
                <td className="text-center">{price(c.spent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsPanel() {
  const initial = getCreds();
  const [email, setEmail] = useState(initial.email);
  const [password, setPassword] = useState(initial.password);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setCreds({ email, password });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div>
      <h1 className="text-3xl">Settings</h1>
      <div className="mt-8 max-w-xl space-y-5 bg-card border border-border p-8">
        <h2 className="text-lg">Admin Credentials</h2>
        <div><label className="text-xs tracking-widest uppercase">Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full bg-background border border-border px-4 py-2.5 text-sm" /></div>
        <div><label className="text-xs tracking-widest uppercase">Password</label><input value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full bg-background border border-border px-4 py-2.5 text-sm" /></div>
        <button onClick={save} className="bg-primary text-primary-foreground px-8 py-3 text-xs tracking-widest uppercase">Save Credentials</button>
        {saved && <p className="text-xs text-accent">Saved.</p>}
      </div>
      <div className="mt-8 max-w-xl space-y-5 bg-card border border-border p-8">
        <h2 className="text-lg">Store</h2>
        <div><label className="text-xs tracking-widest uppercase">Store name</label><input defaultValue="Parvior Atelier" className="mt-2 w-full bg-background border border-border px-4 py-2.5 text-sm" /></div>
        <div><label className="text-xs tracking-widest uppercase">Contact email</label><input defaultValue="hello@parvior.com" className="mt-2 w-full bg-background border border-border px-4 py-2.5 text-sm" /></div>
        <div><label className="text-xs tracking-widest uppercase">Currency</label><select className="mt-2 w-full bg-background border border-border px-4 py-2.5 text-sm"><option>INR (₹)</option><option>USD ($)</option><option>EUR (€)</option></select></div>
      </div>
    </div>
  );
}

function Banners() {
  const { banners, intervalSec, save, saveInterval } = useBanners();
  const [draft, setDraft] = useState<Banner>({ id: "", image: "", title: "", subtitle: "", cta: "Shop Now", href: "/shop", showText: true });

  const add = () => {
    if (!draft.image) return;
    save([...banners, { ...draft, id: crypto.randomUUID() }]);
    setDraft({ id: "", image: "", title: "", subtitle: "", cta: "Shop Now", href: "/shop", showText: true });
  };
  const remove = (id: string) => save(banners.filter((b) => b.id !== id));
  const toggleText = (id: string) => save(banners.map((b) => b.id === id ? { ...b, showText: !(b.showText ?? true) } : b));

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
        {banners.map((b) => {
          const shown = b.showText ?? true;
          return (
            <div key={b.id} className="bg-card border border-border overflow-hidden">
              <img src={b.image} alt={b.title} className="w-full h-40 object-cover" />
              <div className="p-4 flex items-start justify-between gap-4">
                <div className="text-sm">
                  <p className="font-medium whitespace-pre-line">{b.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{b.subtitle}</p>
                </div>
                <button onClick={() => remove(b.id)} className="p-2 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="px-4 pb-4 flex items-center justify-between">
                <span className="text-xs tracking-widest uppercase text-muted-foreground">Show text overlay</span>
                <button
                  onClick={() => toggleText(b.id)}
                  role="switch"
                  aria-checked={shown}
                  className={`relative w-11 h-6 rounded-full transition ${shown ? "bg-[#8B1F2B]" : "bg-neutral-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition ${shown ? "translate-x-5" : ""}`} />
                </button>
              </div>
            </div>
          );
        })}
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
          <label className="flex items-center gap-2 text-xs tracking-widest uppercase">
            <input type="checkbox" checked={draft.showText ?? true} onChange={(e) => setDraft({ ...draft, showText: e.target.checked })} />
            Show text overlay on home
          </label>
          <button onClick={add} className="bg-primary text-primary-foreground px-6 py-2.5 text-xs tracking-widest uppercase">Add Banner</button>
        </div>
      </div>
    </div>
  );
}

function StoryEditor() {
  const { story, save } = useStory();
  const [draft, setDraft] = useState(story);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setDraft(story); }, [story]);

  const commit = () => {
    save(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div>
      <h1 className="text-3xl">Story Section</h1>
      <p className="text-sm text-muted-foreground mt-1">Edit the "About Parvior" banner shown on the home page.</p>

      <div className="mt-8 grid md:grid-cols-2 gap-8">
        <div className="bg-card border border-border p-6 space-y-4">
          <div><label className="text-xs tracking-widest uppercase">Eyebrow</label><input value={draft.eyebrow} onChange={(e) => setDraft({ ...draft, eyebrow: e.target.value })} className="mt-1 w-full bg-background border border-border px-3 py-2 text-sm" /></div>
          <div><label className="text-xs tracking-widest uppercase">Title (use \n for line break)</label>
            <textarea rows={2} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="mt-1 w-full bg-background border border-border px-3 py-2 text-sm" /></div>
          <div><label className="text-xs tracking-widest uppercase">Body</label>
            <textarea rows={5} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} className="mt-1 w-full bg-background border border-border px-3 py-2 text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs tracking-widest uppercase">CTA label</label><input value={draft.cta} onChange={(e) => setDraft({ ...draft, cta: e.target.value })} className="mt-1 w-full bg-background border border-border px-3 py-2 text-sm" /></div>
            <div><label className="text-xs tracking-widest uppercase">CTA link</label><input value={draft.href} onChange={(e) => setDraft({ ...draft, href: e.target.value })} className="mt-1 w-full bg-background border border-border px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="text-xs tracking-widest uppercase">Image URL</label><input value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} className="mt-1 w-full bg-background border border-border px-3 py-2 text-sm" /></div>
          <button onClick={commit} className="bg-primary text-primary-foreground px-8 py-3 text-xs tracking-widest uppercase">Save Story</button>
          {saved && <p className="text-xs text-accent">Saved.</p>}
        </div>

        <div className="bg-card border border-border overflow-hidden">
          <div className="relative h-80">
            <img src={draft.image} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <div className="relative z-10 p-8 text-white h-full flex flex-col justify-center">
              <p className="text-[10px] tracking-[0.35em] uppercase text-white/80">{draft.eyebrow}</p>
              <h3 className="mt-3 font-display text-3xl whitespace-pre-line leading-tight">{draft.title}</h3>
              <p className="mt-3 text-sm text-white/85 max-w-sm">{draft.body}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
