"use client";

import { useState } from "react";

export interface ColorEntry {
  name: string;
  hex: string;
  frontMockup?: string | null;
  backMockup?: string | null;
}

const SUGGESTED_HEX = ["#111111", "#ffffff", "#3b3b3b", "#8b7355", "#1e3a5f", "#556b2f", "#8b0000", "#c9a227"];

export function ColorManagerField({
  initialColors,
  isCustomizable,
}: {
  initialColors: ColorEntry[];
  isCustomizable: boolean;
}) {
  const [colors, setColors] = useState<ColorEntry[]>(
    initialColors.length > 0 ? initialColors : [{ name: "", hex: "#111111" }]
  );
  const [uploadingFor, setUploadingFor] = useState<string | null>(null); // `${index}-front` | `${index}-back`

  function updateColor(i: number, patch: Partial<ColorEntry>) {
    setColors((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  function addColor() {
    setColors((prev) => [...prev, { name: "", hex: "#111111" }]);
  }

  function removeColor(i: number) {
    setColors((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleMockupUpload(i: number, side: "front" | "back", file: File) {
    if (file.size > 5 * 1024 * 1024) {
      alert("Mockup image must be under 5MB");
      return;
    }
    const key = `${i}-${side}`;
    setUploadingFor(key);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", "products");
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      updateColor(i, side === "front" ? { frontMockup: data.url } : { backMockup: data.url });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Mockup upload failed");
    } finally {
      setUploadingFor(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs text-[#666666] tracking-widest uppercase">Colors</label>
        <button type="button" onClick={addColor} className="text-xs text-[#111111] underline hover:opacity-70">
          + Add Color
        </button>
      </div>
      <p className="text-[11px] text-[#666666]">
        Add every color this product comes in. Each one gets its own swatch on the shop page.
        {isCustomizable && " Since this is a customizable shirt, also upload a front/back blank-shirt photo for each color — that's what shows in the studio."}
      </p>

      <div className="space-y-3">
        {colors.map((c, i) => (
          <div key={i} className="border border-black/10 rounded p-3 space-y-2 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={c.hex}
                onChange={(e) => updateColor(i, { hex: e.target.value })}
                className="w-9 h-9 rounded border border-black/10 cursor-pointer shrink-0"
              />
              <input
                value={c.name}
                onChange={(e) => updateColor(i, { name: e.target.value })}
                placeholder="Color name (e.g. Forest Green)"
                className="flex-1 bg-[#FAF7F2] border border-black/8 px-3 py-2 text-sm rounded"
              />
              {colors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeColor(i)}
                  className="text-red-500 hover:text-red-700 text-xs shrink-0 px-1"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {SUGGESTED_HEX.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => updateColor(i, { hex })}
                  className="w-5 h-5 rounded-full border border-black/10"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
            {isCustomizable && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {(["front", "back"] as const).map((side) => (
                  <label
                    key={side}
                    className="flex flex-col items-center gap-1 border border-dashed border-black/15 rounded py-3 cursor-pointer hover:border-black/30 text-[11px] text-[#666666]"
                  >
                    {(side === "front" ? c.frontMockup : c.backMockup) ? "✓ Uploaded — click to replace" : `Upload ${side} mockup`}
                    {uploadingFor === `${i}-${side}` && " …"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleMockupUpload(i, side, file);
                      }}
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Serialized for the server action to parse */}
      <input type="hidden" name="colorsJson" value={JSON.stringify(colors.filter((c) => c.name.trim()))} />
    </div>
  );
}