"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const SIZES = ["S", "M", "L", "XL", "XXL"];
const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export function ShopFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeColor = searchParams.get("color");
  const activeSize = searchParams.get("size");
  const activeSort = searchParams.get("sort") ?? "newest";

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || params.get(key) === value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-black/[0.08]">
      {/* Color filter */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#666666] tracking-[0.1em] uppercase">
          Color
        </span>
        <button
          onClick={() => setParam("color", "BLACK")}
          className={`flex items-center gap-1.5 text-xs transition-opacity ${
            activeColor === "BLACK" ? "opacity-100" : "opacity-40 hover:opacity-70"
          }`}
        >
          <span className="w-3.5 h-3.5 rounded-full bg-[#111111] border border-black/20" />
          Black
        </button>
        <button
          onClick={() => setParam("color", "WHITE")}
          className={`flex items-center gap-1.5 text-xs transition-opacity ${
            activeColor === "WHITE" ? "opacity-100" : "opacity-40 hover:opacity-70"
          }`}
        >
          <span className="w-3.5 h-3.5 rounded-full bg-white border border-black/20" />
          White
        </button>
      </div>

      {/* Divider */}
      <span className="h-4 w-px bg-black/10" />

      {/* Size filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#666666] tracking-[0.1em] uppercase">
          Size
        </span>
        {SIZES.map((size) => (
          <button
            key={size}
            onClick={() => setParam("size", size)}
            className={`text-xs w-8 h-8 border transition-all ${
              activeSize === size
                ? "border-[#111111] bg-[#111111] text-white"
                : "border-black/10 text-[#666666] hover:border-black/30"
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      {/* Divider */}
      <span className="h-4 w-px bg-black/10" />

      {/* Sort */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs text-[#666666] tracking-[0.1em] uppercase">
          Sort
        </span>
        <select
          value={activeSort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="text-xs text-[#111111] bg-transparent border-none outline-none cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}