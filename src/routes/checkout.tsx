import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { price } from "@/lib/format";
import { useState } from "react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Ridhvi" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [shipping, setShipping] = useState<"flat" | "free">("flat");
  const [pay, setPay] = useState<"bank" | "cod">("bank");
  const ship = shipping === "flat" ? 250 : 0;
  const total = subtotal + ship;

  const onPlace = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Order placed (demo). Plug into your existing backend.");
    clear();
  };

  const input = "w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-accent";

  return (
    <div className="min-h-screen">
      <Header />
      <section className="bg-secondary py-14 text-center"><h1 className="text-5xl">Checkout</h1></section>

      <form onSubmit={onPlace} className="max-w-[1300px] mx-auto px-6 py-16 grid md:grid-cols-[1fr_380px] gap-12">
        <div>
          <h2 className="text-2xl mb-6">Billing Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs tracking-widest uppercase">First name *</label><input required className={input + " mt-2"} /></div>
            <div><label className="text-xs tracking-widest uppercase">Last name *</label><input required className={input + " mt-2"} /></div>
          </div>
          <div className="mt-4"><label className="text-xs tracking-widest uppercase">Company (optional)</label><input className={input + " mt-2"} /></div>
          <div className="mt-4"><label className="text-xs tracking-widest uppercase">Country / Region *</label>
            <select required className={input + " mt-2"}><option>India</option><option>United States</option><option>United Kingdom</option><option>Australia</option></select>
          </div>
          <div className="mt-4"><label className="text-xs tracking-widest uppercase">Street address *</label>
            <input required placeholder="House number and street name" className={input + " mt-2"} />
            <input placeholder="Apartment, suite, unit (optional)" className={input + " mt-3"} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div><label className="text-xs tracking-widest uppercase">City *</label><input required className={input + " mt-2"} /></div>
            <div><label className="text-xs tracking-widest uppercase">Postcode *</label><input required className={input + " mt-2"} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div><label className="text-xs tracking-widest uppercase">Phone *</label><input required type="tel" className={input + " mt-2"} /></div>
            <div><label className="text-xs tracking-widest uppercase">Email *</label><input required type="email" className={input + " mt-2"} /></div>
          </div>
          <label className="flex items-center gap-2 mt-6 text-sm"><input type="checkbox" /> Ship to a different address?</label>
          <div className="mt-4"><label className="text-xs tracking-widest uppercase">Order notes (optional)</label><textarea rows={4} className={input + " mt-2"} /></div>
        </div>

        <aside className="bg-secondary p-8 h-fit">
          <h3 className="text-xl mb-5">Your Order</h3>
          {items.map((it) => (
            <div key={it.product.slug} className="flex justify-between py-2 text-sm">
              <span>{it.product.name} × {it.qty}</span><span>${it.product.price * it.qty}</span>
            </div>
          ))}
          <div className="flex justify-between py-3 border-t border-border mt-3 text-sm"><span>Subtotal</span><span>${subtotal}</span></div>

          <div className="py-3 border-t border-border">
            <p className="text-xs tracking-widest uppercase mb-3">Shipment</p>
            <label className="flex items-center justify-between text-sm py-1.5"><span className="flex items-center gap-2"><input type="radio" checked={shipping === "flat"} onChange={() => setShipping("flat")} />Flat rate</span><span>$30</span></label>
            <label className="flex items-center justify-between text-sm py-1.5"><span className="flex items-center gap-2"><input type="radio" checked={shipping === "free"} onChange={() => setShipping("free")} />Free shipping</span><span>$0</span></label>
          </div>
          <div className="flex justify-between py-4 text-lg border-t border-border"><span>Total</span><span>${total}</span></div>

          <p className="text-xs tracking-widest uppercase mt-4 mb-3">Payment Method</p>
          <label className="block text-sm py-2"><input type="radio" checked={pay === "bank"} onChange={() => setPay("bank")} className="mr-2" />Direct bank transfer</label>
          {pay === "bank" && <p className="text-xs text-muted-foreground leading-relaxed pl-5">Make your payment directly into our bank account. Use your Order ID as reference.</p>}
          <label className="block text-sm py-2"><input type="radio" checked={pay === "cod"} onChange={() => setPay("cod")} className="mr-2" />Cash on delivery</label>

          <label className="flex items-start gap-2 mt-4 text-xs"><input type="checkbox" required className="mt-1" />I have read and agree to the website terms and conditions *</label>
          <button type="submit" className="w-full mt-5 bg-primary text-primary-foreground py-4 text-[11px] tracking-[0.3em] uppercase">Place Order</button>
          {items.length === 0 && <Link to="/shop" className="block text-center mt-4 text-xs text-accent">Your cart is empty — Continue shopping</Link>}
        </aside>
      </form>

      <Footer />
    </div>
  );
}
