"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

interface ActionResult {
  error?: string;
  success?: boolean;
}

// --- Guard -------------------------------------------------------------
async function requireAdmin() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");
  const user = await db.user.findUnique({ where: { clerkId }, select: { role: true } });
  if (!user || user.role !== "ADMIN") redirect("/");
}

// --- Products ----------------------------------------------------------
export async function createProduct(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const basePrice = parseFloat(formData.get("basePrice") as string);
    const thumbnail = (formData.get("thumbnail") as string) || null;
    const isFeatured = formData.get("isFeatured") === "true";
    const isCustomizable = formData.get("isCustomizable") === "true";

    let colors: { name: string; hex: string; frontMockup?: string | null; backMockup?: string | null }[] = [];
    try {
      colors = JSON.parse((formData.get("colorsJson") as string) || "[]");
    } catch {
      return { error: "Invalid color data" };
    }

    if (!name) return { error: "Product name is required" };
    if (!description) return { error: "Description is required" };
    if (!Number.isFinite(basePrice) || basePrice <= 0) return { error: "Enter a valid base price" };
    if (colors.length === 0) return { error: "Add at least one color" };

    const names = colors.map((c) => c.name.trim().toLowerCase());
    if (new Set(names).size !== names.length) return { error: "Color names must be unique" };

    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (!slug) return { error: "Product name must contain at least one letter or number" };

    const existing = await db.product.findUnique({ where: { slug }, select: { id: true } });
    if (existing) return { error: "A product with this name already exists" };

    const product = await db.product.create({
      data: { name, slug, description, basePrice, thumbnail, isFeatured, isCustomizable },
    });

    await db.productColor.createMany({
      data: colors.map((c, i) => ({
        productId: product.id,
        name: c.name.trim(),
        hex: c.hex || "#111111",
        frontMockup: c.frontMockup || null,
        backMockup: c.backMockup || null,
        position: i,
      })),
    });

    const sizes = ["S", "M", "L", "XL", "XXL"] as const;
    await db.productVariant.createMany({
      data: sizes.flatMap((size) =>
        colors.map((c) => ({ productId: product.id, size, color: c.name.trim(), stockQuantity: 0, priceAdjustment: 0 }))
      ),
    });

    revalidatePath("/admin/products");
  } catch (err) {
    console.error("createProduct failed:", err);
    return { error: "Failed to create product. Please try again." };
  }
  redirect("/admin/products");
}

