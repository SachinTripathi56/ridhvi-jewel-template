import { Link } from "react-router-dom";
import { useWishlist, wishlist } from "@/lib/wishlist-store";
import { PRODUCTS } from "@/lib/products";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { apiAvailable } from "@/lib/http";
import type { Product } from "@/lib/types";
import { adaptProduct } from "@/lib/types";

function WishlistPage() {
  const wishIds = useWishlist();

  // If backend is available, load full product info; otherwise use mock
  const { data: wishProducts = [] } = useQuery<Product[]>({
    queryKey: ["wishlist-products", wishIds],
    enabled: wishIds.length > 0,
    queryFn: async () => {
      if (!apiAvailable() || wishIds.length === 0) {
        return PRODUCTS.filter((p) => wishIds.includes(p.id)) as Product[];
      }
      const results = await Promise.allSettled(
        wishIds.map((id) => api.getProduct(id))
      );
      return results
        .filter((r): r is PromiseFulfilledResult<Product | null> => r.status === "fulfilled" && r.value !== null)
        .map((r) => r.value as Product);
    },
  });

  return (
    <div>
      <h2 className="text-2xl mb-6">Wishlist ({wishIds.length})</h2>
      {wishIds.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">No items in your wishlist.</p>
          <Link to="/shop" className="inline-block mt-6 bg-primary text-primary-foreground px-8 py-3 text-[11px] tracking-[0.3em] uppercase">Browse jewellery</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {wishProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
