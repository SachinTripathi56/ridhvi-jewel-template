import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Upload, X, Star, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

// ── Types ───────────────────────────────────────────────────────────────────

/** Shape that maps 1:1 to CreateProductRequest / UpdateProductRequest */
export interface ProductPayload {
  id?: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  ingredients: string;       // stored as TEXT, newline-separated in UI
  benefits: string;          // stored as TEXT, newline-separated in UI
  directionsToUse: string;
  basePrice: number;
  mrp?: number;
  stockMode: "MANAGED" | "UNLIMITED" | "MANUAL";
  stockQuantity: number;
  manuallyAvailable: boolean;
  categoryId?: string;
  netQuantity: string;
  shelfLife: string;
  countryOfOrigin: string;
  featured: boolean;
  isNew: boolean;
}

const EMPTY: ProductPayload = {
  name: "", shortDescription: "", longDescription: "",
  ingredients: "", benefits: "", directionsToUse: "",
  basePrice: 0, mrp: undefined,
  stockMode: "MANAGED", stockQuantity: 0, manuallyAvailable: true,
  categoryId: undefined, netQuantity: "", shelfLife: "",
  countryOfOrigin: "India", featured: false, isNew: false,
};

// ── Existing image (already uploaded to Cloudinary, stored in DB) ────────────
interface ExistingImage {
  id: string;
  imageUrl: string;
  isPrimary?: boolean;
  displayOrder?: number;
}

// ── Props ───────────────────────────────────────────────────────────────────

interface Props {
  initial?: Partial<ProductPayload>;
  /** Images already saved for the product (edit mode) */
  existingImages?: ExistingImage[];
  onSubmit: (p: ProductPayload) => Promise<void> | void;
}

// ── Small helpers ───────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] tracking-widest uppercase text-muted-foreground mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

const cls =
  "w-full border-b border-foreground/30 bg-transparent py-2 text-sm focus:outline-none focus:border-foreground";

// ── Image Manager (inline, self-contained) ──────────────────────────────────

