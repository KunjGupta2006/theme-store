import { db } from "@/lib/db";
import Link from "next/link";
import { deleteProduct } from "@/features/admin/actions";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Products — Admin" };

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { variants: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Inter_Tight'] text-3xl font-bold text-[#111111]">Products</h1>
          <p className="text-sm text-[#666666] mt-1">
            {products.length} {products.length === 1 ? "product" : "products"} total
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-[#111111] text-white text-xs tracking-widest uppercase px-5 py-3 hover:opacity-80 transition-opacity"
        >
          + Add Product
        </Link>
      </div>
      {/* Table */}
      <div className="bg-[#FAF7F2] border border-black/6 rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/6">
              {["Product", "Price", "Featured", "Variants", "Actions"].map((h) => (
                <th key={h} className="text-left text-[10px] text-[#666666] tracking-widest uppercase px-6 py-4 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-sm text-[#666666] py-12">
                  No products yet.{" "}
                  <Link href="/admin/products/new" className="underline">
                    Add one
                  </Link>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const removeProduct = deleteProduct.bind(null, product.id);
                return (
                  <tr key={product.id} className="border-b border-black/4 hover:bg-[#EEE7DD]/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#111111]">{product.name}</p>
                      <p className="text-xs text-[#666666] mt-0.5">/{product.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#111111]">
                      ₹{product.basePrice.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                          product.isFeatured ? "bg-green-100 text-green-800" : "bg-[#EEE7DD] text-[#666666]"
                        }`}
                      >
                        {product.isFeatured ? "Featured" : "Standard"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#666666]">{product._count.variants} variants</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-xs text-[#666666] hover:text-[#111111] transition-colors underline"
                        >
                          Edit
                        </Link>
                        <DeleteProductButton action={removeProduct} productName={product.name} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
