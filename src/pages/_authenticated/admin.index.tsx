import { useQuery } from "@tanstack/react-query";
import { api, formatPrice } from "@/lib/api";
import { ShoppingBag, Users, Package, DollarSign, Clock, AlertTriangle, Star, MessageSquare } from "lucide-react";

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: any; sub?: string }) {
  return (
    <div className="border border-border p-5 flex items-start gap-4">
      <div className="mt-1 text-muted-foreground"><Icon className="h-5 w-5" /></div>
      <div>
        <p className="text-[11px] tracking-widest uppercase text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api.admin.dashboard(),
  });

  const stats = [
    { label: "Total Revenue", value: data?.totalRevenue != null ? formatPrice(Number(data.totalRevenue)) : "—", icon: DollarSign, sub: data?.revenueThisMonth != null ? `${formatPrice(Number(data.revenueThisMonth))} this month` : undefined },
    { label: "Total Orders", value: data?.totalOrders ?? "—", icon: ShoppingBag, sub: data?.pendingOrders != null ? `${data.pendingOrders} pending` : undefined },
    { label: "Customers", value: data?.totalUsers ?? "—", icon: Users, sub: data?.newUsersThisMonth != null ? `${data.newUsersThisMonth} new this month` : undefined },
    { label: "Products", value: data?.activeProducts ?? data?.totalProducts ?? "—", icon: Package, sub: data?.lowStockProducts != null ? `${data.lowStockProducts} low stock` : undefined },
    { label: "Pending Reviews", value: data?.pendingReviews ?? "—", icon: Star },
    { label: "Unread Messages", value: data?.unreadMessages ?? "—", icon: MessageSquare },
    { label: "Processing Orders", value: data?.processingOrders ?? "—", icon: Clock },
    { label: "Out of Stock", value: data?.outOfStockProducts ?? "—", icon: AlertTriangle },
  ];

  return (
    <div>
      <h1 className="text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Overview of your Parvior store</p>

      {isLoading ? (
        <div className="mt-12 text-sm text-muted-foreground">Loading…</div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <StatCard key={s.label} label={s.label} value={String(s.value)} icon={s.icon} sub={s.sub} />
            ))}
          </div>

          {data?.topSellingProducts?.length > 0 && (
            <div className="mt-10 border border-border p-5">
              <h2 className="text-lg">Top Selling Products</h2>
              <ul className="mt-4 divide-y divide-border">
                {data.topSellingProducts.map((p: any) => (
                  <li key={p.id} className="flex items-center gap-4 py-3">
                    {p.primaryImageUrl && <img src={p.primaryImageUrl} alt="" className="h-10 w-10 object-contain bg-secondary" />}
                    <div className="flex-1">
                      <p className="text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.categoryName}</p>
                    </div>
                    <p className="text-sm">{formatPrice(p.price)}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
