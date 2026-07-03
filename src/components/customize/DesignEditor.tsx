"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { saveDesign, uploadToCloudinary } from "@/features/customize/actions";

// Dynamically import Konva to avoid SSR issues
import dynamic from "next/dynamic";
const KonvaEditor = dynamic(() => import("./KonvaEditor"), { ssr: false });

type Color = "BLACK" | "WHITE";
type Size = "S" | "M" | "L" | "XL" | "XXL";
type Side = "front" | "back";

interface Variant {
  id: string;
  size: Size;
  color: Color;
  stockQuantity: number;
  priceAdjustment: number;
}

interface Template {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  thumbnail: string | null;
  variants: Variant[];
}

interface DesignEditorProps {
  product: Product;
  templates: Template[];
  initialColor: Color;
  initialSize?: string;
}

const SIZE_ORDER: Size[] = ["S", "M", "L", "XL", "XXL"];

export function DesignEditor({
  product,
  templates,
  initialColor,
  initialSize,
}: DesignEditorProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [color, setColor] = useState<Color>(initialColor);
  const [size, setSize] = useState<Size | null>(
    SIZE_ORDER.includes(initialSize as Size) ? (initialSize as Size) : null
  );
  const [side, setSide] = useState<Side>("front");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"upload" | "templates">("upload");

  // Design state per side
  const [frontDesign, setFrontDesign] = useState<string | null>(null);
  const [backDesign, setBackDesign] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentDesign = side === "front" ? frontDesign : backDesign;
  const setCurrentDesign = side === "front" ? setFrontDesign : setBackDesign;

  const availableSizes = product.variants
    .filter((v) => v.color === color && v.stockQuantity > 0)
    .map((v) => v.size);

  const selectedVariant = product.variants.find(
    (v) => v.color === color && v.size === size
  );

  const finalPrice = product.basePrice + (selectedVariant?.priceAdjustment ?? 0);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate
      if (file.size > 5 * 1024 * 1024) {
        setError("File must be under 5MB");
        return;
      }
      if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
        setError("Only PNG, JPG, and SVG files allowed");
        return;
      }

      setError(null);
      setUploading(true);

      try {
        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Upload to Cloudinary
        const url = await uploadToCloudinary(base64);
        setCurrentDesign(url);
        setSelectedTemplateId(null);
      } catch {
        setError("Upload failed. Please try again.");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [setCurrentDesign]
  );

  // Select template
  const handleSelectTemplate = (template: Template) => {
    setCurrentDesign(template.imageUrl);
    setSelectedTemplateId(template.id);
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!size) { setError("Please select a size"); return; }
    if (!frontDesign && !backDesign) { setError("Please add a design to at least one side"); return; }
    if (!selectedVariant) { setError("Selected size is out of stock"); return; }

    setError(null);
    setSaving(true);

    try {
      const { designId } = await saveDesign({
        productId: product.id,
        templateId: selectedTemplateId ?? undefined,
        frontDesignUrl: frontDesign ?? undefined,
        backDesignUrl: backDesign ?? undefined,
        selectedColor: color,
        selectedSize: size,
      });

      addItem({
        id: `${selectedVariant.id}-${designId}`,
        productId: product.id,
        name: `Custom ${product.name}`,
        slug: product.slug,
        thumbnail: product.thumbnail,
        color,
        size,
        price: finalPrice,
        quantity,
        customDesignId: designId,
        customDesignUrl: frontDesign ?? backDesign ?? undefined,
      });

      router.push("/cart");
    } catch {
      setError("Failed to save design. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel — Design source */}
      <div className="w-64 bg-[#FAF7F2] border-r border-black/[0.06] flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-black/[0.06]">
          <h2 className="font-['Inter_Tight'] text-base font-bold text-[#111111]">
            Design Source
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-black/[0.06]">
          {(["upload", "templates"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs tracking-widest uppercase transition-colors ${
                activeTab === tab
                  ? "text-[#111111] border-b-2 border-[#111111]"
                  : "text-[#666666] hover:text-[#111111]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "upload" ? (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-black/20 py-8 flex flex-col items-center gap-2 hover:border-black/40 transition-colors rounded"
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-[#666666]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-xs text-[#666666]">
                  {uploading ? "Uploading..." : "Upload Design"}
                </span>
                <span className="text-[10px] text-[#999999]">PNG, JPG, SVG · Max 5MB</span>
              </button>

              {currentDesign && (
                <div className="relative aspect-square bg-[#EEE7DD] rounded overflow-hidden">
                  <Image src={currentDesign} alt="Your design" fill className="object-contain p-2" />
                  <button
                    onClick={() => setCurrentDesign(null)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-xs hover:bg-black"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {templates.length === 0 ? (
                <p className="text-xs text-[#666666] text-center py-8">
                  No templates yet. Admin can add them.
                </p>
              ) : (
                templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTemplate(t)}
                    className={`w-full text-left border rounded overflow-hidden transition-all ${
                      selectedTemplateId === t.id
                        ? "border-[#111111]"
                        : "border-black/10 hover:border-black/30"
                    }`}
                  >
                    <div className="relative aspect-square bg-[#EEE7DD]">
                      <Image src={t.imageUrl} alt={t.name} fill className="object-cover" />
                    </div>
                    <div className="px-2 py-1.5">
                      <p className="text-xs font-medium text-[#111111] truncate">{t.name}</p>
                      <p className="text-[10px] text-[#666666]">{t.category}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center — Canvas */}
      <div className="flex-1 flex flex-col bg-[#F5F1EA] overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-black/[0.06] bg-[#FAF7F2]">
          <div className="flex items-center gap-1 bg-[#EEE7DD] p-1 rounded">
            {(["front", "back"] as Side[]).map((s) => (
              <button
                key={s}
                onClick={() => setSide(s)}
                className={`px-4 py-1.5 text-xs tracking-widest uppercase rounded transition-all ${
                  side === s
                    ? "bg-[#111111] text-white"
                    : "text-[#666666] hover:text-[#111111]"
                }`}
              >
                {s}
                {s === "front" && frontDesign && (
                  <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                )}
                {s === "back" && backDesign && (
                  <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full border ${
                color === "BLACK"
                  ? "bg-[#111111] border-black/20"
                  : "bg-white border-black/20"
              }`}
            />
            <span className="text-xs text-[#666666]">
              {color === "BLACK" ? "Black" : "White"} T-Shirt · {side} view
            </span>
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <KonvaEditor
            color={color}
            side={side}
            designUrl={currentDesign}
            onDesignChange={setCurrentDesign}
          />
        </div>
      </div>

      {/* Right panel — Options */}
      <div className="w-64 bg-[#FAF7F2] border-l border-black/[0.06] flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-black/[0.06]">
          <h2 className="font-['Inter_Tight'] text-base font-bold text-[#111111]">
            {product.name}
          </h2>
          <p className="text-xs text-[#666666] mt-0.5">
            ₹{finalPrice.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Color */}
          <div className="space-y-2">
            <span className="text-xs text-[#666666] tracking-widest uppercase">Shirt Color</span>
            <div className="flex gap-2">
              {(["BLACK", "WHITE"] as Color[]).map((c) => (
                <button
                  key={c}
                  onClick={() => { setColor(c); setSize(null); }}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c ? "border-[#111111] scale-110" : "border-transparent"
                  }`}
                  style={{
                    backgroundColor: c === "BLACK" ? "#111111" : "#ffffff",
                    boxShadow: c === "WHITE" ? "inset 0 0 0 1px rgba(0,0,0,0.15)" : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="space-y-2">
            <span className="text-xs text-[#666666] tracking-widest uppercase">Size</span>
            <div className="grid grid-cols-5 gap-1">
              {SIZE_ORDER.map((s) => {
                const available = availableSizes.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => available && setSize(s)}
                    disabled={!available}
                    className={`h-8 text-xs border transition-all ${
                      size === s
                        ? "border-[#111111] bg-[#111111] text-white"
                        : available
                        ? "border-black/10 text-[#111111] hover:border-[#111111]"
                        : "border-black/05 text-[#CCC] cursor-not-allowed"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <span className="text-xs text-[#666666] tracking-widest uppercase">Quantity</span>
            <div className="flex items-center border border-black/10 w-fit">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 text-[#666666] hover:text-[#111111] flex items-center justify-center">−</button>
              <span className="w-8 h-8 flex items-center justify-center text-sm font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 text-[#666666] hover:text-[#111111] flex items-center justify-center">+</button>
            </div>
          </div>

          {/* Design status */}
          <div className="space-y-1.5">
            <span className="text-xs text-[#666666] tracking-widest uppercase">Design</span>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${frontDesign ? "bg-green-500" : "bg-[#DDD]"}`} />
                <span className={frontDesign ? "text-[#111111]" : "text-[#999]"}>Front {frontDesign ? "✓" : "— not set"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${backDesign ? "bg-green-500" : "bg-[#DDD]"}`} />
                <span className={backDesign ? "text-[#111111]" : "text-[#999]"}>Back {backDesign ? "✓" : "— optional"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-black/[0.06] space-y-3">
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={handleAddToCart}
            disabled={saving}
            className="w-full bg-[#111111] text-white text-xs tracking-widest uppercase py-4 hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add to Cart"}
          </button>
          <p className="text-[10px] text-[#999] text-center">
            Design preview before shipping
          </p>
        </div>
      </div>
    </div>
  );
}