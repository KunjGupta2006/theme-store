import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ProductOptions } from "@/components/products/ProductOptions";
import { ProductCard } from "@/components/products/ProductCard";
import type { Metadata } from "next";

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
      variants: {
        orderBy: [{ color: "asc" }, { size: "asc" }],
      },
    },
  });

  if (!product) notFound();

  // Related products — same featured status, exclude current
  const related = await db.product.findMany({
    where: {
      id: { not: product.id },
    },
    take: 3,
    include: {
      variants: {
        select: { color: true },
        distinct: ["color"],
      },
    },
  });

  return (
    <main className="min-h-screen bg-[#F5F1EA]">
      {/* Breadcrumb */}
      <div className="max-w-[1280px] mx-auto px-6 pt-24 pb-6">
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
      <section className="max-w-[1280px] mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Images */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-[4/5] bg-[#EEE7DD] overflow-hidden">
              {product.thumbnail ? (
                <Image
                  src={product.thumbnail}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#999999] text-sm">
                  No image
                </div>
              )}
            </div>

            {/* Thumbnail row — placeholder for multiple images later */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`aspect-square bg-[#EEE7DD] overflow-hidden cursor-pointer ${
                    i === 1 ? "ring-1 ring-[#111111]" : "opacity-50 hover:opacity-80 transition-opacity"
                  }`}
                >
                  {product.thumbnail && (
                    <Image
                      src={product.thumbnail}
                      alt={`${product.name} view ${i}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

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
            />

            {/* Product details */}
            <div className="mt-10 pt-8 border-t border-black/[0.08] space-y-4">
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
            <div className="mt-6 pt-6 border-t border-black/[0.08]">
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
        <section className="max-w-[1280px] mx-auto px-6 pb-24">
          <div className="border-t border-black/[0.08] pt-16">
            <h2 className="font-['Inter_Tight'] text-2xl font-bold text-[#111111] mb-10">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  basePrice={p.basePrice}
                  thumbnail={p.thumbnail}
                  colors={p.variants.map((v) => v.color)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}