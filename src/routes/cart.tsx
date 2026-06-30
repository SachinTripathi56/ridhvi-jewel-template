import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { Minus, Plus, X } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Ridhvi" }, { name: "description", content: "Your cart." }] }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();

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
                  {items.map((it) => (
                    <tr key={it.product.slug} className="border-b border-border">
                      <td className="py-5">
                        <div className="flex items-center gap-4">
                          <img src={it.product.image} alt={it.product.name} className="w-16 h-16 object-cover bg-secondary" />
                          <Link to="/product/$slug" params={{ slug: it.product.slug }}>{it.product.name}</Link>
                        </div>
                      </td>
                      <td className="text-center">${it.product.price}</td>
                      <td>
                        <div className="flex items-center justify-center border border-border w-fit mx-auto">
                          <button onClick={() => setQty(it.product.slug, it.qty - 1)} className="w-8 h-8 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                          <span className="w-8 text-center text-sm">{it.qty}</span>
                          <button onClick={() => setQty(it.product.slug, it.qty + 1)} className="w-8 h-8 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                        </div>
                      </td>
                      <td className="text-center">${it.product.price * it.qty}</td>
                      <td className="text-right"><button onClick={() => remove(it.product.slug)} aria-label="Remove"><X className="w-4 h-4 text-muted-foreground hover:text-accent" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <aside className="bg-secondary p-8 h-fit">
              <h3 className="text-xl mb-6">Cart Totals</h3>
              <div className="flex justify-between py-3 border-b border-border text-sm"><span>Subtotal</span><span>${subtotal}</span></div>
              <div className="flex justify-between py-3 border-b border-border text-sm"><span>Shipping</span><span>$30</span></div>
              <div className="flex justify-between py-4 text-lg"><span>Total</span><span>${subtotal + 30}</span></div>
              <Link to="/checkout" className="block text-center mt-4 bg-primary text-primary-foreground py-3.5 text-[11px] tracking-[0.3em] uppercase">Checkout</Link>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
