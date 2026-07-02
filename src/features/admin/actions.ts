"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// ─── Guard ──────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");
  const user = await db.user.findUnique({ where: { clerkId }, select: { role: true } });
  if (!user || user.role !== "ADMIN") redirect("/");
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const description = formData.get("description") as string;
  const basePrice = parseFloat(formData.get("basePrice") as string);
  const thumbnail = (formData.get("thumbnail") as string) || null;
  const isFeatured = formData.get("isFeatured") === "true";

  const product = await db.product.create({
    data: { name, slug, description, basePrice, thumbnail, isFeatured },
  });

  // Create all size/color variants with 0 stock by default
  const sizes = ["S", "M", "L", "XL", "XXL"] as const;
  const colors = ["BLACK", "WHITE"] as const;

  await db.productVariant.createMany({
    data: sizes.flatMap((size) =>
      colors.map((color) => ({
        productId: product.id,
        size,
        color,
        stockQuantity: 0,
        priceAdjustment: 0,
      }))
    ),
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const description = formData.get("description") as string;
  const basePrice = parseFloat(formData.get("basePrice") as string);
  const thumbnail = (formData.get("thumbnail") as string) || null;
  const isFeatured = formData.get("isFeatured") === "true";

  await db.product.update({
    where: { id },
    data: { name, slug, description, basePrice, thumbnail, isFeatured },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/shop/${slug}`);
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireAdmin();

  // Delete related records first
  const variants = await db.productVariant.findMany({ where: { productId: id } });
  if (variants.length > 0) {
    await db.productVariant.deleteMany({ where: { productId: id } });
  }

  await db.product.delete({ where: { id } });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function updateVariantStock(variantId: string, stock: number) {
  await requireAdmin();
  await db.productVariant.update({
    where: { id: variantId },
    data: { stockQuantity: stock },
  });
  revalidatePath("/admin/products");
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function updateOrderStatus(orderId: string, formData: FormData) {
  await requireAdmin();

  const orderStatus = formData.get("orderStatus") as string;
  const trackingId = (formData.get("trackingId") as string) || null;

  await db.order.update({
    where: { id: orderId },
    data: {
      orderStatus: orderStatus as
        | "PROCESSING"
        | "PRINTING"
        | "SHIPPED"
        | "DELIVERED"
        | "CANCELLED",
      ...(trackingId ? { trackingId } : {}),
    },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}