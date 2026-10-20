import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { cart } from "@/lib/cart-store";
import { formatPrice, api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { Address } from "@/lib/orders-types";
import type { BackendCart } from "@/lib/types";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { MapPin, CreditCard, ShieldCheck, Package } from "lucide-react";
import { price } from "@/lib/format";

const SHIPPING_THRESHOLD = 499;
const SHIPPING_CHARGE = 49;
const GST_RATE = 0.05;

const empty: Address = {
  fullName: "", phone: "", line1: "", city: "",
  state: "", pincode: "", country: "India",
};

export default function CheckoutPage() {
  const navigate = useNavigate();

  const [cartData, setCartData] = useState<BackendCart | null>(null);
  const [cartLoading, setCartLoading] = useState(true);

  const loadCart = useCallback(async () => {
    setCartLoading(true);
    const c = await cart.fetch();
    setCartData(c);
    setCartLoading(false);
  }, []);

  useEffect(() => { loadCart(); }, [loadCart]);

  const { data: savedAddresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => api.listAddresses(),
  });

  const [addr, setAddr] = useState<Address>(empty);
  const [pay, setPay] = useState<"PHONEPE" | "COD">("PHONEPE");
  const [coupon, setCoupon] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (savedAddresses.length > 0 && !addr.fullName) {
      setAddr(savedAddresses[0]);
    }
  }, [savedAddresses]);

  const items = cartData?.items ?? [];
  const subtotal = Number(cartData?.subtotal ?? 0);
  const shipping = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_CHARGE;
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + shipping + gst;

  if (!cartLoading && items.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <section className="bg-secondary py-14 text-center"><h1 className="text-5xl">Checkout</h1></section>
        <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" strokeWidth={1} />
          <p className="mt-6 text-muted-foreground">Your cart is empty.</p>
          <Link to="/shop" className="inline-block mt-6 bg-primary text-primary-foreground px-10 py-3.5 text-[11px] tracking-[0.3em] uppercase">Continue Shopping</Link>
        </div>
        <Footer />
      </div>
    );
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) { toast.error("Your cart is empty"); return; }
    setPlacing(true);
    try {
      let addressId = addr.id;
      if (!addressId) {
        const savedAddr = await api.saveAddress({
          ...addr,
          addressLine1: addr.line1 ?? addr.addressLine1 ?? "",
          addressLine2: addr.line2 ?? addr.addressLine2,
          label: addr.label ?? "Home",
        });
        addressId = savedAddr.id;
      }

      const orderRes = await api.createOrder({
        addressId: addressId!,
        couponCode: coupon || undefined,
        paymentProvider: pay,
      });

      const orderId = orderRes.orderId;

      if (pay === "PHONEPE" && orderId) {
        try {
          const payment = await api.initiatePayment(orderId);
          const url = payment?.redirectUrl ?? payment?.paymentUrl;
          if (url) {
            await cart.clear();
            window.location.href = url;
            return;
          }
        } catch (err: any) {
          toast.error("Payment gateway unavailable. Please try Cash on Delivery.");
          setPlacing(false);
          return;
        }
      }

      await cart.clear();
      toast.success("Order placed successfully!");
      navigate(`/order-success/${orderId}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Could not place order");
    } finally {
      setPlacing(false);
    }
  }

  const input = "w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-accent";

  return (
    <div className="min-h-screen">
      <Header />
      <section className="bg-secondary py-14 text-center"><h1 className="text-5xl">Checkout</h1></section>

      <form onSubmit={placeOrder} className="max-w-[1300px] mx-auto px-6 py-16 grid md:grid-cols-[1fr_380px] gap-12">
        <div>
          <h2 className="text-2xl mb-6 flex items-center gap-2"><MapPin className="h-5 w-5" /> Billing Details</h2>

          {savedAddresses.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground self-center mr-1">Saved:</span>
              {savedAddresses.map((s: Address) => (
                <button key={s.id} type="button" onClick={() => setAddr(s)}
                  className={`border px-3 py-1.5 text-xs tracking-wide transition-colors ${addr.id === s.id ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/60"}`}>
                  {s.label || s.fullName} — {s.city}
                </button>
              ))}
              <button type="button" onClick={() => setAddr({ ...empty })}
                className="border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-foreground/60 transition-colors">
                + New address
              </button>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs tracking-widest uppercase">First name *</label><input required value={addr.fullName?.split(" ")[0] ?? ""} onChange={(e) => setAddr((a) => ({ ...a, fullName: e.target.value + " " + (a.fullName?.split(" ").slice(1).join(" ") ?? ""), id: undefined }))} className={input + " mt-2"} /></div>
            <div><label className="text-xs tracking-widest uppercase">Last name *</label><input required value={addr.fullName?.split(" ").slice(1).join(" ") ?? ""} onChange={(e) => setAddr((a) => ({ ...a, fullName: (a.fullName?.split(" ")[0] ?? "") + " " + e.target.value, id: undefined }))} className={input + " mt-2"} /></div>
          </div>
          <div className="mt-4"><label className="text-xs tracking-widest uppercase">Street address *</label>
            <input required placeholder="House number and street name" value={addr.line1 ?? addr.addressLine1 ?? ""} onChange={(e) => setAddr((a) => ({ ...a, line1: e.target.value, id: undefined }))} className={input + " mt-2"} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div><label className="text-xs tracking-widest uppercase">City *</label><input required value={addr.city} onChange={(e) => setAddr((a) => ({ ...a, city: e.target.value, id: undefined }))} className={input + " mt-2"} /></div>
            <div><label className="text-xs tracking-widest uppercase">State *</label><input required value={addr.state} onChange={(e) => setAddr((a) => ({ ...a, state: e.target.value, id: undefined }))} className={input + " mt-2"} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div><label className="text-xs tracking-widest uppercase">Pincode *</label><input required value={addr.pincode} onChange={(e) => setAddr((a) => ({ ...a, pincode: e.target.value, id: undefined }))} className={input + " mt-2"} /></div>
            <div><label className="text-xs tracking-widest uppercase">Phone *</label><input required type="tel" value={addr.phone} onChange={(e) => setAddr((a) => ({ ...a, phone: e.target.value, id: undefined }))} className={input + " mt-2"} /></div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5" /> Payment Method</h2>
            <div className="space-y-3">
              <label className={`flex cursor-pointer items-start gap-4 border p-4 transition-colors ${pay === "PHONEPE" ? "border-foreground bg-secondary" : "border-border"}`}>
                <input type="radio" name="pay" checked={pay === "PHONEPE"} onChange={() => setPay("PHONEPE")} className="mt-0.5" />
                <div><p className="font-semibold">PhonePe</p><p className="text-xs text-muted-foreground mt-0.5">UPI · Debit/Credit cards · Net banking · Wallets</p></div>
              </label>
              <label className={`flex cursor-pointer items-start gap-4 border p-4 transition-colors ${pay === "COD" ? "border-foreground bg-secondary" : "border-border"}`}>
                <input type="radio" name="pay" checked={pay === "COD"} onChange={() => setPay("COD")} className="mt-0.5" />
                <div><p className="font-semibold">Cash on Delivery</p><p className="text-xs text-muted-foreground mt-0.5">Pay ₹{total.toLocaleString("en-IN")} in cash when your order arrives</p></div>
              </label>
            </div>

            <div className="mt-6">
              <label className="text-xs tracking-widest uppercase">Coupon code (optional)</label>
              <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="SAVE10" className={input + " mt-2"} />
            </div>
          </div>

          <label className="flex items-start gap-2 mt-6 text-xs"><input type="checkbox" required className="mt-1" />I have read and agree to the website terms and conditions *</label>
          <button type="submit" disabled={placing || cartLoading} className="w-full mt-5 bg-primary text-primary-foreground py-4 text-[11px] tracking-[0.3em] uppercase flex items-center justify-center gap-2 disabled:opacity-60">
            {placing ? "Processing…" : pay === "PHONEPE" ? <><ShieldCheck className="h-4 w-4" /> Pay ₹{total.toLocaleString("en-IN")} with PhonePe</> : <>Place Order — ₹{total.toLocaleString("en-IN")}</>}
          </button>
        </div>

        <aside className="bg-secondary p-8 h-fit">
          <h3 className="text-xl mb-5">Your Order</h3>
          {cartLoading ? (
            <p className="text-muted-foreground animate-pulse">Loading cart…</p>
          ) : (
            items.map((it) => (
              <div key={it.id} className="flex justify-between py-2 text-sm">
                <span>{it.productName} × {it.quantity}</span><span>{price(it.totalPrice)}</span>
              </div>
            ))
          )}
          <div className="flex justify-between py-3 border-t border-border mt-3 text-sm"><span>Subtotal</span><span>{price(subtotal)}</span></div>
          <div className="flex justify-between py-3 border-t border-border text-sm">
            <span>Shipping</span>
            <span className={shipping === 0 ? "text-green-600" : ""}>{shipping === 0 ? "FREE" : price(shipping)}</span>
          </div>
          <div className="flex justify-between py-3 border-t border-border text-sm text-muted-foreground"><span>GST (5%)</span><span>{price(gst)}</span></div>
          <div className="flex justify-between py-4 text-lg border-t border-border"><span>Total</span><span>{price(total)}</span></div>
        </aside>
      </form>

      <Footer />
    </div>
  );
}
