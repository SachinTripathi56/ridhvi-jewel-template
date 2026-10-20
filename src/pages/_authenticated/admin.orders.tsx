import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, formatPrice } from "@/lib/api";
import type { OrderStatus } from "@/lib/orders-types";
import { toast } from "sonner";

const statuses: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({ queryKey: ["admin-orders"], queryFn: () => api.admin.listOrders() });

  async function changeStatus(id: string, status: OrderStatus) {
    try { await api.admin.updateOrderStatus(id, status); toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-orders"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <div>
      <h1 className="text-3xl">Orders</h1>
      {isLoading ? <p className="mt-4 text-sm text-muted-foreground">Loading…</p> : (
        <table className="mt-8 w-full text-sm">
          <thead className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
            <tr><th className="py-3">Order</th><th>Date</th><th>Customer</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border">
                <td className="py-3"><Link to={`/admin/orders/${o.id}`} className="hover:text-accent">{o.orderNumber ?? o.id}</Link></td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>{o.shippingFullName ?? o.address?.fullName ?? "—"}</td>
                <td>{formatPrice(o.totalAmount ?? o.total ?? 0, o.currency)}</td>
                <td>
                  <select value={o.status} onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)}
                    className="border border-border bg-background px-2 py-1 text-xs uppercase">
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">No orders yet.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminOrders;
