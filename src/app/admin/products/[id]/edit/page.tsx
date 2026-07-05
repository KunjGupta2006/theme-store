import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EditProductForm } from "@/components/admin/EditProductForm";
import { MultiImageUploadField } from "@/components/admin/MultiImageUploadField";
import { VariantStockForm } from "@/components/admin/VariantStockForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Product — Admin" };

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
      images: { orderBy: { position: "asc" } },
    },
  });
  if (!product) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-sm text-[#666666] hover:text-[#111111] transition-colors">
          ← Products
        </Link>
        <span className="text-[#666666]">/</span>
        <h1 className="font-['Inter_Tight'] text-2xl font-bold text-[#111111]">Edit Product</h1>
      </div>

      <EditProductForm product={product} />

      <div className="bg-[#FAF7F2] border border-black/6 rounded p-6">
        <MultiImageUploadField productId={product.id} images={product.images} />
      </div>

      {/* Variant stock & price adjustment */}
      <div className="bg-[#FAF7F2] border border-black/6 rounded overflow-hidden">
        <div className="px-6 py-4 border-b border-black/6">
          <h2 className="text-sm font-medium text-[#111111]">Variants</h2>
          <p className="text-xs text-[#666666] mt-0.5">Update stock and per-variant price adjustment</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/6">
              {["Color", "Size", "Stock", "Price Adj. (₹)", ""].map((h) => (
                <th key={h} className="text-left text-[10px] text-[#666666] tracking-widest uppercase px-6 py-3 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {product.variants.map((v) => (
              <tr key={v.id} className="border-b border-black/4">
                <td className="px-6 py-3 text-sm text-[#111111]">{v.color}</td>
                <td className="px-6 py-3 text-sm text-[#111111]">{v.size}</td>
                <td colSpan={3} className="px-6 py-3">
                  <VariantStockForm variant={v} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}