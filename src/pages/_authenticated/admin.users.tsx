import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, Search } from "lucide-react";

const ALL_ROLES = ["USER", "STAFF", "ADMIN", "SUPER_ADMIN"] as const;

function AdminUsers() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.admin.listUsers(),
  });

  const filtered = q
    ? users.filter((u: any) =>
        u.name?.toLowerCase().includes(q.toLowerCase()) ||
        u.email?.toLowerCase().includes(q.toLowerCase())
      )
    : users;

  async function changeRole(id: string, role: "USER" | "ADMIN") {
    try { await api.admin.setUserRole(id, role); toast.success("Role updated"); qc.invalidateQueries({ queryKey: ["admin-users"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  async function toggleBlock(id: string, blocked: boolean) {
    try {
      if (blocked) { await api.admin.unblockUser(id); toast.success("User unblocked"); }
      else { await api.admin.blockUser(id); toast.success("User blocked"); }
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <div>
      <h1 className="text-3xl">Users</h1>
      <p className="mt-1 text-sm text-muted-foreground">{users.length} total</p>

      <div className="mt-6 flex items-center gap-2 border-b border-border pb-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…"
          className="flex-1 bg-transparent text-sm focus:outline-none" />
      </div>

      {isLoading ? <p className="mt-8 text-sm text-muted-foreground">Loading…</p> : (
        <table className="mt-6 w-full text-sm">
          <thead className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
            <tr><th className="py-3">Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((u: any) => (
              <tr key={u.id} className={`border-b border-border ${u.blocked ? "opacity-50" : ""}`}>
                <td className="py-3">{u.name ?? u.firstName ?? "—"}</td>
                <td className="text-muted-foreground">{u.email}</td>
                <td>
                  <select value={u.role ?? "USER"} onChange={(e) => changeRole(u.id, e.target.value as any)}
                    className="border border-border bg-background px-2 py-1 text-xs uppercase">
                    {ALL_ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                  </select>
                </td>
                <td>
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border ${u.blocked ? "border-red-500 text-red-500" : "border-emerald-600 text-emerald-600"}`}>
                    {u.blocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td>
                  <button onClick={() => toggleBlock(u.id, u.blocked)} title={u.blocked ? "Unblock" : "Block"}
                    className="border border-border p-2 hover:bg-secondary">
                    {u.blocked ? <ShieldCheck className="h-3 w-3 text-emerald-600" /> : <ShieldOff className="h-3 w-3 text-red-500" />}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">No users found.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminUsers;
