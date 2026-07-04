import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { uploadBuffer, UPLOAD_LIMITS } from "@/lib/cloudinary";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg" , "image/webp", "image/svg+xml"];

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const folder = (formData.get("folder") as string) || "custom-designs";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only PNG, JPG, WEBP, and SVG files are allowed" },
      { status: 400 }
    );
  }

  if (folder === "products" || folder === "templates") {
    const user = await db.user.findUnique({ where: { clerkId }, select: { role: true } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    if (file.size > UPLOAD_LIMITS.product) {
      return NextResponse.json({ error: "File must be under 5MB" }, { status: 413 });
    }
  } else if (folder === "custom-designs") {
    if (file.size > UPLOAD_LIMITS.customDesign) {
      return NextResponse.json({ error: "File must be under 4.5MB" }, { status: 413 });
    }
  } else {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadBuffer(buffer, folder as "products" | "templates" | "custom-designs");
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed. Double-check CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET in your .env." },
      { status: 500 }
    );
  }
}