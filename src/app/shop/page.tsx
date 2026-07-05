import { db } from "@/lib/db";
import { ProductCard } from "@/components/products/ProductCard";
import { ShopFilters } from "@/components/products/ShopFilters";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop — Shirt Store",
  description: "Browse our collection of premium custom t-shirts.",
};

// Next.js 15: searchParams is a Promise
interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // Await searchParams — required in Next.js 15
  const params = await searchParams;

  const color = typeof params.color === "string" ? params.color : undefined;
  const size = typeof params.size === "string" ? params.size : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "newest";

  const products = await db.product.findMany({
    where: {
      ...(color || size
        ? {
            variants: {
              some: {
                ...(color ? { color: color as "BLACK" | "WHITE" } : {}),
                ...(size
                  ? { size: size as "S" | "M" | "L" | "XL" | "XXL" }
                  : {}),
                stockQuantity: { gt: 0 },
              },
            },
          }
        : {}),
    },
include: { variants: { select: { id: true, color: true, size: true, stockQuantity: true, priceAdjustment: true } } },
    orderBy:
      sort === "price_asc"
        ? { basePrice: "asc" }
        : sort === "price_desc"
        ? { basePrice: "desc" }
        : { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#F5F1EA]">
      {/* Editorial header */}
      <section className="max-w-[1280px] mx-auto px-6 pt-24 pb-12">
        <span className="text-xs text-[#666666] tracking-[0.2em] uppercase">
          All Products
        </span>
        <h1 className="font-['Inter_Tight'] text-5xl md:text-6xl font-bold text-[#111111] leading-none tracking-tight mt-2">
          The Collection
        </h1>
        <div className="flex items-end justify-between mt-6">
          <p className="text-sm text-[#666666] max-w-sm leading-relaxed">
            Black and white. Front and back. Your design or ours.
          </p>
          <p className="text-xs text-[#666666] hidden md:block">
            {products.length} {products.length === 1 ? "style" : "styles"}
          </p>
        </div>
      </section>

      {/* Filters — Suspense required for useSearchParams */}
      <section className="max-w-[1280px] mx-auto px-6">
        <Suspense fallback={<div className="h-12 animate-pulse bg-[#EEE7DD] rounded" />}>
          <ShopFilters />
        </Suspense>
      </section>

      {/* Product grid */}
      <section className="max-w-[1280px] mx-auto px-6 py-12">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <p className="text-[#111111] text-lg font-medium">
              No styles match your filters
            </p>
            <p className="text-[#666666] text-sm">
              Try removing a filter to see more.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {products.map((product) => (
              <ProductCard 
                key={product.id}
                id={product.id} name={product.name} slug={product.slug}
                basePrice={product.basePrice} thumbnail={product.thumbnail}
                variants={product.variants} isCustomizable={product.isCustomizable}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}