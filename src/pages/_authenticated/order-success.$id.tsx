import { useParams, Link } from "react-router-dom";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, formatPrice } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function OrderSuccessPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { data: order } = useQuery({
    queryKey: ["order-success", id],
    queryFn: () => api.getOrder(id),
    enabled: Boolean(id),
  });

  return (
    <div className="min-h-screen">
      <Header />
      <section className="max-w-[700px] mx-auto px-6 py-24 text-center">
        <CheckCircle className="mx-auto h-20 w-20 text-green-500" strokeWidth={1} />
        <h1 className="mt-8 text-4xl">Order Confirmed!</h1>
        <p className="mt-3 text-muted-foreground">
          Thank you for your order. We'll send you a confirmation email shortly.
        </p>

        {order && (
          <div className="mt-10 bg-secondary p-8 text-left space-y-3 text-sm">
            <p><span className="text-muted-foreground">Order:</span> <span className="font-semibold">{order.orderNumber ?? order.id}</span></p>
            <p><span className="text-muted-foreground">Status:</span> <span>{order.status}</span></p>
            {(order.totalAmount ?? order.total) && (
              <p><span className="text-muted-foreground">Total:</span> <span>{formatPrice(order.totalAmount ?? order.total ?? 0)}</span></p>
            )}
          </div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/account/orders" className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 text-[11px] tracking-[0.3em] uppercase">
            <Package className="h-4 w-4" /> Track Order
          </Link>
          <Link to="/shop" className="flex items-center justify-center gap-2 border border-border px-8 py-3.5 text-[11px] tracking-[0.3em] uppercase hover:bg-secondary transition">
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
