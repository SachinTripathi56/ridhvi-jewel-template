import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Address } from "@/lib/orders-types";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

const empty: Address = { fullName: "", phone: "", line1: "", city: "", state: "", pincode: "", country: "India" };

function AddressesPage() {
  const qc = useQueryClient();
  const { data: list = [] } = useQuery({ queryKey: ["addresses"], queryFn: () => api.listAddresses() });
  const [editing, setEditing] = useState<Address | null>(null);

  async function save(a: Address) {
    try { await api.saveAddress(a); toast.success("Address saved"); setEditing(null); qc.invalidateQueries({ queryKey: ["addresses"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this address?")) return;
    try { await api.deleteAddress(id); toast.success("Removed"); qc.invalidateQueries({ queryKey: ["addresses"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Saved addresses</h2>
        <button onClick={() => setEditing({ ...empty })} className="flex items-center gap-2 text-xs uppercase tracking-widest">
          <Plus className="h-4 w-4" /> Add new
        </button>
      </div>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2">
        {list.map((a) => (
          <li key={a.id} className="border border-border p-5">
            <div className="flex justify-between">
              <p className="font-semibold">{a.fullName}</p>
              <button onClick={() => remove(a.id!)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
            <p className="text-sm text-muted-foreground">{a.city}, {a.state} {a.pincode}</p>
            <p className="text-sm text-muted-foreground">{a.phone}</p>
            <button onClick={() => setEditing(a)} className="mt-3 text-xs uppercase hover:text-accent">Edit</button>
          </li>
        ))}
        {list.length === 0 && <li className="text-sm text-muted-foreground">No saved addresses.</li>}
      </ul>

      {editing && <AddressForm initial={editing} onCancel={() => setEditing(null)} onSubmit={save} />}
    </div>
  );
}

function AddressForm({ initial, onSubmit, onCancel }: { initial: Address; onSubmit: (a: Address) => void; onCancel: () => void }) {
  const [a, setA] = useState<Address>(initial);
  const input = "mt-2 w-full border-b border-border bg-transparent py-2 text-sm focus:outline-none focus:border-accent";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(a); }} className="w-full max-w-lg bg-background p-8 space-y-4">
        <h3 className="text-xl">{a.id ? "Edit address" : "New address"}</h3>
        {([
          ["fullName", "Full name"], ["phone", "Phone"], ["line1", "Address line 1"], ["line2", "Address line 2 (optional)"],
          ["city", "City"], ["state", "State"], ["pincode", "Pincode"], ["country", "Country"],
        ] as const).map(([k, label]) => (
          <div key={k}>
            <label className="text-[11px] tracking-widest uppercase text-muted-foreground">{label}</label>
            <input value={(a as any)[k] ?? ""} required={k !== "line2" && k !== "country"}
              onChange={(e) => setA((s) => ({ ...s, [k]: e.target.value }))}
              className={input} />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-primary text-primary-foreground flex-1 py-3 text-[11px] tracking-[0.3em] uppercase">Save</button>
          <button type="button" onClick={onCancel} className="border border-border px-6 text-xs uppercase tracking-widest">Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default AddressesPage;
