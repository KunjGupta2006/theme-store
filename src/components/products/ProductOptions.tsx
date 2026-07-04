"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";

type Color = "BLACK" | "WHITE";
type Size = "S" | "M" | "L" | "XL" | "XXL";
interface Variant { id: string; size: Size; color: Color; stockQuantity: number; priceAdjustment: number; }
interface ProductOptionsProps {
  productId: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  basePrice: number;
  variants: Variant[];
  isCustomizable?: boolean;
  customShirtBasePrice?: number;
}
const SIZE_ORDER: Size[] = ["S", "M", "L", "XL", "XXL"];
const SIZE_CHART: Record<Size, string> = { S: "36–38 in chest", M: "39–41 in chest", L: "42–44 in chest", XL: "45–47 in chest", XXL: "48–50 in chest" };

export function ProductOptions({
  productId, name, slug, thumbnail, basePrice, variants, isCustomizable = false, customShirtBasePrice,
}: ProductOptionsProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [selectedColor, setSelectedColor] = useState<Color>("BLACK");
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const availableColors = [...new Set(variants.map((v) => v.color))];
  const availableSizesForColor = variants.filter((v) => v.color === selectedColor && v.stockQuantity > 0).map((v) => v.size);
  const selectedVariant = variants.find((v) => v.color === selectedColor && v.size === selectedSize);
  const finalPrice = basePrice + (selectedVariant?.priceAdjustment ?? 0);

  const handleAddToCart = () => {
    if (!selectedSize) { setError("Please select a size"); return; }
    if (!selectedVariant || selectedVariant.stockQuantity === 0) { setError("Out of stock"); return; }
    setError(null);
    addItem({ id: selectedVariant.id, productId, name, slug, thumbnail, color: selectedColor, size: selectedSize, price: finalPrice, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const goToStudio = () => {
    router.push(`/customize?product=${productId}&color=${selectedColor}${selectedSize ? `&size=${selectedSize}` : ""}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="font-['Inter_Tight'] text-3xl font-bold text-[#111111]">
          {isCustomizable ? "From " : ""}₹{(isCustomizable ? customShirtBasePrice ?? basePrice : finalPrice).toLocaleString("en-IN")}
        </span>
        <span className="text-sm text-[#666666] ml-2">incl. taxes</span>
        {isCustomizable && <p className="text-xs text-[#666666] mt-1">Final price depends on prints added in the studio.</p>}
      </div>
      {/* Color */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#666666] tracking-[0.15em] uppercase">Color</span>
          <span className="text-xs font-medium text-[#111111]">{selectedColor === "BLACK" ? "Black" : "White"}</span>
        </div>
        <div className="flex gap-3">
          {availableColors.map((color) => (
            <button
              key={color}
              onClick={() => { setSelectedColor(color); setSelectedSize(null); setError(null); }}
              className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color ? "border-[#111111] scale-110" : "border-transparent hover:border-black/20"}`}
              style={{ backgroundColor: color === "BLACK" ? "#111111" : "#ffffff", boxShadow: color === "WHITE" ? "inset 0 0 0 1px rgba(0,0,0,0.12)" : "none" }}
            />
          ))}
        </div>
      </div>
      {/* Size */}
      <div className="space-y-3">
        <div className="flex items-center justify-between relative">
          <span className="text-xs text-[#666666] tracking-[0.15em] uppercase">Size</span>
          <button onClick={() => setShowSizeGuide((v) => !v)} className="text-xs text-[#666666] underline hover:text-[#111111]">Size Guide</button>
          {showSizeGuide && (
            <div className="absolute right-0 top-6 z-10 w-56 bg-[#FAF7F2] border border-black/10 rounded p-4 shadow-lg space-y-1.5">
              {SIZE_ORDER.map((s) => (
                <div key={s} className="flex justify-between text-xs text-[#666666]">
                  <span className="font-medium text-[#111111]">{s}</span><span>{SIZE_CHART[s]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {SIZE_ORDER.map((size) => {
            const available = availableSizesForColor.includes(size);
            return (
              <button
                key={size}
                onClick={() => { if (available) { setSelectedSize(size); setError(null); } }}
                disabled={!available}
                className={`w-12 h-12 text-sm border transition-all ${
                  selectedSize === size ? "border-[#111111] bg-[#111111] text-white" : available ? "border-black/10 text-[#111111] hover:border-[#111111]" : "border-black/5 text-[#CCCCCC] cursor-not-allowed line-through"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex flex-col gap-3 pt-2">
        {isCustomizable ? (
          <button
            onClick={goToStudio}
            className="w-full bg-[#111111] text-white text-xs tracking-[0.15em] uppercase py-4 hover:opacity-80 transition-all"
          >
            Design Your Shirt
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className={`w-full text-xs tracking-[0.15em] uppercase py-4 transition-all ${added ? "bg-green-600 text-white" : "bg-[#111111] text-white hover:opacity-80"}`}
          >
            {added ? "Added to Cart ✓" : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );
}
