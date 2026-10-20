import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";
import { cart } from "@/lib/cart-store";
import { useCart } from "@/lib/cart";
import { wishlist, useWishlist } from "@/lib/wishlist-store";
import { api, formatPrice } from "@/lib/api";
import { apiAvailable } from "@/lib/http";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { Heart, Share2, Minus, Plus, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/lib/types";
import { adaptProduct } from "@/lib/types";

function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const wishIds = useWishlist();
  const localCart = useCart();
  const { user } = useAuth();

  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState<"desc" | "info" | "rev" | null>("desc");

  // Fetch from backend when available, no static mock fallback
  const { data: product, isLoading } = useQuery<Product | null>({
    queryKey: ["product", slug],
    queryFn: async () => {
      if (apiAvailable()) {
        const raw = await api.getProduct(slug ?? "");
        return raw;
      }
      return null; // no backend = no product
    },
    enabled: Boolean(slug),
    retry: 1,
  });

  // Related products — same category from backend, empty if no backend
  const { data: related = [] } = useQuery<Product[]>({
    queryKey: ["related", product?.category],
    queryFn: async () => {
      if (!apiAvailable() || !product?.category) return [];
      const all = await api.getProducts({ category: product.category, size: 8 });
      return all.filter((p) => p.slug !== product.slug).slice(0, 4);
    },
    enabled: Boolean(product),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="p-20 text-center">
          <p className="text-muted-foreground">Product not found.</p>
          <Link to="/shop" className="mt-6 inline-block bg-primary text-primary-foreground px-8 py-3 text-[11px] tracking-[0.3em] uppercase">Back to Shop</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isWished = wishIds.includes(product.id);

  async function onAdd() {
    // Require login
    if (!user) {
      toast.error("Please sign in to add items to your cart.", {
        action: { label: "Sign In", onClick: () => navigate("/login") },
      });
      navigate("/login");
      return;
    }
    try {
      if (apiAvailable()) {
        await cart.add(product!.id, qty);
      } else {
        localCart.add(product! as any, qty);
      }
      toast.success(`"${product!.name}" added to cart`, {
        action: { label: "View Cart", onClick: () => navigate("/cart") },
      });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not add to cart");
    }
  }

  async function onWishlist() {
    if (!user) {
      toast.error("Please sign in to save items to your wishlist.", {
        action: { label: "Sign In", onClick: () => navigate("/login") },
      });
      navigate("/login");
      return;
    }
    await wishlist.toggle(product!.id);
    toast.success(isWished ? "Removed from wishlist" : "Added to wishlist");
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="max-w-[1400px] mx-auto px-6 py-10 grid md:grid-cols-2 gap-12">
        <div className="relative bg-secondary">
          {product.badge && (
            <span className="absolute top-4 left-4 text-[10px] tracking-widest bg-foreground text-background px-2 py-1 z-10">{product.badge}</span>
          )}
          <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
          {/* Thumbnail gallery */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="flex gap-2 mt-2 px-2">
              {product.gallery.slice(0, 5).map((img, i) => (
                <img key={i} src={img} alt="" className="w-14 h-14 object-cover border border-border cursor-pointer hover:border-accent" />
              ))}
            </div>
          )}
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
            {product.oldPrice && <span className="text-muted-foreground line-through mr-3 text-lg">{formatPrice(product.oldPrice)}</span>}
            {formatPrice(product.price)}
          </p>
          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description || product.shortDescription}</p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-12 flex items-center justify-center hover:bg-secondary"><Minus className="w-3 h-3" /></button>
              <span className="w-12 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-11 h-12 flex items-center justify-center hover:bg-secondary"><Plus className="w-3 h-3" /></button>
            </div>
            <button onClick={onAdd} className="bg-primary text-primary-foreground px-12 py-3.5 text-[11px] tracking-[0.3em] uppercase hover:opacity-90 transition">Add to Cart</button>
          </div>

          <div className="mt-6 flex items-center gap-6 text-xs tracking-widest uppercase">
            <button onClick={onWishlist} className={`flex items-center gap-2 hover:text-accent ${isWished ? "text-accent" : ""}`}>
              <Heart className="w-3.5 h-3.5" />{isWished ? "Wishlisted" : "Add to Wishlist"}
            </button>
            <button className="flex items-center gap-2 hover:text-accent"><Share2 className="w-3.5 h-3.5" />Share</button>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-xs tracking-widest uppercase space-y-2">
            {product.sku && <p><span className="text-muted-foreground">SKU:</span> <span className="text-accent">{product.sku}</span></p>}
            <p><span className="text-muted-foreground">Categories:</span> <span className="text-accent">{product.category}</span></p>
            {product.tags && product.tags.length > 0 && (
              <p><span className="text-muted-foreground">Tags:</span> <span className="text-accent">{product.tags.join(", ")}</span></p>
            )}
          </div>

          <div className="mt-8 border-t border-border">
            {([
              ["desc", "Description", product.description || product.shortDescription || ""],
              ["info", "Additional Information", `Brand: ${product.brand ?? "Parvior Atelier"}\nMaterial: Sterling Silver 925\nFinish: Hand-polished`],
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

      {/* Related Products — only shown when real DB products exist */}
      {related.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 mt-20">
          <SectionTitle>Related Products</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

export default ProductPage;
