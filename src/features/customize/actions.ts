"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { uploadImage } from "@/lib/cloudinary";

interface SaveDesignInput {
  productId: string;
  templateId?: string;
  uploadedImageUrl?: string;
  frontDesignUrl?: string;
  backDesignUrl?: string;
  selectedColor: "BLACK" | "WHITE";
  selectedSize: "S" | "M" | "L" | "XL" | "XXL";
}

export async function saveDesign(input: SaveDesignInput) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");
  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/sign-in");

  const design = await db.customDesign.create({
    data: {
      userId: user.id,
      productId: input.productId,
      uploadedImageUrl: input.uploadedImageUrl ?? null,
      frontDesignUrl: input.frontDesignUrl ?? null,
      backDesignUrl: input.backDesignUrl ?? null,
      selectedColor: input.selectedColor,
      selectedSize: input.selectedSize,
    },
  });
  return { designId: design.id };
}

/**
 * Uploads a design image (user upload or exported canvas) to Cloudinary.
 * Kept as the same name/signature the customize UI already calls.
 */
export async function uploadToCloudinary(base64: string): Promise<string> {
  return uploadImage(base64, "custom-designs");
}
