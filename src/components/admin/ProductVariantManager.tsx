"use client";

import { useTransition, useState } from "react";
import { toast } from "@/lib/toast";
import {
  updateVariantStock,
  addProductVariant,
  deleteProductVariant,
} from "@/features/admin/actions";

interface Variant {
  id: string;
  color: string;
  size: string;
  stockQuantity: number;
  priceAdjustment: number;
}

interface Color {
  name: string;
  hex: string;
}

export function ProductVariantManager({
  variants,
  colors,
  productId,
}: {
  variants: Variant[];
  colors: Color[];
  productId: string;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [addPending, startAddTransition] = useTransition();
  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("S");
  const [newStock, setNewStock] = useState(0);
  const [newPriceAdj, setNewPriceAdj] = useState(0);

  async function handleUpdate(variantId: string, formData: FormData) {
    setPendingId(variantId);
    const result = await updateVariantStock(variantId, formData);
    setPendingId(null);
    if (result?.error) toast.error(result.error);
    else toast.success("Variant updated");
  }

  function handleDelete(variantId: string) {
    if (!confirm("Delete this variant? This cannot be undone.")) return;
    setPendingId(variantId);
    startAddTransition(async () => {
      const result = await deleteProductVariant(variantId);
      setPendingId(null);
      if (result?.error) toast.error(result.error);
      else toast.success("Variant deleted");
    });
  }

  function handleAdd() {
    if (!newColor) {
      toast.error("Select a color");
      return;
    }
    startAddTransition(async () => {
      const formData = new FormData();
      formData.set("size", newSize);
      formData.set("color", newColor);
      formData.set("stockQuantity", String(newStock));
      formData.set("priceAdjustment", String(newPriceAdj));
      const result = await addProductVariant(productId, formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Variant added");
        setNewStock(0);
        setNewPriceAdj(0);
      }
    });
  }

  return (
    <div className="bg-[#FAF7F2] border border-black/6 rounded overflow-hidden">
      <div className="px-6 py-4 border-b border-black/6">
        <h2 className="text-sm font-medium text-[#111111]">Variants</h2>
        <p className="text-xs text-[#666666] mt-0.5">
          Manage color, size, stock and per-variant pricing
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/6">
              {["Color", "Size", "Stock", "Price Adj. (₹)", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] text-[#666666] tracking-widest uppercase px-6 py-3 font-normal"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id} className="border-b border-black/4">
                <td className="px-6 py-3 text-sm text-[#111111]">{v.color}</td>
                <td className="px-6 py-3 text-sm text-[#111111]">{v.size}</td>
                <td className="px-6 py-3" colSpan={2}>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdate(v.id, new FormData(e.currentTarget));
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      name="stockQuantity"
                      type="number"
                      min={0}
                      defaultValue={v.stockQuantity}
                      className="w-20 bg-white border border-black/8 px-2 py-2 text-sm rounded"
                    />
                    <input
                      name="priceAdjustment"
                      type="number"
                      step={0.01}
                      defaultValue={v.priceAdjustment}
                      className="w-20 bg-white border border-black/8 px-2 py-2 text-sm rounded"
                    />
                    <button
                      type="submit"
                      disabled={pendingId === v.id}
                      className="text-xs text-[#666666] hover:text-[#111111] underline transition-colors disabled:opacity-50"
                    >
                      {pendingId === v.id ? "…" : "Update"}
                    </button>
                  </form>
                </td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => handleDelete(v.id)}
                    disabled={pendingId === v.id}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {variants.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-sm text-[#666666]"
                >
                  No variants yet. Add one below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add variant */}
      <div className="border-t border-black/6 px-6 py-4 bg-white/40">
        <h3 className="text-xs text-[#666666] tracking-widest uppercase mb-3">
          Add Variant
        </h3>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="space-y-1">
            <label className="text-[10px] text-[#666666]">Color</label>
            <select
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="bg-white border border-black/8 px-3 py-2 text-sm rounded"
            >
              <option value="">Select…</option>
              {colors.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-[#666666]">Size</label>
            <select
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              className="bg-white border border-black/8 px-3 py-2 text-sm rounded"
            >
              {["S", "M", "L", "XL", "XXL"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-[#666666]">Stock</label>
            <input
              type="number"
              min={0}
              value={newStock}
              onChange={(e) => setNewStock(Number(e.target.value))}
              className="w-20 bg-white border border-black/8 px-3 py-2 text-sm rounded"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-[#666666]">
              Price Adj. (₹)
            </label>
            <input
              type="number"
              step={0.01}
              value={newPriceAdj}
              onChange={(e) => setNewPriceAdj(Number(e.target.value))}
              className="w-20 bg-white border border-black/8 px-3 py-2 text-sm rounded"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={addPending}
            className="bg-[#111111] text-white text-xs tracking-widest uppercase px-4 py-2 hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {addPending ? "Adding…" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
