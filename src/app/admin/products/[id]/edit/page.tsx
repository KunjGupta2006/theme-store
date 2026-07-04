import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { updateProduct, updateVariantStock } from "@/features/admin/actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Product — Admin" };

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { variants: { orderBy: [{ color: "asc" }, { size: "asc" }] } },
  });
  if (!product) notFound();

  const updateProductWithId = updateProduct.bind(null, product.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-sm text-[#666666] hover:text-[#111111] transition-colors">
          ← Products
        </Link>
        <span className="text-[#666666]">/</span>
        <h1 className="font-['Inter_Tight'] text-2xl font-bold text-[#111111]">Edit Product</h1>
      </div>

      <form action={updateProductWithId} className="bg-[#FAF7F2] border border-black/6 rounded p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs text-[#666666] tracking-widest uppercase">Product Name</label>
          <input
            name="name"
            required
            defaultValue={product.name}
            className="w-full bg-white border border-black/8 px-4 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors rounded"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-[#666666] tracking-widest uppercase">Description</label>
          <textarea
            name="description"
            required
            rows={3}
            defaultValue={product.description}
            className="w-full bg-white border border-black/8 px-4 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors rounded resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-[#666666] tracking-widest uppercase">Base Price (₹)</label>
            <input
              name="basePrice"
              type="number"
              required
              min={0}
              step={0.01}
              defaultValue={product.basePrice}
              className="w-full bg-white border border-black/8 px-4 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors rounded"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-[#666666] tracking-widest uppercase">Featured</label>
            <select
              name="isFeatured"
              defaultValue={product.isFeatured ? "true" : "false"}
              className="w-full bg-white border border-black/8 px-4 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors rounded"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-[#666666] tracking-widest uppercase">Customizable</label>
          <select
            name="isCustomizable"
            defaultValue={product.isCustomizable ? "true" : "false"}
            className="w-full bg-white border border-black/8 px-4 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors rounded"
          >
            <option value="false">No — sold as-is at Base Price (template design)</option>
            <option value="true">Yes — plain shirt, priced via Settings (base + per-side print charge)</option>
          </select>
        </div>
        <ImageUploadField name="thumbnail" label="Thumbnail" defaultValue={product.thumbnail} folder="products" />
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="bg-[#111111] text-white text-xs tracking-widest uppercase px-6 py-3 hover:opacity-80 transition-opacity"
          >
            Save Changes
          </button>
          <Link href="/admin/products" className="text-xs text-[#666666] hover:text-[#111111] transition-colors">
            Cancel
          </Link>
        </div>
      </form>

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
            {product.variants.map((v) => {
              const updateVariant = updateVariantStock.bind(null, v.id);
              return (
                <tr key={v.id} className="border-b border-black/4">
                  <td className="px-6 py-3 text-sm text-[#111111]">{v.color}</td>
                  <td className="px-6 py-3 text-sm text-[#111111]">{v.size}</td>
                  <td colSpan={3} className="px-6 py-3">
                    <form action={updateVariant} className="flex items-center gap-3">
                      <input
                        name="stockQuantity"
                        type="number"
                        min={0}
                        defaultValue={v.stockQuantity}
                        className="w-24 bg-white border border-black/8 px-3 py-2 text-sm rounded"
                      />
                      <input
                        name="priceAdjustment"
                        type="number"
                        step={0.01}
                        defaultValue={v.priceAdjustment}
                        className="w-24 bg-white border border-black/8 px-3 py-2 text-sm rounded"
                      />
                      <button
                        type="submit"
                        className="text-xs text-[#666666] hover:text-[#111111] underline transition-colors"
                      >
                        Update
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
