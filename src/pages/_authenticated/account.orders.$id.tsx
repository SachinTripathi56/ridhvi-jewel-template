import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, formatPrice } from "@/lib/api";
import type { Order } from "@/lib/orders-types";

function shipAddr(order: Order) {
  return {
    fullName: order.shippingFullName ?? order.address?.fullName ?? "",
    phone: order.shippingPhone ?? order.address?.phone ?? "",
    line1: order.shippingAddressLine1 ?? order.address?.addressLine1 ?? order.address?.line1 ?? "",
    line2: order.shippingAddressLine2 ?? order.address?.addressLine2 ?? order.address?.line2,
    city: order.shippingCity ?? order.address?.city ?? "",
    state: order.shippingState ?? order.address?.state ?? "",
    pincode: order.shippingPincode ?? order.address?.pincode ?? "",
  };
}

function OrderDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const { data: order, isLoading } = useQuery({
    queryKey: ["account-order", id], queryFn: () => api.getOrder(id),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!order) return <p className="text-sm">Order not found. <Link to="/account/orders" className="hover:text-accent">← Back</Link></p>;

  const addr = shipAddr(order);
  const subtotal = order.subtotal ?? 0;
  const shipping = order.shippingCharge ?? order.shipping ?? 0;
  const tax = order.tax ?? 0;
  const total = order.totalAmount ?? order.total ?? (subtotal + shipping + tax);

  return (
    <div>
      <Link to="/account/orders" className="text-xs uppercase text-muted-foreground hover:text-accent">← All orders</Link>
      <div className="mt-4 flex items-end justify-between">
        <h2 className="text-2xl">{order.orderNumber ?? order.id}</h2>
        <span className="text-xs uppercase tracking-widest border border-border px-3 py-1">{order.status}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-border">
          {order.items.map((l) => (
            <li key={l.productId} className="flex items-center gap-5 py-4">
              {(l.productImage ?? l.image) && <img src={l.productImage ?? l.image} alt="" className="h-20 w-16 bg-secondary object-contain p-2" />}
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
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal, order.currency)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(shipping, order.currency)}</span></div>
            {tax > 0 && <div className="flex justify-between"><span>Tax</span><span>{formatPrice(tax, order.currency)}</span></div>}
            <div className="flex justify-between text-base border-t border-border pt-3 mt-3"><span>Total</span><span>{formatPrice(total, order.currency)}</span></div>
          </div>
          {addr.fullName && (
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-xs uppercase text-muted-foreground">Ship to</p>
              <p className="mt-1">{addr.fullName}</p>
              <p className="text-xs text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.pincode}</p>
              <p className="text-xs text-muted-foreground">{addr.phone}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default OrderDetail;
