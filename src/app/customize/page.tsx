import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { DesignEditor } from "@/components/customize/DesignEditor";
import { getStoreSettings } from "@/lib/settings";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Customize Your Shirt" };

interface CustomizePageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function CustomizePage({ searchParams }: CustomizePageProps) {
  const params = await searchParams;
  const productId = params.product;
  const initialColor = (params.color as "BLACK" | "WHITE") ?? "BLACK";
  const initialSize = params.size as string | undefined;
  if (!productId) redirect("/shop");

const [product, settings] = await Promise.all([
    db.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          where: { stockQuantity: { gt: 0 } },
          select: { id: true, size: true, color: true, stockQuantity: true, priceAdjustment: true },
        },
      },
    }),
    getStoreSettings(),
  ]);
  if (!product) notFound();

  return (
    <main className="min-h-screen bg-[#F5F1EA]">
      <DesignEditor
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          basePrice: product.basePrice,
          thumbnail: product.thumbnail,
          isCustomizable: product.isCustomizable,
          variants: product.variants,
        }}
        initialColor={initialColor}
        initialSize={initialSize}
        pricing={{
          customShirtBasePrice: settings.customShirtBasePrice,
          printChargePerSide: settings.printChargePerSide,
        }}
      />
    </main>
  );
}
