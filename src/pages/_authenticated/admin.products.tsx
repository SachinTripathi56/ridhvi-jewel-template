import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, formatPrice } from "@/lib/api";
import { adaptProduct } from "@/lib/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

function ProductsAdmin() {
  const qc = useQueryClient();
  const { data: rawProducts = [] } = useQuery({ queryKey: ["admin-products"], queryFn: () => api.admin.listProducts() });
  const products = rawProducts.map(adaptProduct);

  async function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await api.admin.deleteProduct(id); toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-products"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} total</p>
        </div>
        <Link to="/admin/products/new" className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-[11px] tracking-widest uppercase"><Plus className="h-4 w-4" /> New product</Link>
      </div>
      <table className="mt-8 w-full text-sm">
        <thead className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
          <tr><th className="py-3">Product</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-border">
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <img src={p.image} alt="" className="h-10 w-10 bg-secondary object-contain" />
                  <span>{p.name}</span>
                </div>
              </td>
              <td className="capitalize">{p.category}</td>
              <td>{formatPrice(p.price)}</td>
              <td>{p.inStock ? "In stock" : <span className="text-red-500">Out</span>}</td>
              <td className="text-right">
                <div className="flex justify-end gap-2">
                  <Link to={`/admin/products/${p.id}`} className="border border-border p-2 hover:bg-secondary"><Pencil className="h-3 w-3" /></Link>
                  <button onClick={() => remove(p.id, p.name)} className="border border-border p-2 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">No products. Add one to get started.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductsAdmin;
