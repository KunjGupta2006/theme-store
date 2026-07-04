import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductOptions } from "@/components/products/ProductOptions";
import { ProductCard } from "@/components/products/ProductCard";
import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/settings";
import { ProductGallery } from "@/components/products/ProductGallery";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return { title: "Not Found" };
  return {
    title: `${product.name} — Shirt Store`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

const product = await db.product.findUnique({
  where: { slug },
  include: {
    variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
    images: { orderBy: { position: "asc" } },
  },

});
if (!product) notFound();

const galleryImages = [
  ...(product.thumbnail ? [product.thumbnail] : []),
  ...((product.images as { url: string }[]) ?? []).map((img) => img.url),
];

const [related, settings] = await Promise.all([
  db.product.findMany({
    where: { id: { not: product.id } },
    take: 3,
    include: { variants: { select: { id: true, color: true, size: true, stockQuantity: true, priceAdjustment: true } } },
  }),
  getStoreSettings(),
]);
  return (
    <main className="min-h-screen bg-[#F5F1EA]">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-6">
        <div className="flex items-center gap-2 text-xs text-[#666666]">
          <Link href="/" className="hover:text-[#111111] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#111111] transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="text-[#111111]">{product.name}</span>
        </div>
      </div>

      {/* Product section */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Images */}

          <ProductGallery images={galleryImages} name={product.name} />

          {/* Product info */}
          <div className="lg:pt-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-['Inter_Tight'] text-3xl font-bold text-[#111111] leading-tight">
                {product.name}
              </h1>
              <p className="text-sm text-[#666666] mt-3 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Options (client component) */}
            <ProductOptions
                productId={product.id}
                name={product.name}          
                slug={product.slug}
                thumbnail={product.thumbnail}
                basePrice={product.basePrice}
                variants={product.variants}
                isCustomizable={product.isCustomizable}
                customShirtBasePrice={settings.customShirtBasePrice}
            />

            {/* Product details */}
            <div className="mt-10 pt-8 border-t border-black/8 space-y-4">
              <h3 className="text-xs text-[#666666] tracking-[0.15em] uppercase">
                Product Details
              </h3>
              <ul className="space-y-2">
                {[
                  "Premium combed cotton",
                  "Pre-shrunk fabric",
                  "Reinforced collar and seams",
                  "Print-ready surface",
                  "Machine washable",
                ].map((detail) => (
                  <li key={detail} className="flex items-center gap-2 text-sm text-[#666666]">
                    <span className="w-1 h-1 rounded-full bg-[#666666] shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            {/* Shipping info */}
            <div className="mt-6 pt-6 border-t border-black/8">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Production", value: "3–5 business days" },
                  { label: "Shipping", value: "2–4 business days" },
                  { label: "Returns", value: "Custom items final sale" },
                  { label: "Support", value: "help@shirtstore.com" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[10px] text-[#666666] tracking-widest uppercase">
                      {item.label}
                    </p>
                    <p className="text-sm text-[#111111] mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="border-t border-black/8 pt-16">
            <h2 className="font-['Inter_Tight'] text-2xl font-bold text-[#111111] mb-10">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {related.map((p) => (
              <ProductCard
                key={product.id}
                id={product.id} name={product.name} slug={product.slug}
                basePrice={product.basePrice} thumbnail={product.thumbnail}
                variants={product.variants} isCustomizable={product.isCustomizable}
              />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}