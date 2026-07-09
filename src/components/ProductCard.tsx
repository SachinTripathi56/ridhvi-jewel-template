import { Link } from "@tanstack/react-router";
import { Heart, Eye } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { price } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  return (
    <div className="group">
      <div className="relative aspect-[4/5] bg-secondary overflow-hidden rounded-3xl">
        <Link to="/product/$slug" params={{ slug: product.slug }}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
          />
        </Link>
        {product.badge && (
          <span className={`absolute top-3 left-3 text-[10px] tracking-widest px-2 py-1 ${
            product.badge === "SALE" ? "bg-accent text-accent-foreground" :
            product.badge === "NEW" ? "bg-foreground text-background" :
            "bg-primary text-primary-foreground"
          }`}>{product.badge}</span>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
          <button aria-label="Wishlist" className="w-8 h-8 rounded-full bg-background/90 flex items-center justify-center hover:text-accent"><Heart className="w-3.5 h-3.5" /></button>
          <Link to="/product/$slug" params={{ slug: product.slug }} aria-label="View" className="w-8 h-8 rounded-full bg-background/90 flex items-center justify-center hover:text-accent"><Eye className="w-3.5 h-3.5" /></Link>
        </div>
        <button
          onClick={() => add(product)}
          className="absolute bottom-0 left-0 right-0 bg-background/95 text-foreground py-3 text-[11px] tracking-[0.25em] uppercase translate-y-full group-hover:translate-y-0 transition border-t border-border"
        >
          Add to Cart
        </button>
      </div>
      <div className="pt-4 text-center">
        <p className="text-[10px] tracking-[0.2em] uppercase text-accent">{product.category}</p>
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block mt-1.5 text-base">{product.name}</Link>
        <div className="mt-2 text-sm flex items-center justify-center gap-2">
          {product.oldPrice && <span className="text-muted-foreground line-through">${product.oldPrice}</span>}
          <span>${product.price}</span>
        </div>
      </div>
    </div>
  );
}
