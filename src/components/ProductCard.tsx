import { Link } from "react-router-dom";
import { Heart, Eye } from "lucide-react";
import type { Product } from "@/lib/types";
import { cart } from "@/lib/cart-store";
import { wishlist, useWishlist } from "@/lib/wishlist-store";
import { formatPrice } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const wishIds = useWishlist();
  const isWished = wishIds.includes(product.id);
  const [hovered, setHovered] = useState(false);

  // Second image for hover effect (if available)
  const primaryImage = product.image;
  const hoverImage =
    product.gallery && product.gallery.length > 1
      ? product.gallery.find((img) => img !== primaryImage) ?? product.gallery[1]
      : null;

  async function handleAddToCart() {
    try {
      await cart.add(product.id, 1);
      toast.success(`"${product.name}" added to cart`);
    } catch (err: any) {
      toast.error(err?.message ?? "Could not add to cart");
    }
  }

  async function handleWishlist() {
    await wishlist.toggle(product.id);
  }

  const displayPrice = formatPrice(product.price);
  const displayOldPrice = product.oldPrice ? formatPrice(product.oldPrice) : null;

  return (
    <div
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[4/5] bg-secondary overflow-hidden rounded-3xl">
        <Link to={`/products/${product.slug}`}>
          {/* Primary image */}
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
              hovered && hoverImage ? "opacity-0 scale-105" : "opacity-100 scale-100"
            }`}
          />
          {/* Hover image (second gallery image) */}
          {hoverImage && (
            <img
              src={hoverImage}
              alt={`${product.name} — alternate view`}
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                hovered ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
            />
          )}
          {/* Subtle scale on hover when no second image */}
          {!hoverImage && (
            <span className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105 bg-transparent" />
          )}
        </Link>

        {product.badge && (
          <span className={`absolute top-3 left-3 text-[10px] tracking-widest px-2 py-1 z-10 ${
            product.badge === "SALE" ? "bg-accent text-accent-foreground" :
            product.badge === "NEW" ? "bg-foreground text-background" :
            "bg-primary text-primary-foreground"
          }`}>{product.badge}</span>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition z-10">
          <button
            aria-label="Wishlist"
            onClick={handleWishlist}
            className={`w-8 h-8 rounded-full bg-background/90 flex items-center justify-center hover:text-accent ${isWished ? "text-accent" : ""}`}
          >
            <Heart className="w-3.5 h-3.5" />
          </button>
          <Link to={`/products/${product.slug}`} aria-label="View" className="w-8 h-8 rounded-full bg-background/90 flex items-center justify-center hover:text-accent">
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>
        <button
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 bg-background/95 text-foreground py-3 text-[11px] tracking-[0.25em] uppercase translate-y-full group-hover:translate-y-0 transition border-t border-border z-10"
        >
          Add to Cart
        </button>
      </div>
      <div className="pt-4 text-center">
        <p className="text-[10px] tracking-[0.2em] uppercase text-accent">{product.category}</p>
        <Link to={`/products/${product.slug}`} className="block mt-1.5 text-base">{product.name}</Link>
        <div className="mt-2 text-sm flex items-center justify-center gap-2">
          {displayOldPrice && <span className="text-muted-foreground line-through">{displayOldPrice}</span>}
          <span>{displayPrice}</span>
        </div>
      </div>
    </div>
  );
}
