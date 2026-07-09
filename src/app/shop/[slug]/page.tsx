import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductDetailClient } from "@/components/products/ProductDetailClient";
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
      colors: { orderBy: { position: "asc" } },
    },
  });

  if (!product) notFound();

  const related = await db.product.findMany({
    where: { id: { not: product.id } },
    take: 3,
    include: {
      variants: { select: { id: true, color: true, size: true, stockQuantity: true, priceAdjustment: true } },
      colors: { orderBy: { position: "asc" } },
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

      <ProductDetailClient product={product} />

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
                colors={p.colors}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}