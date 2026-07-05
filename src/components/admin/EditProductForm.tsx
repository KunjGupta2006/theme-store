"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "@/lib/toast";
import { updateProduct } from "@/features/admin/actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  thumbnail: string | null;
  isFeatured: boolean;
  isCustomizable: boolean;
}

const initialState: { error?: string } = {};

export function EditProductForm({ product }: { product: Product }) {
  const updateProductWithId = updateProduct.bind(null, product.id);
  const [state, formAction, pending] = useActionState(updateProductWithId, initialState);

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
          disabled={pending}
          className="bg-[#111111] text-white text-xs tracking-widest uppercase px-6 py-3 hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save Changes"}
        </button>
        <Link href="/admin/products" className="text-xs text-[#666666] hover:text-[#111111] transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}