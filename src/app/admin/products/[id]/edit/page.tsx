import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EditProductForm } from "@/components/admin/EditProductForm";
import { MultiImageUploadField } from "@/components/admin/MultiImageUploadField";
import { ProductVariantManager } from "@/components/admin/ProductVariantManager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Product — Admin" };

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
      images: { orderBy: { position: "asc" } },
      colors: { orderBy: { position: "asc" } },
    },
  });
  if (!product) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-sm text-[#666666] hover:text-[#111111] transition-colors">
          ← Products
        </Link>
        <span className="text-[#666666]">/</span>
        <h1 className="font-['Inter_Tight'] text-2xl font-bold text-[#111111]">Edit Product</h1>
      </div>

      <EditProductForm product={product} />

      <div className="bg-[#FAF7F2] border border-black/6 rounded p-6">
        <MultiImageUploadField productId={product.id} images={product.images} />
      </div>

      <ProductVariantManager
        variants={product.variants}
        colors={product.colors}
        productId={product.id}
      />
    </div>
  );
}