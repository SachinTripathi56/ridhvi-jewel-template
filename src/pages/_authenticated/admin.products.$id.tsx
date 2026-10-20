import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProductForm, type ProductPayload } from "@/components/admin/ProductForm";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function EditProductPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: product, isLoading } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => api.admin.getProduct(id),
    enabled: Boolean(id),
  });

  if (isLoading) return <p className="mt-8 text-sm text-muted-foreground animate-pulse">Loading product…</p>;
  if (!product) return <p className="mt-8 text-sm text-muted-foreground">Product not found.</p>;

  const initial: ProductPayload = {
    id,
    name: product.name ?? "",
    shortDescription: product.shortDescription ?? "",
    longDescription: product.longDescription ?? "",
    ingredients: product.ingredients ?? "",
    benefits: product.benefits ?? "",
    directionsToUse: product.directionsToUse ?? "",
    basePrice: Number(product.basePrice ?? 0),
    mrp: product.mrp ? Number(product.mrp) : undefined,
    stockMode: (product.stockMode as any) ?? "MANAGED",
    stockQuantity: product.stockQuantity ?? 0,
    manuallyAvailable: product.manuallyAvailable ?? true,
    categoryId: product.category?.id ? String(product.category.id) : undefined,
    netQuantity: product.netQuantity ?? "",
    shelfLife: product.shelfLife ?? "",
    countryOfOrigin: product.countryOfOrigin ?? "India",
    featured: product.featured ?? false,
    isNew: (product as any).isNew ?? false,
  };

  const existingImages = (product.images ?? []).map((img: any) => ({
    id: String(img.id),
    imageUrl: img.imageUrl ?? img.url ?? "",
    isPrimary: img.isPrimary ?? img.primary ?? false,
    displayOrder: img.displayOrder ?? 0,
  }));

  return (
    <div>
      <h1 className="text-3xl">Edit product</h1>
      <p className="mt-1 text-sm text-muted-foreground">{product.name}</p>
      <div className="mt-8">
        <ProductForm
          initial={initial}
          existingImages={existingImages}
          onSubmit={async (p: ProductPayload) => {
            const result = await api.admin.upsertProduct({ ...p, id });
            toast.success("Saved");
            navigate("/admin/products");
            return result;
          }}
        />
      </div>
    </div>
  );
}
