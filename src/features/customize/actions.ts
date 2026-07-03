"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

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
      templateId: input.templateId ?? null,
      uploadedImageUrl: input.uploadedImageUrl ?? null,
      frontDesignUrl: input.frontDesignUrl ?? null,
      backDesignUrl: input.backDesignUrl ?? null,
      selectedColor: input.selectedColor,
      selectedSize: input.selectedSize,
    },
  });

  return { designId: design.id };
}

export async function uploadToCloudinary(base64: string): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary not configured");
  }

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file: base64,
        upload_preset: uploadPreset,
        folder: "custom-designs",
      }),
    }
  );

  const data = await res.json();
  if (!data.secure_url) throw new Error("Upload failed");
  return data.secure_url as string;
}