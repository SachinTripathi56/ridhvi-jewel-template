import { useState } from "react";
import { useBanners, defaultBanners } from "@/lib/banners";
import type { Banner } from "@/lib/banners";
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, Image, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const EMPTY_BANNER: Banner = {
  id: "",
  image: "",
  title: "",
  subtitle: "",
  eyebrow: "",
  cta: "Shop Now",
  href: "/shop",
  showText: true,
};

function genId() {
  return "b" + Date.now().toString(36);
}

function AdminBanners() {
  const { banners, intervalSec, save, saveInterval } = useBanners();
  const [editing, setEditing] = useState<Banner | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Open editor for new banner
  function openNew() {
    setIsNew(true);
    setEditing({ ...EMPTY_BANNER, id: genId() });
  }

  // Open editor to edit existing
  function openEdit(b: Banner) {
    setIsNew(false);
    setEditing({ ...b });
  }

  // Toggle showText (enable/disable the text overlay on banner)
  function toggleText(id: string) {
    const updated = banners.map((b) =>
      b.id === id ? { ...b, showText: !(b.showText ?? true) } : b
    );
    save(updated);
    toast.success("Banner overlay " + (updated.find((b) => b.id === id)?.showText ? "enabled" : "hidden"));
  }

  // Move banner up or down
  function move(id: string, dir: "up" | "down") {
    const idx = banners.findIndex((b) => b.id === id);
    if ((dir === "up" && idx === 0) || (dir === "down" && idx === banners.length - 1)) return;
    const arr = [...banners];
    const to = dir === "up" ? idx - 1 : idx + 1;
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    save(arr);
  }

  // Delete banner
  function remove(id: string) {
    if (!confirm("Delete this banner?")) return;
    const updated = banners.filter((b) => b.id !== id);
    save(updated.length > 0 ? updated : defaultBanners);
    toast.success("Banner deleted");
  }

  // Save banner from editor
  function saveBanner(b: Banner) {
    if (!b.image.trim()) { toast.error("Image URL is required"); return; }
    let updated: Banner[];
    if (isNew) {
      updated = [...banners, b];
    } else {
      updated = banners.map((x) => (x.id === b.id ? b : x));
    }
    save(updated);
    setEditing(null);
    toast.success(isNew ? "Banner added" : "Banner updated");
  }

  const inp = "w-full border-b border-border bg-transparent py-2 text-sm focus:outline-none focus:border-foreground";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Banners</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {banners.length} banner{banners.length !== 1 ? "s" : ""} · Slide interval: {intervalSec}s
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Interval setting */}
          <div className="flex items-center gap-2 border border-border px-3 py-2">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Interval</span>
            <select
              value={intervalSec}
              onChange={(e) => saveInterval(Number(e.target.value))}
              className="bg-transparent text-sm focus:outline-none"
            >
              {[3, 4, 5, 6, 7, 8, 10].map((n) => (
                <option key={n} value={n}>{n}s</option>
              ))}
            </select>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-[11px] tracking-widest uppercase"
          >
            <Plus className="h-4 w-4" /> Add banner
          </button>
        </div>
      </div>

      {/* Banner list */}
      <div className="mt-8 space-y-4">
        {banners.map((b, idx) => (
          <div key={b.id} className="border border-border overflow-hidden">
            <div className="flex gap-0">
              {/* Thumbnail */}
              <div className="relative w-48 h-28 flex-shrink-0 bg-secondary overflow-hidden">
                {b.image ? (
                  <img src={b.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground" strokeWidth={1} />
                  </div>
                )}
                {/* Overlay text badge */}
                <span className={`absolute top-2 left-2 text-[9px] px-1.5 py-0.5 uppercase tracking-wider ${
                  (b.showText ?? true) ? "bg-emerald-600 text-white" : "bg-neutral-400 text-white"
                }`}>
                  {(b.showText ?? true) ? "Text ON" : "Text OFF"}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 px-6 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-base">{b.title || <span className="text-muted-foreground italic">No title</span>}</p>
                    {b.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{b.subtitle}</p>}
                    {b.cta && (
                      <span className="mt-2 inline-block border border-border px-3 py-1 text-[10px] uppercase tracking-widest">
                        {b.cta} → {b.href}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {/* Move up/down */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => move(b.id, "up")}
                        disabled={idx === 0}
                        className="border border-border p-1.5 hover:bg-secondary disabled:opacity-30"
                        title="Move up"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => move(b.id, "down")}
                        disabled={idx === banners.length - 1}
                        className="border border-border p-1.5 hover:bg-secondary disabled:opacity-30"
                        title="Move down"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Toggle text overlay */}
                    <button
                      onClick={() => toggleText(b.id)}
                      title={(b.showText ?? true) ? "Hide text overlay" : "Show text overlay"}
                      className={`border p-2 transition-colors ${
                        (b.showText ?? true)
                          ? "border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                          : "border-border text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {(b.showText ?? true) ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => openEdit(b)}
                      className="border border-border p-2 hover:bg-secondary"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => remove(b.id)}
                      className="border border-border p-2 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">No banners. Click "Add banner" to get started.</p>
          </div>
        )}
      </div>

      {/* Tip */}
      <p className="mt-6 text-xs text-muted-foreground">
        <span className="font-semibold">Tip:</span> The eye icon toggles whether the title/subtitle/CTA overlay is shown on top of a banner image. The banner image itself is always visible in the carousel.
      </p>

      {/* ── Edit / Add Modal ── */}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-lg bg-background p-8 space-y-5 my-auto">
            <h3 className="text-xl">{isNew ? "Add banner" : "Edit banner"}</h3>

            {/* Image preview */}
            {editing.image && (
              <div className="relative h-36 overflow-hidden bg-secondary">
                <img src={editing.image} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Image URL */}
            <div>
              <label className="text-[11px] tracking-widest uppercase text-muted-foreground">
                Image URL *
              </label>
              <input
                required
                placeholder="https://images.unsplash.com/photo-xxxxx?w=1800"
                value={editing.image}
                onChange={(e) => setEditing((s) => ({ ...s!, image: e.target.value }))}
                className={inp + " mt-2"}
              />
              <p className="mt-1 text-[10px] text-muted-foreground">Use Unsplash, Cloudinary, or any direct image URL.</p>
            </div>

            {/* Title */}
            <div>
              <label className="text-[11px] tracking-widest uppercase text-muted-foreground">
                Title
              </label>
              <input
                placeholder="Amadeus Jewelry\nCollection"
                value={editing.title ?? ""}
                onChange={(e) => setEditing((s) => ({ ...s!, title: e.target.value }))}
                className={inp + " mt-2"}
              />
              <p className="mt-1 text-[10px] text-muted-foreground">Use \n for line break in hero text.</p>
            </div>

            {/* Eyebrow */}
            <div>
              <label className="text-[11px] tracking-widest uppercase text-muted-foreground">
                Eyebrow (small text above title)
              </label>
              <input
                placeholder="New in our shop"
                value={editing.eyebrow ?? ""}
                onChange={(e) => setEditing((s) => ({ ...s!, eyebrow: e.target.value }))}
                className={inp + " mt-2"}
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="text-[11px] tracking-widest uppercase text-muted-foreground">
                Subtitle (small text below title)
              </label>
              <input
                placeholder="NEW IN OUR SHOP"
                value={editing.subtitle ?? ""}
                onChange={(e) => setEditing((s) => ({ ...s!, subtitle: e.target.value }))}
                className={inp + " mt-2"}
              />
            </div>

            {/* CTA button label */}
            <div>
              <label className="text-[11px] tracking-widest uppercase text-muted-foreground">
                CTA button text
              </label>
              <input
                placeholder="Shop Now"
                value={editing.cta ?? ""}
                onChange={(e) => setEditing((s) => ({ ...s!, cta: e.target.value }))}
                className={inp + " mt-2"}
              />
            </div>

            {/* CTA link */}
            <div>
              <label className="text-[11px] tracking-widest uppercase text-muted-foreground">
                CTA link URL
              </label>
              <input
                placeholder="/shop"
                value={editing.href ?? ""}
                onChange={(e) => setEditing((s) => ({ ...s!, href: e.target.value }))}
                className={inp + " mt-2"}
              />
            </div>

            {/* Show text toggle */}
            <div className="flex items-center justify-between border border-border p-4">
              <div>
                <p className="text-sm font-medium">Show text overlay</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Display title, subtitle & button on top of the image
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing((s) => ({ ...s!, showText: !(s?.showText ?? true) }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  (editing.showText ?? true) ? "bg-emerald-600" : "bg-neutral-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    (editing.showText ?? true) ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => saveBanner(editing)}
                className="bg-primary text-primary-foreground flex-1 py-3 text-[11px] tracking-[0.3em] uppercase"
              >
                {isNew ? "Add banner" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="border border-border px-6 text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBanners;
