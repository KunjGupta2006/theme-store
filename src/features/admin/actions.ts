"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/lib/cloudinary";

// ─── Guard ─────────────────────────────────────────────────────────────
async function requireAdmin() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");
  const user = await db.user.findUnique({ where: { clerkId }, select: { role: true } });
  if (!user || user.role !== "ADMIN") redirect("/");
}

// ─── Image uploads (products / templates) ─────────────────────────────
export async function uploadAdminImage(
  base64: string,
  folder: "products" | "templates" = "products"
): Promise<string> {
  await requireAdmin();
  return uploadImage(base64, folder);
}

// ─── Products ──────────────────────────────────────────────────────────
export async function createProduct(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const description = formData.get("description") as string;
  const basePrice = parseFloat(formData.get("basePrice") as string);
  const thumbnail = (formData.get("thumbnail") as string) || null;
  const isFeatured = formData.get("isFeatured") === "true";
  const isCustomizable = formData.get("isCustomizable") === "true";

  const product = await db.product.create({
    data: { name, slug, description, basePrice, thumbnail, isFeatured, isCustomizable },
  });

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
  const isCustomizable = formData.get("isCustomizable") === "true";

  await db.product.update({
    where: { id },
    data: { name, slug, description, basePrice, thumbnail, isFeatured, isCustomizable },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath(`/shop/${slug}`);
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const variants = await db.productVariant.findMany({ where: { productId: id } });
  if (variants.length > 0) {
    await db.productVariant.deleteMany({ where: { productId: id } });
  }
  await db.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function updateVariantStock(variantId: string, formData: FormData) {
  await requireAdmin();
  const stock = parseInt(formData.get("stockQuantity") as string, 10);
  const priceAdjustment = parseFloat(formData.get("priceAdjustment") as string);
  const variant = await db.productVariant.update({
    where: { id: variantId },
    data: {
      stockQuantity: Number.isFinite(stock) ? stock : 0,
      priceAdjustment: Number.isFinite(priceAdjustment) ? priceAdjustment : 0,
    },
  });
  revalidatePath(`/admin/products/${variant.productId}/edit`);
  revalidatePath("/admin/products");
}

// ─── Orders ────────────────────────────────────────────────────────────
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

// ─── Users ─────────────────────────────────────────────────────────────
export async function updateUserRole(userId: string, formData: FormData) {
  await requireAdmin();
  const role = formData.get("role") as "USER" | "ADMIN";
  await db.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

// ─── Store settings (pricing) ─────────────────────────────────────────
export async function updateStoreSettings(formData: FormData) {
  await requireAdmin();
  const customShirtBasePrice = parseFloat(formData.get("customShirtBasePrice") as string);
  const printChargePerSide = parseFloat(formData.get("printChargePerSide") as string);

  await db.storeSettings.upsert({
    where: { id: "singleton" },
    update: { customShirtBasePrice, printChargePerSide },
    create: { id: "singleton", customShirtBasePrice, printChargePerSide },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/customize");
}
