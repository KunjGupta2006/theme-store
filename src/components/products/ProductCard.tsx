"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/store/cart";

type Size = "S" | "M" | "L" | "XL" | "XXL";
interface Variant { id: string; size: Size; color: string; stockQuantity: number; priceAdjustment: number; }
interface ProductColorInfo { name: string; hex: string; }
interface ProductCardProps {
  id: string; name: string; slug: string; basePrice: number;
  thumbnail: string | null; variants: Variant[]; isCustomizable: boolean;
  colors: ProductColorInfo[];
}

export function ProductCard({ id, name, slug, basePrice, thumbnail, variants, isCustomizable, colors }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const inStock = variants.filter((v) => v.stockQuantity > 0);

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const variant = inStock[0]; // picks the first in-stock size — see note below
    if (!variant) return;
    addItem({
      id: variant.id, productId: id, name, slug, thumbnail,
      color: variant.color, size: variant.size,
      price: basePrice + variant.priceAdjustment, quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <Link href={`/shop/${slug}`} className="group block">
      <div className="relative overflow-hidden bg-[#EEE7DD] aspect-4/5 mb-4">
        {thumbnail ? (
          <Image src={thumbnail} alt={name} fill
            sizes="(max-width: 768px) 100vw 100vh, (max-width: 1200px) 50vw 60vh, 33vw 40vh"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#666666] text-sm">No image</div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
        <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          {isCustomizable ? (
            <div className="bg-[#111111] text-white text-xs tracking-[0.15em] uppercase text-center py-3 px-4">
              Customize This Design
            </div>
          ) : (
            <button
              onClick={handleQuickAdd}
              disabled={inStock.length === 0}
              className={`w-full text-xs tracking-[0.15em] uppercase text-center py-3 px-4 transition-colors ${
                added ? "bg-green-600 text-white"
                  : inStock.length === 0 ? "bg-black/40 text-white cursor-not-allowed"
                  : "bg-[#111111] text-white hover:opacity-90"
              }`}
            >
              {inStock.length === 0 ? "Out of Stock" : added ? "Added ✓" : "Add to Cart"}
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-[#111111] leading-snug group-hover:opacity-70 transition-opacity duration-200">
            {name}
          </h3>

          {/* Color dots */}
          {colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {colors.slice(0, 4).map((c) => (
                <span key={c.name} className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} title={c.name} />
              ))}
              {colors.length > 4 && (
                <span className="text-[10px] text-[#999] font-medium ml-0.5">+{colors.length - 4}</span>
              )}
            </div>
          )}
        </div>

        <p className="text-sm text-[#111111] font-medium shrink-0">
          ₹{basePrice.toLocaleString("en-IN")}
        </p>
      </div>
    </Link>
  );
}