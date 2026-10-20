import { useNavigate } from "react-router-dom";
import { ProductForm, type ProductPayload } from "@/components/admin/ProductForm";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function AdminProductNewPage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-3xl">New Product</h1>
      <p className="mt-1 text-sm text-muted-foreground">Fill in the details — add images after saving.</p>
      <div className="mt-8">
        <ProductForm
          onSubmit={async (p: ProductPayload) => {
            const result: any = await api.admin.upsertProduct(p);
            const id = result?.data?.id ?? result?.id ?? result;
            if (!id) throw new Error("Product created but ID not returned from backend");
            toast.success("Product created");
            navigate("/admin/products");
            return result;
          }}
        />
      </div>
    </div>
  );
}
