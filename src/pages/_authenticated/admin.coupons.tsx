import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, formatPrice } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Coupon } from "@/lib/orders-types";

const EMPTY: Partial<Coupon> = {
  code: "", type: "PERCENT", discountValue: 0, minOrderValue: 0, active: true,
};

function AdminCoupons() {
  const qc = useQueryClient();
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: () => api.admin.listCoupons(),
  });
  const [editing, setEditing] = useState<Partial<Coupon> | null>(null);

  async function remove(id: string, code: string) {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try { await api.admin.deleteCoupon(id); toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-coupons"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  async function save(c: Partial<Coupon>) {
    try {
      await api.admin.upsertCoupon(c);
      toast.success(c.id ? "Coupon updated" : "Coupon created");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  const input = "w-full border-b border-border bg-transparent py-2 text-sm focus:outline-none focus:border-accent";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Coupons</h1>
          <p className="mt-1 text-sm text-muted-foreground">{coupons.length} total</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-[11px] tracking-widest uppercase">
          <Plus className="h-4 w-4" /> New coupon
        </button>
      </div>

      {isLoading ? <p className="mt-8 text-sm text-muted-foreground">Loading…</p> : (
        <table className="mt-8 w-full text-sm">
          <thead className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
            <tr><th className="py-3">Code</th><th>Type</th><th>Value</th><th>Min order</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-border">
                <td className="py-3 font-mono font-semibold">{c.code}</td>
                <td>{c.type}</td>
                <td>{c.type === "PERCENT" ? `${c.discountValue ?? c.value}%` : formatPrice(c.discountValue ?? c.value ?? 0)}</td>
                <td>{c.minOrderValue ? formatPrice(c.minOrderValue) : "—"}</td>
                <td>
                  <span className={`text-[10px] uppercase px-2 py-0.5 border ${c.active ? "border-emerald-600 text-emerald-600" : "border-border text-muted-foreground"}`}>
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditing(c)} className="border border-border p-2 hover:bg-secondary"><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => remove(c.id, c.code)} className="border border-border p-2 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">No coupons yet.</td></tr>}
          </tbody>
        </table>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
          <form onSubmit={(e) => { e.preventDefault(); save(editing); }} className="w-full max-w-md bg-background p-8 space-y-4">
            <h3 className="text-xl">{editing.id ? "Edit coupon" : "New coupon"}</h3>
            <div><label className="text-[11px] tracking-widest uppercase text-muted-foreground">Code *</label>
              <input required value={editing.code ?? ""} onChange={(e) => setEditing((s) => ({ ...s!, code: e.target.value.toUpperCase() }))} className={input + " mt-2"} /></div>
            <div><label className="text-[11px] tracking-widest uppercase text-muted-foreground">Type</label>
              <select value={editing.type ?? "PERCENT"} onChange={(e) => setEditing((s) => ({ ...s!, type: e.target.value as any }))} className={input + " mt-2 cursor-pointer"}>
                <option value="PERCENT">Percentage (%)</option>
                <option value="FLAT">Flat (₹)</option>
              </select></div>
            <div><label className="text-[11px] tracking-widest uppercase text-muted-foreground">Discount value</label>
              <input type="number" min={0} required value={editing.discountValue ?? ""} onChange={(e) => setEditing((s) => ({ ...s!, discountValue: Number(e.target.value) }))} className={input + " mt-2"} /></div>
            <div><label className="text-[11px] tracking-widest uppercase text-muted-foreground">Min order value (₹)</label>
              <input type="number" min={0} value={editing.minOrderValue ?? ""} onChange={(e) => setEditing((s) => ({ ...s!, minOrderValue: Number(e.target.value) }))} className={input + " mt-2"} /></div>
            <div><label className="text-[11px] tracking-widest uppercase text-muted-foreground">Status</label>
              <select value={editing.active ? "yes" : "no"} onChange={(e) => setEditing((s) => ({ ...s!, active: e.target.value === "yes" }))} className={input + " mt-2 cursor-pointer"}>
                <option value="yes">Active</option>
                <option value="no">Inactive</option>
              </select></div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-primary text-primary-foreground flex-1 py-3 text-[11px] tracking-[0.3em] uppercase">Save</button>
              <button type="button" onClick={() => setEditing(null)} className="border border-border px-6 text-xs uppercase tracking-widest">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminCoupons;
