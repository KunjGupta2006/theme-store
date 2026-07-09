"use client";

import { useState, useMemo } from "react";
import { ProductImageGallery } from "@/components/products/ProductImageGallery";
import { ProductOptions } from "@/components/products/ProductOptions";

type Size = "S" | "M" | "L" | "XL" | "XXL";
interface Variant { id: string; size: Size; color: string; stockQuantity: number; priceAdjustment: number; }
interface ProductColorInfo { name: string; hex: string; frontMockup?: string | null; backMockup?: string | null; }
interface ProductImage { id: string; url: string; position: number; colorName: string | null; }
interface Product {
  id: string; name: string; slug: string; description: string; basePrice: number;
  thumbnail: string | null; isFeatured: boolean; isCustomizable: boolean;
  variants: Variant[]; colors: ProductColorInfo[]; images: ProductImage[];
}

export function ProductDetailClient({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? "");

  const galleryImages = useMemo(() => {
    const colorImages = product.images.filter((img) => img.colorName === selectedColor);
    if (colorImages.length > 0) return colorImages.map((i) => i.url);
    const colorEntry = product.colors.find((c) => c.name === selectedColor);
    const mockups = [colorEntry?.frontMockup, colorEntry?.backMockup].filter(Boolean) as string[];
    if (mockups.length > 0) return mockups;
    return product.thumbnail ? [product.thumbnail] : [];
  }, [selectedColor, product]);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16 md:pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        <ProductImageGallery images={galleryImages} name={product.name} />
        <div className="lg:pt-4">
          <div className="mb-6">
            {product.isCustomizable && (
              <span className="inline-block text-[10px] tracking-widest uppercase bg-[#EEE7DD] text-[#666] px-2 py-0.5 rounded mb-3">
                Customizable
              </span>
            )}
            <h1 className="font-['Inter_Tight'] text-3xl md:text-4xl font-bold text-[#111111] leading-tight">
              {product.name}
            </h1>
            <p className="text-sm text-[#666666] mt-3 leading-relaxed">{product.description}</p>
          </div>
          <ProductOptions
            productId={product.id}
            name={product.name}
            slug={product.slug}
            thumbnail={product.thumbnail}
            basePrice={product.basePrice}
            colors={product.colors}
            variants={product.variants}
            isCustomizable={product.isCustomizable}
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
          />
          <div className="mt-8 pt-6 border-t border-black/8 space-y-4">
            <h3 className="text-[10px] text-[#999] tracking-widest uppercase">Product Details</h3>
            <ul className="space-y-2">
              {["220gsm combed cotton", "Pre-shrunk fabric", "Reinforced collar & seams", "Print-ready surface", "Machine washable, 30°C"].map((d) => (
                <li key={d} className="flex items-center gap-2 text-sm text-[#666]">
                  <span className="w-1 h-1 rounded-full bg-[#999] shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 pt-6 border-t border-black/8 grid grid-cols-2 gap-4">
            {[["Production", "3\u20135 business days"], ["Shipping", "2\u20134 business days"], ["Returns", "Custom items final sale"], ["Support", "help@atelier.in"]].map(([k, v]) => (
              <div key={k}>
                <p className="text-[10px] text-[#999] tracking-widest uppercase">{k}</p>
                <p className="text-sm text-[#111111] mt-0.5">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
