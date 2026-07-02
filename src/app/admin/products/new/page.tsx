import { createProduct } from "@/features/admin/actions";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Product — Admin" };

export default function NewProductPage() {
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
          New Product
        </h1>
      </div>

      {/* Form */}
      <form
        action={createProduct}
        className="bg-[#FAF7F2] border border-black/6 rounded p-6 space-y-5"
      >
        <div className="space-y-1.5">
          <label className="text-xs text-[#666666] tracking-widest uppercase">
            Product Name
          </label>
          <input
            name="name"
            required
            placeholder="e.g. Structured Heavyweight Tee"
            className="w-full bg-white border border-black/8 px-4 py-3 text-sm text-[#111111] placeholder:text-[#999] focus:outline-none focus:border-[#111111] transition-colors rounded"
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
            placeholder="Brief product description..."
            className="w-full bg-white border border-black/8 px-4 py-3 text-sm text-[#111111] placeholder:text-[#999] focus:outline-none focus:border-[#111111] transition-colors rounded resize-none"
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
              placeholder="799"
              className="w-full bg-white border border-black/8 px-4 py-3 text-sm text-[#111111] placeholder:text-[#999] focus:outline-none focus:border-[#111111] transition-colors rounded"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#666666] tracking-widest uppercase">
              Featured
            </label>
            <select
              name="isFeatured"
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
            placeholder="https://images.unsplash.com/..."
            className="w-full bg-white border border-black/8 px-4 py-3 text-sm text-[#111111] placeholder:text-[#999] focus:outline-none focus:border-[#111111] transition-colors rounded"
          />
          <p className="text-[11px] text-[#666666]">
            Cloudinary upload coming soon. Paste a URL for now.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="bg-[#111111] text-white text-xs tracking-widest uppercase px-6 py-3 hover:opacity-80 transition-opacity"
          >
            Create Product
          </button>
          <Link
            href="/admin/products"
            className="text-xs text-[#666666] hover:text-[#111111] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>

      <p className="text-xs text-[#666666]">
        All size/color variants (SU+002dXXL U+0078 Black/White) are created automatically
        with 0 stock. Edit individual variants after creation.
      </p>
    </div>
  );
}