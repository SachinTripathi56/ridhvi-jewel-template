import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, Upload, X, Loader2 } from "lucide-react";
import type { Category } from "@/lib/types";

const EMPTY: Partial<Category> = { name: "", slug: "", description: "", active: true };

function AdminCategories() {
  const qc = useQueryClient();
  const { data: cats = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.admin.listCategories(),
  });
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (!f.type.startsWith("image/")) return;
    setPendingFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPendingPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete category "${name}"?`)) return;
    try { await api.admin.deleteCategory(id); toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-categories"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  async function save(c: Partial<Category>) {
    setSaving(true);
    try {
      let saved: Category;
      if (c.id) saved = await api.admin.updateCategory(c.id, c);
      else saved = await api.admin.createCategory(c);

      // Upload image if user selected one
      if (pendingFile && saved.id) {
        setUploadingImage(true);
        try {
          await api.admin.uploadCategoryImage(saved.id, pendingFile);
          toast.success("Image uploaded to Cloudinary");
        } catch (e: any) {
          toast.error(`Image upload failed: ${e.message}`);
        } finally {
          setUploadingImage(false);
        }
      }

      toast.success(c.id ? "Category updated" : "Category created");
      setEditing(null);
      setPendingFile(null);
      setPendingPreview(null);
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
    finally { setSaving(false); }
  }

  const input = "w-full border-b border-border bg-transparent py-2 text-sm focus:outline-none focus:border-accent";
  const label = "block text-[11px] tracking-widest uppercase text-muted-foreground mb-1";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">{cats.length} total</p>
        </div>
        <button onClick={() => { setEditing({ ...EMPTY }); setPendingFile(null); setPendingPreview(null); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-[11px] tracking-widest uppercase">
          <Plus className="h-4 w-4" /> New category
        </button>
      </div>

      {isLoading ? <p className="mt-8 text-sm text-muted-foreground">Loading…</p> : (
        <table className="mt-8 w-full text-sm">
          <thead className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
            <tr><th className="py-3 w-16">Image</th><th>Name</th><th>Slug</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id} className="border-b border-border">
                <td className="py-3">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} className="h-12 w-12 object-cover rounded" />
                  ) : (
                    <div className="h-12 w-12 bg-secondary rounded flex items-center justify-center text-[8px] text-muted-foreground">No img</div>
                  )}
                </td>
                <td className="py-3">{c.name}</td>
                <td className="text-muted-foreground font-mono text-xs">{c.slug}</td>
                <td>
                  <span className={`text-[10px] uppercase px-2 py-0.5 border ${c.active ? "border-emerald-600 text-emerald-600" : "border-border text-muted-foreground"}`}>
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditing(c); setPendingFile(null); setPendingPreview(null); }} className="border border-border p-2 hover:bg-secondary"><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => remove(c.id, c.name)} className="border border-border p-2 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {cats.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">No categories yet.</td></tr>}
          </tbody>
        </table>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
          <form onSubmit={(e) => { e.preventDefault(); save(editing); }} className="w-full max-w-md bg-background p-8 space-y-4">
            <h3 className="text-xl">{editing.id ? "Edit category" : "New category"}</h3>

            {/* Image Upload */}
            <div>
              <label className={label}>Category Image</label>
              {(pendingPreview || editing.imageUrl) && (
                <div className="relative h-32 mb-2 bg-secondary overflow-hidden rounded">
                  <img src={pendingPreview ?? editing.imageUrl ?? ""} alt="" className="w-full h-full object-cover" />
                  {pendingPreview && (
                    <button type="button" onClick={() => { setPendingFile(null); setPendingPreview(null); }}
                      className="absolute top-2 right-2 bg-black/50 text-white h-6 w-6 rounded-full flex items-center justify-center">
                      <X className="h-3 w-3" />
                    </button>
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
                <p className="text-xs text-muted-foreground">Click or drag to upload image → Cloudinary</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            </div>

            <div>
              <label className={label}>Name *</label>
              <input required value={editing.name ?? ""} onChange={(e) => {
                const name = e.target.value;
                setEditing((s) => ({ ...s!, name, slug: s?.id ? s.slug : name.toLowerCase().replace(/\s+/g, "-") }));
              }} className={input + " mt-2"} />
            </div>
            <div>
              <label className={label}>Slug *</label>
              <input required value={editing.slug ?? ""} onChange={(e) => setEditing((s) => ({ ...s!, slug: e.target.value }))} className={input + " mt-2 font-mono"} />
            </div>
            <div>
              <label className={label}>Description</label>
              <input value={editing.description ?? ""} onChange={(e) => setEditing((s) => ({ ...s!, description: e.target.value }))} className={input + " mt-2"} />
            </div>
            <div>
              <label className={label}>Status</label>
              <select value={editing.active ? "yes" : "no"} onChange={(e) => setEditing((s) => ({ ...s!, active: e.target.value === "yes" }))} className={input + " mt-2 cursor-pointer"}>
                <option value="yes">Active</option>
                <option value="no">Inactive</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving || uploadingImage}
                className="bg-primary text-primary-foreground flex-1 py-3 text-[11px] tracking-[0.3em] uppercase disabled:opacity-60 flex items-center justify-center gap-2">
                {(saving || uploadingImage) ? <><Loader2 className="h-4 w-4 animate-spin" />{uploadingImage ? "Uploading image…" : "Saving…"}</> : "Save"}
              </button>
              <button type="button" onClick={() => setEditing(null)} className="border border-border px-6 text-xs uppercase tracking-widest">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminCategories;
