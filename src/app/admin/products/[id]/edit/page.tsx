import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { updateProduct, updateVariantStock } from "@/features/admin/actions";
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
    },
  });

  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, id);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="text-sm text-[#666666] hover:text-[#111111] transition-colors"
        >
          ← Products
        </Link>
        <span className="text-[#666666]">/</span>
        <h1 className="font-['Inter_Tight'] text-2xl font-bold text-[#111111]">
          Edit Product
        </h1>
      </div>

      {/* Product form */}
      <form
        action={updateWithId}
        className="bg-[#FAF7F2] border border-black/6 rounded p-6 space-y-5"
      >
        <div className="space-y-1.5">
          <label className="text-xs text-[#666666] tracking-widest uppercase">
            Product Name
          </label>
          <input
            name="name"
            required
            defaultValue={product.name}
            className="w-full bg-white border border-black/8 px-4 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors rounded"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-[#666666] tracking-widest uppercase">
            Description
          </label>
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
            <label className="text-xs text-[#666666] tracking-widest uppercase">
              Base Price (₹)
            </label>
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
            <label className="text-xs text-[#666666] tracking-widest uppercase">
              Featured
            </label>
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
          <label className="text-xs text-[#666666] tracking-widest uppercase">
            Thumbnail URL
          </label>
          <input
            name="thumbnail"
            type="url"
            defaultValue={product.thumbnail ?? ""}
            className="w-full bg-white border border-black/8 px-4 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors rounded"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="bg-[#111111] text-white text-xs tracking-widest uppercase px-6 py-3 hover:opacity-80 transition-opacity"
          >
            Save Changes
          </button>
          <Link
            href="/admin/products"
            className="text-xs text-[#666666] hover:text-[#111111] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* Variant stock management */}
      <div className="bg-[#FAF7F2] border border-black/6 rounded overflow-hidden">
        <div className="px-6 py-4 border-b border-black/6">
          <h2 className="text-sm font-medium text-[#111111]">Stock by Variant</h2>
          <p className="text-xs text-[#666666] mt-0.5">
            Update stock for each size/color combination
          </p>
        </div>
        <div className="divide-y divide-black/4">
          {product.variants.map((variant) => (
            <form
              key={variant.id}
              action={async (formData) => {
                "use server";
                const stock = parseInt(formData.get("stock") as string, 10);
                await updateVariantStock(variant.id, stock);
              }}
              className="flex items-center gap-4 px-6 py-3"
            >
              <span className="text-xs font-medium text-[#111111] w-12">
                {variant.color}
              </span>
              <span className="text-xs text-[#666666] w-10">{variant.size}</span>
              <input
                name="stock"
                type="number"
                min={0}
                defaultValue={variant.stockQuantity}
                className="w-20 bg-white border border-black/8 px-3 py-1.5 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors rounded text-center"
              />
              <button
                type="submit"
                className="text-xs text-[#666666] hover:text-[#111111] transition-colors underline"
              >
                Save
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}