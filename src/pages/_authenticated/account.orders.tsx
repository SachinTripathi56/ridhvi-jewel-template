import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, formatPrice } from "@/lib/api";

function OrdersPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["account-orders"], queryFn: () => api.listOrders(),
  });

  return (
    <div>
      <h2 className="text-2xl mb-6">Order history</h2>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">No orders yet.</p>
          <Link to="/shop" className="inline-block mt-6 bg-primary text-primary-foreground px-8 py-3 text-[11px] tracking-[0.3em] uppercase">Start shopping</Link>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between py-5">
              <div>
                <Link to={`/account/orders/${o.id}`} className="text-lg hover:text-accent transition">{o.orderNumber ?? o.id}</Link>
                <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()} · {o.items.length} items · {o.status}</p>
              </div>
              <p className="text-lg">{formatPrice(o.totalAmount ?? o.total ?? 0)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default OrdersPage;