export async function updateProduct(id: string, _prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const basePrice = parseFloat(formData.get("basePrice") as string);
    const thumbnail = (formData.get("thumbnail") as string) || null;
    const isFeatured = formData.get("isFeatured") === "true";
    const isCustomizable = formData.get("isCustomizable") === "true";

    let colors: { name: string; hex: string; frontMockup?: string | null; backMockup?: string | null }[] = [];
    try {
      colors = JSON.parse((formData.get("colorsJson") as string) || "[]");
    } catch {
      return { error: "Invalid color data" };
    }

    if (!name) return { error: "Product name is required" };
    if (!description) return { error: "Description is required" };
    if (!Number.isFinite(basePrice) || basePrice <= 0) return { error: "Enter a valid base price" };
    if (colors.length === 0) return { error: "Add at least one color" };

    const trimmedNames = colors.map((c) => c.name.trim());
    if (new Set(trimmedNames.map((n) => n.toLowerCase())).size !== trimmedNames.length) {
      return { error: "Color names must be unique" };
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const existing = await db.product.findUnique({ where: { slug }, select: { id: true } });
    if (existing && existing.id !== id) return { error: "A product with this name already exists" };

    await db.product.update({
      where: { id },
      data: { name, slug, description, basePrice, thumbnail, isFeatured, isCustomizable },
    });

    await db.productColor.deleteMany({ where: { productId: id, name: { notIn: trimmedNames } } });
    for (const [i, c] of colors.entries()) {
      await db.productColor.upsert({
        where: { productId_name: { productId: id, name: c.name.trim() } },
        update: { hex: c.hex || "#111111", frontMockup: c.frontMockup || null, backMockup: c.backMockup || null, position: i },
        create: { productId: id, name: c.name.trim(), hex: c.hex || "#111111", frontMockup: c.frontMockup || null, backMockup: c.backMockup || null, position: i },
      });
    }

    await db.productVariant.deleteMany({ where: { productId: id, color: { notIn: trimmedNames } } });
    const sizes = ["S", "M", "L", "XL", "XXL"] as const;
    for (const size of sizes) {
      for (const c of colors) {
        const color = c.name.trim();
        await db.productVariant.upsert({
          where: { productId_size_color: { productId: id, size, color } },
          update: {},
          create: { productId: id, size, color, stockQuantity: 0, priceAdjustment: 0 },
        });
      }
    }

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}/edit`);
    revalidatePath(`/shop/${slug}`);
  } catch (err) {
    console.error("updateProduct failed:", err);
    return { error: "Failed to update product. Please try again." };
  }
  redirect("/admin/products");
}
export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.productVariant.deleteMany({ where: { productId: id } });
    await db.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return {};
  } catch (err) {
    console.error("deleteProduct failed:", err);
    return { error: "Failed to delete product. It may have existing orders attached to it." };
  }
}

export async function updateVariantStock(variantId: string, formData: FormData): Promise<ActionResult> {
  try {
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
    return {};
  } catch (err) {
    console.error("updateVariantStock failed:", err);
    return { error: "Failed to update stock." };
  }
}

export async function addProductVariant(productId: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const size = formData.get("size") as string;
    const color = formData.get("color") as string;
    const stockQuantity = parseInt(formData.get("stockQuantity") as string, 10);
    const priceAdjustment = parseFloat(formData.get("priceAdjustment") as string);

    if (!size) return { error: "Size is required" };
    if (!color) return { error: "Color is required" };

    const validSizes = ["S", "M", "L", "XL", "XXL"];
    if (!validSizes.includes(size)) return { error: "Invalid size" };

    const existing = await db.productVariant.findUnique({
      where: { productId_size_color: { productId, size: size as any, color } },
    });
    if (existing) return { error: "A variant with this size and color already exists" };

    await db.productVariant.create({
      data: {
        productId,
        size: size as any,
        color,
        stockQuantity: Number.isFinite(stockQuantity) ? stockQuantity : 0,
        priceAdjustment: Number.isFinite(priceAdjustment) ? priceAdjustment : 0,
      },
    });

    revalidatePath(`/admin/products/${productId}/edit`);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err) {
    console.error("addProductVariant failed:", err);
    return { error: "Failed to add variant." };
  }
}

export async function deleteProductVariant(variantId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const variant = await db.productVariant.delete({ where: { id: variantId } });
    revalidatePath(`/admin/products/${variant.productId}/edit`);
    revalidatePath("/admin/products");
    return {};
  } catch (err) {
    console.error("deleteProductVariant failed:", err);
    return { error: "Failed to delete variant. It may be referenced in existing orders." };
  }
}

export async function addProductImages(productId: string, urls: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    const existingCount = await db.productImage.count({ where: { productId } });
    await db.productImage.createMany({
      data: urls.map((url, i) => ({ productId, url, position: existingCount + i })),
    });
    const product = await db.product.findUnique({ where: { id: productId }, select: { slug: true } });
    revalidatePath(`/admin/products/${productId}/edit`);
    if (product) revalidatePath(`/shop/${product.slug}`);
    return {};
  } catch (err) {
    console.error("addProductImages failed:", err);
    return { error: "Failed to save gallery images." };
  }
}

export async function deleteProductImage(imageId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const image = await db.productImage.delete({ where: { id: imageId } });
    const product = await db.product.findUnique({ where: { id: image.productId }, select: { slug: true } });
    revalidatePath(`/admin/products/${image.productId}/edit`);
    if (product) revalidatePath(`/shop/${product.slug}`);
    return {};
  } catch (err) {
    console.error("deleteProductImage failed:", err);
    return { error: "Failed to remove image." };
  }
}

// --- Orders ------------------------------------------------------------
export async function updateOrderStatus(orderId: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const orderStatus = formData.get("orderStatus") as string;
    const trackingId = (formData.get("trackingId") as string) || null;
    await db.order.update({
      where: { id: orderId },
      data: {
        orderStatus: orderStatus as "PROCESSING" | "PRINTING" | "SHIPPED" | "DELIVERED" | "CANCELLED",
        ...(trackingId ? { trackingId } : {}),
      },
    });
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    return {};
  } catch (err) {
    console.error("updateOrderStatus failed:", err);
    return { error: "Failed to update order status." };
  }
}

// --- Users -------------------------------------------------------------
export async function updateUserRole(userId: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const role = formData.get("role") as "USER" | "ADMIN";
    await db.user.update({ where: { id: userId }, data: { role } });
    revalidatePath("/admin/users");
    return {};
  } catch (err) {
    console.error("updateUserRole failed:", err);
    return { error: "Failed to update user role." };
  }
}

// --- Store settings (pricing) -----------------------------------------
export async function updateStoreSettings(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const customShirtBasePrice = parseFloat(formData.get("customShirtBasePrice") as string);
    const printChargePerSide = parseFloat(formData.get("printChargePerSide") as string);

    if (!Number.isFinite(customShirtBasePrice) || customShirtBasePrice < 0) {
      return { error: "Enter a valid custom shirt base price." };
    }
    if (!Number.isFinite(printChargePerSide) || printChargePerSide < 0) {
      return { error: "Enter a valid print charge." };
    }

    await db.storeSettings.upsert({
      where: { id: "singleton" },
      update: { customShirtBasePrice, printChargePerSide },
      create: { id: "singleton", customShirtBasePrice, printChargePerSide },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/customize");
    return { success: true };
  } catch (err) {
    console.error("updateStoreSettings failed:", err);
    return { error: "Failed to save settings." };
  }
}