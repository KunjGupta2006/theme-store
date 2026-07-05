import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductOptions } from "@/components/products/ProductOptions";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductImageGallery } from "@/components/products/ProductImageGallery";
import type { Metadata } from "next";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await db.product.findUnique({ where: { slug } });
  return p ? { title: `${p.name} — Atelier`, description: p.description } : { title: "Not Found" };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
      images: { orderBy: { position: "asc" } },
    },
  });

  if (!product) notFound();

  // Build gallery: thumbnail first, then any admin-uploaded gallery images
  const galleryUrls: string[] = [
    ...(product.thumbnail ? [product.thumbnail] : []),
    ...product.images.map((img) => img.url),
  ];

  const related = await db.product.findMany({
    where: { id: { not: product.id } },
    take: 3,
    include: {
      variants: { select: { id: true, color: true, size: true, stockQuantity: true, priceAdjustment: true } },
    },
  });

  return (
    <main className="min-h-screen bg-[#F5F1EA]">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-4">
        <div className="flex items-center gap-2 text-[11px] text-[#999]">
          <Link href="/" className="hover:text-[#111111] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#111111] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-[#111111]">{product.name}</span>
        </div>
      </div>

      {/* Product */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery */}
          <ProductImageGallery images={galleryUrls} name={product.name} />

          {/* Info */}
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
              variants={product.variants}
              isCustomizable={product.isCustomizable}
            />

            {/* Details */}
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
              {[["Production","3U+002d5 business days"],["Shipping","2U+002d4 business days"],["Returns","Custom items final sale"],["Support","help@atelier.in"]].map(([k,v]) => (
                <div key={k}>
                  <p className="text-[10px] text-[#999] tracking-widest uppercase">{k}</p>
                  <p className="text-sm text-[#111111] mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 pb-24 border-t border-black/8 pt-16">
          <h2 className="font-['Inter_Tight'] text-2xl font-bold text-[#111111] mb-10">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {related.map((p) => (
              <ProductCard
                key={p.id} id={p.id} name={p.name} slug={p.slug}
                basePrice={p.basePrice} thumbnail={p.thumbnail}
                variants={p.variants} isCustomizable={p.isCustomizable}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}