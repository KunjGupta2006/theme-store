"use client";

import { useTransition } from "react";
import { toast } from "@/lib/toast";
import { updateVariantStock } from "@/features/admin/actions";

interface Variant {
  id: string;
  color: string;
  size: string;
  stockQuantity: number;
  priceAdjustment: number;
}

export function VariantStockForm({ variant }: { variant: Variant }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateVariantStock(variant.id, formData);
      if (result?.error) toast.error(result.error);
      else toast.success(`${variant.color} / ${variant.size} updated`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <input
        name="stockQuantity"
        type="number"
        min={0}
        defaultValue={variant.stockQuantity}
        className="w-24 bg-white border border-black/8 px-3 py-2 text-sm rounded"
      />
      <input
        name="priceAdjustment"
        type="number"
        step={0.01}
        defaultValue={variant.priceAdjustment}
        className="w-24 bg-white border border-black/8 px-3 py-2 text-sm rounded"
      />
      <button
        type="submit"
        disabled={isPending}
        className="text-xs text-[#666666] hover:text-[#111111] underline transition-colors disabled:opacity-50"
      >
        {isPending ? "Updating…" : "Update"}
      </button>
    </form>
  );
}