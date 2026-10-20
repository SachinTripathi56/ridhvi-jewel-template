import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X, Loader2 } from "lucide-react";
import type { Collection } from "@/lib/types";

const EMPTY: Partial<Collection> = {
  name: "", description: "", offer: "", linkUrl: "/shop", active: true, displayOrder: 0,
};

function AdminCollections() {
  const qc = useQueryClient();
  const { data: collections = [], isLoading } = useQuery({
    queryKey: ["admin-collections"],
    queryFn: () => api.admin.listCollections(),
  });
  const [editing, setEditing] = useState<Partial<Collection> | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function openNew() { setEditing({ ...EMPTY }); setPendingFile(null); setPendingPreview(null); }
  function openEdit(c: Collection) { setEditing({ ...c }); setPendingFile(null); setPendingPreview(null); }

  function handleFile(f: File) {
    if (!f.type.startsWith("image/")) return;
    setPendingFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPendingPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete collection "${name}"?`)) return;
    try {
      await api.admin.deleteCollection(id);
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-collections"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  async function save(c: Partial<Collection>) {
    if (!c.name?.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      let saved: Collection;
      if (c.id) {
        saved = await api.admin.updateCollection(c.id, c);
      } else {
        saved = await api.admin.createCollection(c);
      }

      // Upload image if pending
      if (pendingFile) {
        setUploadingImage(true);
        try {
          await api.admin.uploadCollectionImage(saved.id, pendingFile);
          toast.success("Image uploaded");
        } catch (e: any) {
          toast.error(`Image upload failed: ${e.message}`);
        } finally {
          setUploadingImage(false);
        }
      }

      toast.success(c.id ? "Collection updated" : "Collection created");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-collections"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
    finally { setSaving(false); }
  }

  const inp = "w-full border-b border-border bg-transparent py-2 text-sm focus:outline-none focus:border-foreground";
  const label = "block text-[11px] tracking-widest uppercase text-muted-foreground mb-1";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Collections</h1>
          <p className="mt-1 text-sm text-muted-foreground">{collections.length} total · Shown on home page promo section</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-[11px] tracking-widest uppercase">
          <Plus className="h-4 w-4" /> New collection
        </button>
      </div>

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="mt-8 grid gap-4">
          {collections.map((c) => (
            <div key={c.id} className="flex gap-4 border border-border overflow-hidden">
              <div className="w-36 h-24 flex-shrink-0 bg-secondary overflow-hidden">
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                )}
              </div>
              <div className="flex-1 py-3 pr-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    {c.offer && <p className="text-xs text-accent mt-0.5 tracking-widest uppercase">{c.offer}</p>}
                    {c.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{c.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`text-[10px] uppercase px-2 py-0.5 border ${c.active ? "border-emerald-600 text-emerald-600" : "border-border text-muted-foreground"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                    <button onClick={() => openEdit(c)} className="border border-border p-2 hover:bg-secondary"><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => remove(c.id, c.name)} className="border border-border p-2 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {collections.length === 0 && (
            <div className="border border-dashed border-border py-16 text-center text-muted-foreground">
              No collections yet. Click "New collection" to add one.
            </div>
          )}
        </div>
      )}

      {/* Edit/Create Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-lg bg-background p-8 space-y-5 my-auto">
            <h3 className="text-xl">{editing.id ? "Edit collection" : "New collection"}</h3>

            {/* Image Upload */}
            <div>
              <label className={label}>Collection Image</label>
              {(pendingPreview || editing.imageUrl) && (
                <div className="relative h-40 mb-3 bg-secondary overflow-hidden">
                  <img src={pendingPreview ?? editing.imageUrl ?? ""} alt="" className="w-full h-full object-cover" />
                  {pendingPreview && (
                    <button
                      type="button"
                      onClick={() => { setPendingFile(null); setPendingPreview(null); }}
                      className="absolute top-2 right-2 bg-black/50 text-white h-6 w-6 rounded-full flex items-center justify-center"
                    ><X className="h-3 w-3" /></button>
                  )}
                </div>
              )}
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                className="border border-dashed border-border rounded p-4 text-center cursor-pointer hover:border-foreground/50 transition"
              >
                <Upload className="mx-auto h-5 w-5 text-muted-foreground mb-1" strokeWidth={1.2} />
                <p className="text-xs text-muted-foreground">Click or drag to upload image</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            </div>

            <div>
              <label className={label}>Name *</label>
              <input required value={editing.name ?? ""} onChange={(e) => {
                const name = e.target.value;
                setEditing((s) => ({ ...s!, name }));
              }} className={inp} />
            </div>
            <div>
              <label className={label}>Description</label>
              <input value={editing.description ?? ""} onChange={(e) => setEditing((s) => ({ ...s!, description: e.target.value }))} className={inp} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Offer Text (e.g. "15% Off")</label>
                <input value={editing.offer ?? ""} onChange={(e) => setEditing((s) => ({ ...s!, offer: e.target.value }))} className={inp} placeholder="15% Off" />
              </div>
              <div>
                <label className={label}>Link URL</label>
                <input value={editing.linkUrl ?? ""} onChange={(e) => setEditing((s) => ({ ...s!, linkUrl: e.target.value }))} className={inp} placeholder="/shop" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Display Order</label>
                <input type="number" min={0} value={editing.displayOrder ?? 0}
                  onChange={(e) => setEditing((s) => ({ ...s!, displayOrder: Number(e.target.value) }))} className={inp} />
              </div>
              <div>
                <label className={label}>Status</label>
                <select value={editing.active ? "yes" : "no"}
                  onChange={(e) => setEditing((s) => ({ ...s!, active: e.target.value === "yes" }))}
                  className={inp + " cursor-pointer"}>
                  <option value="yes">Active</option>
                  <option value="no">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => save(editing)}
                disabled={saving || uploadingImage}
                className="bg-primary text-primary-foreground flex-1 py-3 text-[11px] tracking-[0.3em] uppercase disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {(saving || uploadingImage) ? <><Loader2 className="h-4 w-4 animate-spin" />{uploadingImage ? "Uploading…" : "Saving…"}</> : (editing.id ? "Save Changes" : "Create")}
              </button>
              <button type="button" onClick={() => setEditing(null)} className="border border-border px-6 text-xs uppercase tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCollections;
