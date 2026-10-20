import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { cart } from "@/lib/cart-store";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/api";
import { Minus, Plus, X } from "lucide-react";
import type { BackendCart } from "@/lib/types";
import { price } from "@/lib/format";
import { apiAvailable } from "@/lib/http";

/** Backend-mode cart page — fetches from server */
function BackendCartPage() {
  const [data, setData] = useState<BackendCart | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const c = await cart.fetch();
    setData(c);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const items = data?.items ?? [];
  const subtotal = Number(data?.subtotal ?? 0);

  async function handleRemove(itemId: string, qty: number) {
    await cart.remove(itemId, qty);
    reload();
  }

  async function handleUpdate(itemId: string, newQty: number) {
    if (newQty <= 0) { await handleRemove(itemId, 1); return; }
    await cart.update(itemId, newQty);
    reload();
  }

  return (
    <div className="min-h-screen">
      <Header />
      <section className="bg-secondary py-14 text-center">
        <h1 className="text-5xl">Cart</h1>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 py-16">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground animate-pulse">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link to="/shop" className="inline-block mt-6 bg-primary text-primary-foreground px-10 py-3.5 text-[11px] tracking-[0.3em] uppercase">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_360px] gap-10">
            <div>
              <table className="w-full">
                <thead className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground border-b border-border">
                  <tr><th className="text-left py-4">Product</th><th>Price</th><th>Qty</th><th>Total</th><th></th></tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-border">
                      <td className="py-5">
                        <div className="flex items-center gap-4">
                          <img src={item.productImageUrl} alt={item.productName} className="w-16 h-16 object-cover bg-secondary" />
                          <Link to={`/products/${item.productSlug}`}>{item.productName}</Link>
                        </div>
                      </td>
                      <td className="text-center">{price(item.unitPrice)}</td>
                      <td>
                        <div className="flex items-center justify-center border border-border w-fit mx-auto">
                          <button onClick={() => handleUpdate(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button onClick={() => handleUpdate(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                        </div>
                      </td>
                      <td className="text-center">{price(item.totalPrice)}</td>
                      <td className="text-right">
                        <button onClick={() => handleRemove(item.id, item.quantity)} aria-label="Remove">
                          <X className="w-4 h-4 text-muted-foreground hover:text-accent" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <aside className="bg-secondary p-8 h-fit">
              <h3 className="text-xl mb-6">Cart Totals</h3>
              <div className="flex justify-between py-3 border-b border-border text-sm"><span>Subtotal</span><span>{price(subtotal)}</span></div>
              <div className="flex justify-between py-3 border-b border-border text-sm"><span>Shipping</span><span>Calculated at checkout</span></div>
              <div className="flex justify-between py-4 text-lg"><span>Total</span><span>{price(subtotal)}</span></div>
              <Link to="/checkout" className="block text-center mt-4 bg-primary text-primary-foreground py-3.5 text-[11px] tracking-[0.3em] uppercase">Checkout</Link>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

/** Local-storage-mode cart page — reads from CartProvider */
function LocalCartPage() {
  const { items, remove, setQty, subtotal } = useCart();

  return (
    <div className="min-h-screen">
      <Header />
      <section className="bg-secondary py-14 text-center">
        <h1 className="text-5xl">Cart</h1>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 py-16">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link to="/shop" className="inline-block mt-6 bg-primary text-primary-foreground px-10 py-3.5 text-[11px] tracking-[0.3em] uppercase">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_360px] gap-10">
            <div>
              <table className="w-full">
                <thead className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground border-b border-border">
                  <tr><th className="text-left py-4">Product</th><th>Price</th><th>Qty</th><th>Total</th><th></th></tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.product.slug} className="border-b border-border">
                      <td className="py-5">
                        <div className="flex items-center gap-4">
                          <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover bg-secondary" />
                          <Link to={`/product/${item.product.slug}`}>{item.product.name}</Link>
                        </div>
                      </td>
                      <td className="text-center">{price(item.product.price)}</td>
                      <td>
                        <div className="flex items-center justify-center border border-border w-fit mx-auto">
                          <button onClick={() => setQty(item.product.slug, item.qty - 1)} className="w-8 h-8 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                          <span className="w-8 text-center text-sm">{item.qty}</span>
                          <button onClick={() => setQty(item.product.slug, item.qty + 1)} className="w-8 h-8 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                        </div>
                      </td>
                      <td className="text-center">{price(item.product.price * item.qty)}</td>
                      <td className="text-right">
                        <button onClick={() => remove(item.product.slug)} aria-label="Remove">
                          <X className="w-4 h-4 text-muted-foreground hover:text-accent" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <aside className="bg-secondary p-8 h-fit">
              <h3 className="text-xl mb-6">Cart Totals</h3>
              <div className="flex justify-between py-3 border-b border-border text-sm"><span>Subtotal</span><span>{price(subtotal)}</span></div>
              <div className="flex justify-between py-3 border-b border-border text-sm"><span>Shipping</span><span>Calculated at checkout</span></div>
              <div className="flex justify-between py-4 text-lg"><span>Total</span><span>{price(subtotal)}</span></div>
              <Link to="/checkout" className="block text-center mt-4 bg-primary text-primary-foreground py-3.5 text-[11px] tracking-[0.3em] uppercase">Checkout</Link>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function CartPage() {
  // If backend is available use server-side cart, otherwise use local CartProvider
  if (apiAvailable()) {
    return <BackendCartPage />;
  }
  return <LocalCartPage />;
}
