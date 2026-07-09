import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";
import { getProduct, PRODUCTS } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { price } from "@/lib/format";
import { useState } from "react";
import { Heart, Share2, Minus, Plus, ChevronRight, X } from "lucide-react";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const p = getProduct(params.slug);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — Ridhvi` : "Product — Ridhvi" },
      { name: "description", content: loaderData?.description ?? "" },
      { property: "og:title", content: loaderData?.name ?? "Product" },
      { property: "og:type", content: "product" },
    ],
  }),
  errorComponent: () => <div className="p-20 text-center">Product not found.</div>,
  notFoundComponent: () => <div className="p-20 text-center">Product not found.</div>,
  component: ProductPage,
});

function ProductPage() {
  const product = Route.useLoaderData();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(false);
  const [open, setOpen] = useState<"desc" | "info" | "rev" | null>("desc");
  const related = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 4);

  const onAdd = () => {
    add(product, qty);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <div className="min-h-screen">
      <Header />

      {toast && (
        <div className="fixed top-24 right-6 z-50 bg-background border border-border shadow-lg p-4 flex items-center gap-4 max-w-sm">
          <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs">✓</div>
          <p className="text-sm flex-1">"{product.name}" has been added to your cart.</p>
          <Link to="/cart" className="text-[11px] tracking-[0.25em] uppercase border border-foreground px-4 py-2">View Cart</Link>
          <button onClick={() => setToast(false)}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-6 py-10 grid md:grid-cols-2 gap-12">
        <div className="relative bg-secondary">
          {product.badge && (
            <span className="absolute top-4 left-4 text-[10px] tracking-widest bg-foreground text-background px-2 py-1 z-10">{product.badge}</span>
          )}
          <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
        </div>

        <div>
          <nav className="flex items-center gap-2 text-xs text-muted-foreground tracking-wider uppercase">
            <Link to="/">Home</Link><ChevronRight className="w-3 h-3" />
            <Link to="/shop">Shop</Link><ChevronRight className="w-3 h-3" />
            <span>{product.category}</span><ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{product.name}</span>
          </nav>

          <h1 className="mt-6 text-4xl md:text-5xl">{product.name}</h1>
          <p className="mt-4 text-2xl">
            {product.oldPrice && <span className="text-muted-foreground line-through mr-3 text-lg">${product.oldPrice}</span>}
            ${product.price}
          </p>
          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-12 flex items-center justify-center hover:bg-secondary"><Minus className="w-3 h-3" /></button>
              <span className="w-12 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-11 h-12 flex items-center justify-center hover:bg-secondary"><Plus className="w-3 h-3" /></button>
            </div>
            <button onClick={onAdd} className="bg-primary text-primary-foreground px-12 py-3.5 text-[11px] tracking-[0.3em] uppercase hover:opacity-90 transition">Add to Cart</button>
          </div>

          <div className="mt-6 flex items-center gap-6 text-xs tracking-widest uppercase">
            <button className="flex items-center gap-2 hover:text-accent"><Heart className="w-3.5 h-3.5" />Add to Wishlist</button>
            <button className="flex items-center gap-2 hover:text-accent"><Share2 className="w-3.5 h-3.5" />Share</button>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-xs tracking-widest uppercase space-y-2">
            <p><span className="text-muted-foreground">SKU:</span> <span className="text-accent">{product.sku}</span></p>
            <p><span className="text-muted-foreground">Categories:</span> <span className="text-accent">{product.category}</span></p>
            <p><span className="text-muted-foreground">Tags:</span> <span className="text-accent">{product.tags.join(", ")}</span></p>
          </div>

          <div className="mt-8 border-t border-border">
            {([
              ["desc", "Description", product.description + " Each piece comes in a Ridhvi gift box with a certificate of authenticity."],
              ["info", "Additional Information", `Brand: ${product.brand ?? "Ridhvi Atelier"}\nMaterial: Sterling Silver 925\nFinish: Hand-polished`],
              ["rev", "Reviews (0)", "Be the first to review this piece."],
            ] as const).map(([k, title, body]) => (
              <div key={k} className="border-b border-border">
                <button onClick={() => setOpen(open === k ? null : k)} className="w-full flex items-center justify-between py-4 text-base">
                  <span>{title}</span>
                  <span className="text-accent">{open === k ? "−" : "+"}</span>
                </button>
                {open === k && <p className="pb-5 text-sm text-muted-foreground whitespace-pre-line">{body}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="max-w-[1400px] mx-auto px-6 mt-20">
        <SectionTitle>Related Products</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {related.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      <Footer />
    </div>
  );
}
