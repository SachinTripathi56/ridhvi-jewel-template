import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";
import { PRODUCTS, CATEGORIES } from "@/lib/products";
import { useState } from "react";
import { Truck, ShieldCheck, MessageCircle, Award } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ridhvi — Hand-finished silver jewellery" },
      { name: "description", content: "Modern heirloom silver jewellery, hand-finished in our atelier." },
      { property: "og:title", content: "Ridhvi" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const [tab, setTab] = useState<"new" | "featured" | "sale">("new");
  const tabbed = PRODUCTS.filter((p) =>
    tab === "new" ? p.badge === "NEW" : tab === "featured" ? p.badge === "FEATURED" : !!p.oldPrice
  ).slice(0, 4);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="grid md:grid-cols-2 bg-background">
        <div className="flex items-center px-10 md:px-20 py-20 bg-secondary">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-accent">New in our shop</p>
            <h1 className="mt-4 text-5xl md:text-6xl leading-tight">Quiet Brilliance<br />in Sterling Silver</h1>
            <p className="mt-5 max-w-md text-muted-foreground">Hand-finished pieces designed for everyday rituals and lifelong wear.</p>
            <Link to="/shop" className="inline-block mt-8 bg-primary text-primary-foreground px-10 py-3.5 text-[11px] tracking-[0.3em] uppercase hover:opacity-90 transition">Shop Now</Link>
          </div>
        </div>
        <div className="aspect-[4/5] md:aspect-auto">
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=80"
            alt="Silver pendant on neck"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Promo cards */}
      <section className="max-w-[1400px] mx-auto px-6 mt-16 grid md:grid-cols-3 gap-5">
        {[
          { t: "Earrings Collection", s: "15% Off", img: "https://images.unsplash.com/photo-1535556116002-6281ff3e9f36?w=800&q=80" },
          { t: "Pendant Hoops", s: "10% Off", img: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=80" },
          { t: "Ring Edit", s: "Shop Bestsellers", img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80" },
        ].map((c) => (
          <Link to="/shop" key={c.t} className="group relative aspect-[4/3] overflow-hidden bg-secondary">
            <img src={c.img} alt={c.t} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-700" />
            <div className="absolute inset-0 bg-foreground/15" />
            <div className="absolute inset-0 flex flex-col justify-center px-8 text-background">
              <h3 className="text-3xl">{c.t}</h3>
              <p className="mt-2 text-xs tracking-[0.3em] uppercase">{c.s}</p>
              <span className="mt-5 inline-block w-fit border border-background/80 px-6 py-2 text-[10px] tracking-[0.3em] uppercase">Explore</span>
            </div>
          </Link>
        ))}
      </section>

      {/* Tabbed product showcase */}
      <section className="max-w-[1400px] mx-auto px-6 mt-24">
        <SectionTitle subtitle="Curated by our atelier.">Our Edit</SectionTitle>
        <div className="flex justify-center gap-10 mb-10 text-[11px] tracking-[0.3em] uppercase">
          {(["new", "featured", "sale"] as const).map((k) => (
            <button key={k} onClick={() => setTab(k)} className={`pb-2 border-b ${tab === k ? "border-accent text-foreground" : "border-transparent text-muted-foreground"}`}>
              {k === "new" ? "New Arrived" : k === "featured" ? "Featured" : "On Sale"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {tabbed.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      {/* About brand */}
      <section className="grid md:grid-cols-2 mt-24">
        <img src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1200&q=80" alt="Atelier" className="w-full aspect-[4/3] object-cover" />
        <div className="flex items-center px-10 md:px-20 py-16 bg-secondary">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-accent">About Ridhvi</p>
            <h2 className="mt-4 text-4xl md:text-5xl">Made by hand,<br />meant to last.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">Every piece is cast, finished and polished by our small team. We work in solid sterling silver and ethically-sourced stones, so each Ridhvi piece can be worn — and re-worn — for a lifetime.</p>
            <Link to="/shop" className="inline-block mt-7 border border-foreground px-8 py-3 text-[11px] tracking-[0.3em] uppercase hover:bg-foreground hover:text-background transition">Discover More</Link>
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="max-w-[1400px] mx-auto px-6 mt-24">
        <SectionTitle>Shop by Category</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {CATEGORIES.map((c, i) => (
            <Link to="/shop" key={c} className="group relative aspect-square overflow-hidden bg-secondary">
              <img src={`https://images.unsplash.com/photo-${["1515562141207-7a88fb7ce338","1611591437281-460bfbe1220a","1602173574767-37ac01994b2a","1535632787350-4e68ef0ac584"][i]}?w=600&q=80`} alt={c} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-x-0 bottom-0 bg-background/90 py-3 text-center text-[11px] tracking-[0.3em] uppercase">{c}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="max-w-[1400px] mx-auto px-6 mt-24">
        <SectionTitle subtitle="Loved by the Ridhvi community.">Bestsellers</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {PRODUCTS.slice(0, 4).map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1400px] mx-auto px-6 mt-24 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { i: Truck, t: "Free Delivery" },
          { i: ShieldCheck, t: "Money Back Guarantee" },
          { i: MessageCircle, t: "24/7 Support" },
          { i: Award, t: "Hand-finished Quality" },
        ].map(({ i: Icon, t }) => (
          <div key={t} className="flex items-center justify-center gap-3 py-6">
            <Icon className="w-5 h-5 text-accent" />
            <span className="text-sm tracking-wide">{t}</span>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
}
