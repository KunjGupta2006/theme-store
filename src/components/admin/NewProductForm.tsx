"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "@/lib/toast";
import { createProduct } from "@/features/admin/actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

const initialState: { error?: string } = {};

export function NewProductForm() {
  const [state, formAction, pending] = useActionState(createProduct, initialState);
  // const initialColors={[]};
  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="bg-[#FAF7F2] border border-black/6 rounded p-6 space-y-5">
      <div className="space-y-1.5">
        <label className="text-xs text-[#666666] tracking-widest uppercase">Product Name</label>
        <input
          name="name"
          required
          placeholder="e.g. Structured Heavyweight Tee"
          className="w-full bg-white border border-black/8 px-4 py-3 text-sm text-[#111111] placeholder:text-[#999] focus:outline-none focus:border-[#111111] transition-colors rounded"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-[#666666] tracking-widest uppercase">Description</label>
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
          <label className="text-xs text-[#666666] tracking-widest uppercase">Base Price (₹)</label>
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
          <label className="text-xs text-[#666666] tracking-widest uppercase">Featured</label>
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
        <label className="text-xs text-[#666666] tracking-widest uppercase">Customizable</label>
        <select
          name="isCustomizable"
          defaultValue="false"
          className="w-full bg-white border border-black/8 px-4 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors rounded"
        >
          <option value="false">No — sold as-is at Base Price (template design)</option>
          <option value="true">Yes — plain shirt, priced via Settings (base + per-side print charge)</option>
        </select>
        <p className="text-[11px] text-[#666666]">
          Turn this on for the one or few plain shirts customers design in the studio. Leave off for
          pre-made template-design shirts sold at a fixed price.
        </p>
      </div>



      <ImageUploadField name="thumbnail" label="Thumbnail" folder="products" />
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-[#111111] text-white text-xs tracking-widest uppercase px-6 py-3 hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create Product"}
        </button>
        <Link href="/admin/products" className="text-xs text-[#666666] hover:text-[#111111] transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}