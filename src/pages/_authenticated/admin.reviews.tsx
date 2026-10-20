import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";

function AdminReviews() {
  const qc = useQueryClient();
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: () => api.admin.listReviews(),
  });

  async function approve(id: string, approved: boolean) {
    try {
      await api.admin.approveReview(id, approved);
      toast.success(approved ? "Review approved" : "Review hidden");
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    try {
      await api.admin.deleteReview(id);
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <div>
      <h1 className="text-3xl">Reviews</h1>
      <p className="mt-1 text-sm text-muted-foreground">{reviews.length} total</p>

      {isLoading ? <p className="mt-8 text-sm text-muted-foreground">Loading…</p> : (
        <ul className="mt-8 divide-y divide-border">
          {reviews.map((r: any) => (
            <li key={r.id} className="py-5 flex gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm">{r.userName}</span>
                  <span className="text-xs text-muted-foreground">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border ${r.approved || r.visible ? "border-emerald-600 text-emerald-600" : "border-orange-500 text-orange-500"}`}>
                    {r.approved || r.visible ? "Approved" : "Pending"}
                  </span>
                </div>
                {r.title && <p className="mt-1 text-sm font-medium">{r.title}</p>}
                <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 items-start">
                {r.approved || r.visible ? (
                  <button onClick={() => approve(r.id, false)} title="Hide" className="border border-border p-2 hover:bg-secondary">
                    <XCircle className="h-3 w-3 text-orange-500" />
                  </button>
                ) : (
                  <button onClick={() => approve(r.id, true)} title="Approve" className="border border-border p-2 hover:bg-secondary">
                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                  </button>
                )}
                <button onClick={() => remove(r.id)} title="Delete" className="border border-border p-2 hover:text-red-500">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </li>
          ))}
          {reviews.length === 0 && <li className="py-10 text-center text-muted-foreground">No reviews yet.</li>}
        </ul>
      )}
    </div>
  );
}

export default AdminReviews;
