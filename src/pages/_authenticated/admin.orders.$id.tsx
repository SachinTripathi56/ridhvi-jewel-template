import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, formatPrice } from "@/lib/api";
import type { OrderStatus } from "@/lib/orders-types";
import { toast } from "sonner";

const statuses: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export default function AdminOrderDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { data: order, isLoading } = useQuery({ queryKey: ["admin-order", id], queryFn: () => api.getOrder(id) });

  async function changeStatus(s: OrderStatus) {
    try { await api.admin.updateOrderStatus(id, s); toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-order", id] }); qc.invalidateQueries({ queryKey: ["admin-orders"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  if (isLoading) return <p className="mt-8 text-sm text-muted-foreground">Loading…</p>;
  if (!order) return <p className="mt-8 text-sm">Order not found. <Link to="/admin/orders" className="hover:text-accent">← Back</Link></p>;

  return (
    <div>
      <Link to="/admin/orders" className="text-xs uppercase text-muted-foreground hover:text-accent">← All orders</Link>
      <div className="mt-4 flex items-end justify-between">
        <h1 className="text-3xl">{order.orderNumber ?? order.id}</h1>
        <select value={order.status} onChange={(e) => changeStatus(e.target.value as OrderStatus)}
          className="border border-border bg-background px-3 py-2 text-xs uppercase">
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-border">
          {order.items.map((l) => (
            <li key={l.productId} className="flex items-center gap-5 py-4">
              <div className="flex-1">
                <p>{l.productName ?? l.name}</p>
                <p className="text-xs text-muted-foreground">Qty {l.quantity}</p>
              </div>
              <p>{formatPrice(l.unitPrice * l.quantity, order.currency)}</p>
            </li>
          ))}
        </ul>
        <aside className="bg-secondary p-6 text-sm h-fit">
          <h3 className="text-lg mb-4">Summary</h3>
          <div className="space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal ?? 0, order.currency)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shippingCharge ?? 0, order.currency)}</span></div>
            <div className="flex justify-between text-base border-t border-border pt-3 mt-3"><span>Total</span><span>{formatPrice(order.totalAmount ?? 0, order.currency)}</span></div>
          </div>
          {order.shippingFullName && (
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-xs uppercase text-muted-foreground">Ship to</p>
              <p className="mt-1">{order.shippingFullName}</p>
              <p className="text-xs text-muted-foreground">{order.shippingAddressLine1}, {order.shippingCity}, {order.shippingState} {order.shippingPincode}</p>
              <p className="text-xs text-muted-foreground">{order.shippingPhone}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
