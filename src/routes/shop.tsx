import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS, CATEGORIES } from "@/lib/products";
import { useState } from "react";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Ridhvi Silver Jewellery" },
      { name: "description", content: "Browse our full collection of sterling silver rings, earrings, necklaces and bracelets." },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: Shop,
});

function Shop() {
  const [cat, setCat] = useState<string>("All");
  const [sort, setSort] = useState<string>("featured");
  const filtered = PRODUCTS.filter((p) => cat === "All" || p.category === cat);
  const sorted = [...filtered].sort((a, b) =>
    sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : 0
  );

  return (
    <div className="min-h-screen">
      <Header />

      <section className="bg-secondary py-16 text-center">
        <h1 className="text-5xl">Shop</h1>
        <p className="mt-3 text-xs tracking-[0.3em] uppercase text-muted-foreground">Home / Shop</p>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 py-16 grid md:grid-cols-[220px_1fr] gap-10">
        <aside>
          <h3 className="text-xs tracking-[0.3em] uppercase text-accent mb-4">Categories</h3>
          <ul className="space-y-2.5 text-sm">
            {["All", ...CATEGORIES].map((c) => (
              <li key={c}>
                <button onClick={() => setCat(c)} className={`hover:text-accent ${cat === c ? "text-accent" : ""}`}>{c}</button>
              </li>
            ))}
          </ul>
          <h3 className="text-xs tracking-[0.3em] uppercase text-accent mt-10 mb-4">Brands</h3>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>Ridhvi Atelier</li><li>Aurate</li><li>Elsa Peretti</li><li>Tiffany</li>
          </ul>
        </aside>

        <div>
          <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
            <p className="text-sm text-muted-foreground">{sorted.length} products</p>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm bg-transparent border border-border px-3 py-2">
              <option value="featured">Sort: Featured</option>
              <option value="low">Price: Low → High</option>
              <option value="high">Price: High → Low</option>
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {sorted.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
