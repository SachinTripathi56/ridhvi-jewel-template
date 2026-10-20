import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS, CATEGORIES } from "@/lib/products";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { apiAvailable } from "@/lib/http";
import type { Product } from "@/lib/types";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

function Shop() {
  const [sp] = useSearchParams();
  const [cat, setCat] = useState<string>("All");
  const [sort, setSort] = useState<string>("featured");

  const searchQuery = sp.get("search") ?? "";

  // Fetch from backend when available; otherwise use mock products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["shop-products", cat, sort, searchQuery],
    queryFn: async () => {
      if (!apiAvailable()) {
        // Fallback: filter mock products locally
        let out = PRODUCTS as Product[];
        if (cat !== "All") out = out.filter((p) => p.category === cat);
        if (searchQuery) out = out.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return out;
      }
      // Backend connected — fetch real products
      const opts: any = { sort, page: 0, size: 48 };
      if (cat !== "All") opts.category = cat;
      if (searchQuery) opts.search = searchQuery;
      return api.getProducts(opts);
    },
  });

  // Fetch categories from backend when available, else use static list
  const { data: backendCategories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.getCategories(),
    enabled: apiAvailable(),
  });
  const allCategories = backendCategories.length > 0
    ? backendCategories.map((c: any) => c.name)
    : [...CATEGORIES];

  return (
    <div className="min-h-screen">
      <Header />

      <section className="bg-secondary py-16 text-center">
        <h1 className="text-5xl">Shop</h1>
        <p className="mt-3 text-xs tracking-[0.3em] uppercase text-muted-foreground">
          {searchQuery ? `Search results for "${searchQuery}"` : "Home / Shop"}
        </p>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 py-16 grid md:grid-cols-[220px_1fr] gap-10">
        <aside>
          <h3 className="text-xs tracking-[0.3em] uppercase text-accent mb-4">Categories</h3>
          <ul className="space-y-2.5 text-sm">
            {["All", ...allCategories].map((c) => (
              <li key={c}>
                <button
                  onClick={() => setCat(c)}
                  className={`hover:text-accent ${cat === c ? "text-accent" : ""}`}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
          <h3 className="text-xs tracking-[0.3em] uppercase text-accent mt-10 mb-4">Brands</h3>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>Parvior Atelier</li>
            <li>Aurate</li>
            <li>Elsa Peretti</li>
            <li>Tiffany</li>
          </ul>

          {!apiAvailable() && (
            <div className="mt-10 border border-dashed border-amber-300 bg-amber-50 p-4 text-xs text-amber-700">
              <p className="font-semibold">Demo mode</p>
              <p className="mt-1">Backend not connected. Set <code>VITE_API_BASE_URL</code> in .env to show real products.</p>
            </div>
          )}
        </aside>

        <div>
          <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading…" : `${products.length} products`}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm bg-transparent border border-border px-3 py-2"
            >
              <option value="featured">Sort: Featured</option>
              <option value="newest">Newest</option>
              <option value="low">Price: Low → High</option>
              <option value="high">Price: High → Low</option>
            </select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" strokeWidth={1.5} />
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center text-muted-foreground">
              {apiAvailable()
                ? "No products found. Add products in the admin panel."
                : "No products match your filter."}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Shop;