function ImageManager({
  productId,
  existing,
  onExistingChange,
  pendingFiles,
  onPendingChange,
}: {
  productId?: string;
  existing: ExistingImage[];
  onExistingChange: (imgs: ExistingImage[]) => void;
  pendingFiles: File[];
  onPendingChange: (files: File[]) => void;
}) {
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(newFiles: File[]) {
    const imgs = newFiles.filter((f) => f.type.startsWith("image/"));
    if (!imgs.length) return;
    onPendingChange([...pendingFiles, ...imgs]);
    imgs.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setPendingPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  }

  function removePending(idx: number) {
    onPendingChange(pendingFiles.filter((_, i) => i !== idx));
    setPendingPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function deleteExisting(imgId: string) {
    if (!productId) return;
    setDeletingId(imgId);
    try {
      await api.admin.deleteProductImage(productId, imgId);
      onExistingChange(existing.filter((i) => i.id !== imgId));
      toast.success("Image removed");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  async function setPrimary(imgId: string) {
    if (!productId) return;
    setSettingPrimaryId(imgId);
    try {
      await api.admin.setPrimaryImage(productId, imgId);
      onExistingChange(existing.map((i) => ({ ...i, isPrimary: i.id === imgId })));
      toast.success("Primary image set");
    } catch {
      toast.error("Failed to set primary");
    } finally {
      setSettingPrimaryId(null);
    }
  }

  const totalImages = existing.length + pendingFiles.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] tracking-widest uppercase text-muted-foreground">
          Product Images
        </span>
        <span className="text-[11px] text-muted-foreground">{totalImages} image(s)</span>
      </div>

      {/* Existing images */}
      {existing.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {existing.map((img) => (
            <div key={img.id} className="relative group aspect-square bg-secondary overflow-hidden">
              <img src={img.imageUrl} alt="" className="h-full w-full object-contain p-1" />
              {img.isPrimary && (
                <span className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] px-1 py-0.5 rounded flex items-center gap-0.5">
                  <Star className="h-2 w-2 fill-white" /> Primary
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                {!img.isPrimary && (
                  <button
                    type="button"
                    disabled={settingPrimaryId === img.id}
                    onClick={() => setPrimary(img.id)}
                    className="text-[9px] text-white bg-amber-500 hover:bg-amber-600 px-2 py-1 rounded w-full"
                  >
                    {settingPrimaryId === img.id ? <Loader2 className="h-2.5 w-2.5 animate-spin mx-auto" /> : "Set Primary"}
                  </button>
                )}
                <button
                  type="button"
                  disabled={deletingId === img.id}
                  onClick={() => deleteExisting(img.id)}
                  className="text-[9px] text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded w-full"
                >
                  {deletingId === img.id ? <Loader2 className="h-2.5 w-2.5 animate-spin mx-auto" /> : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending (local previews) */}
      {pendingPreviews.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {pendingPreviews.map((src, i) => (
            <div key={i} className="relative group aspect-square bg-secondary overflow-hidden border-2 border-dashed border-primary/40">
              <img src={src} alt="" className="h-full w-full object-contain p-1" />
              {i === 0 && existing.length === 0 && (
                <span className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] px-1 py-0.5 rounded flex items-center gap-0.5">
                  <Star className="h-2 w-2 fill-white" /> Primary
                </span>
              )}
              <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-[8px] text-white text-center py-0.5">
                Pending upload
              </span>
              <button
                type="button"
                onClick={() => removePending(i)}
                className="absolute top-1 right-1 h-5 w-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files)); }}
        onClick={() => inputRef.current?.click()}
        className="border border-dashed border-border rounded p-6 text-center cursor-pointer hover:border-foreground/50 transition-colors"
      >
        <Upload className="mx-auto h-6 w-6 text-muted-foreground" strokeWidth={1.2} />
        <p className="mt-2 text-xs text-muted-foreground">
          Drag & drop or <span className="underline">click to browse</span> — multiple files OK
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">JPG · PNG · WebP · AVIF</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
        />
      </div>

      {pendingFiles.length > 0 && !productId && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Images will be uploaded to Cloudinary after the product is saved.
        </p>
      )}
    </div>
  );
}

// ── Main ProductForm ─────────────────────────────────────────────────────────

export function ProductForm({ initial, existingImages = [], onSubmit }: Props) {
  const [p, setP] = useState<ProductPayload>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Image state
  const [existing, setExisting] = useState<ExistingImage[]>(existingImages);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.admin.listCategories(),
  });

  function set<K extends keyof ProductPayload>(k: K, v: ProductPayload[K]) {
    setP((s) => ({ ...s, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Save product metadata
      const result = await onSubmit(p) as any;

      // 2. Upload pending images if any
      const productId = p.id ?? result?.data?.id ?? result?.id;
      if (pendingFiles.length > 0 && productId) {
        setUploadingImages(true);
        try {
          await api.admin.uploadProductImages(productId, pendingFiles);
          toast.success(`${pendingFiles.length} image(s) uploaded`);
          setPendingFiles([]);
        } catch (err: any) {
          toast.error(`Images failed: ${err.message}`);
        } finally {
          setUploadingImages(false);
        }
      }
    } finally {
      setSaving(false);
    }
  }

  const isBusy = saving || uploadingImages;

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 max-w-2xl">

      {/* ── Images (top of form so it's always visible) ── */}
      <ImageManager
        productId={p.id}
        existing={existing}
        onExistingChange={setExisting}
        pendingFiles={pendingFiles}
        onPendingChange={setPendingFiles}
      />

      <div className="border-b border-border" />

      {/* ── Basic info ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Product name *">
          <input value={p.name} onChange={(e) => set("name", e.target.value)} required className={cls} />
        </Field>
        <Field label="Net quantity (e.g. 100ml)">
          <input value={p.netQuantity} onChange={(e) => set("netQuantity", e.target.value)} className={cls} />
        </Field>
        <Field label="Short description">
          <input value={p.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className={cls} />
        </Field>
        <Field label="Country of origin">
          <input value={p.countryOfOrigin} onChange={(e) => set("countryOfOrigin", e.target.value)} className={cls} />
        </Field>
      </div>

      <Field label="Long description / body">
        <textarea value={p.longDescription} onChange={(e) => set("longDescription", e.target.value)} rows={4} className={cls} />
      </Field>

      {/* ── Pricing ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Base price (₹) *">
          <input type="number" min={0} step="0.01" value={p.basePrice}
            onChange={(e) => set("basePrice", Number(e.target.value))} required className={cls} />
        </Field>
        <Field label="MRP (₹)">
          <input type="number" min={0} step="0.01" value={p.mrp ?? ""}
            onChange={(e) => set("mrp", e.target.value ? Number(e.target.value) : undefined)} className={cls} />
        </Field>
        <Field label="Shelf life">
          <input value={p.shelfLife} onChange={(e) => set("shelfLife", e.target.value)} className={cls} />
        </Field>
      </div>

      {/* ── Category ── */}
      <Field label="Category">
        <select value={p.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value || undefined)}
          className={cls + " cursor-pointer"}>
          <option value="">— None —</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>

      {/* ── Stock ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Stock mode *">
          <select value={p.stockMode} onChange={(e) => set("stockMode", e.target.value as any)}
            className={cls + " cursor-pointer"}>
            <option value="MANAGED">Managed (tracked)</option>
            <option value="UNLIMITED">Unlimited</option>
            <option value="MANUAL">Manual</option>
          </select>
        </Field>
        {p.stockMode === "MANAGED" && (
          <Field label="Stock quantity">
            <input type="number" min={0} value={p.stockQuantity}
              onChange={(e) => set("stockQuantity", Number(e.target.value))} className={cls} />
          </Field>
        )}
        {p.stockMode === "MANUAL" && (
          <Field label="Manually available">
            <select value={p.manuallyAvailable ? "yes" : "no"}
              onChange={(e) => set("manuallyAvailable", e.target.value === "yes")}
              className={cls + " cursor-pointer"}>
              <option value="yes">Yes (In Stock)</option>
              <option value="no">No (Out of Stock)</option>
            </select>
          </Field>
        )}
        <Field label="Featured">
          <select value={p.featured ? "yes" : "no"}
            onChange={(e) => set("featured", e.target.value === "yes")}
            className={cls + " cursor-pointer"}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </Field>
        <Field label="New Arrival">
          <select value={p.isNew ? "yes" : "no"}
            onChange={(e) => set("isNew", e.target.value === "yes")}
            className={cls + " cursor-pointer"}>
            <option value="no">No</option>
            <option value="yes">Yes — appears under New Arrived tab</option>
          </select>
        </Field>
      </div>

      {/* ── Rich content fields ── */}
      <Field label="Benefits (one per line)">
        <textarea value={p.benefits} onChange={(e) => set("benefits", e.target.value)}
          rows={4} placeholder={"Tarnish-resistant\nHypoallergenic\nLightweight"} className={cls} />
      </Field>

      <Field label="Materials / Ingredients (one per line)">
        <textarea value={p.ingredients} onChange={(e) => set("ingredients", e.target.value)}
          rows={4} placeholder={"Sterling Silver 925\nRhodium plating\nCubic Zirconia"} className={cls} />
      </Field>

      <Field label="Care instructions / Directions (one per line)">
        <textarea value={p.directionsToUse} onChange={(e) => set("directionsToUse", e.target.value)}
          rows={4} placeholder={"Store in a cool, dry place\nClean with a soft cloth\nAvoid contact with perfume"} className={cls} />
      </Field>

      <button
        type="submit"
        disabled={isBusy}
        className="bg-primary text-primary-foreground self-start px-8 py-3 text-[11px] tracking-[0.3em] uppercase disabled:opacity-60 flex items-center gap-2"
      >
        {uploadingImages ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Uploading images…</>
        ) : saving ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
        ) : (
          p.id ? "Update product" : "Create product"
        )}
      </button>
    </form>
  );
}
