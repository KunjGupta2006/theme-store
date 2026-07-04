import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureConfigured() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, " +
        "and CLOUDINARY_API_SECRET in your .env (from your Cloudinary dashboard → API Keys)."
    );
  }
  if (!configured) {
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    configured = true;
  }
}

/**
 * Uploads a base64 data URL (or a remote/local file path) to Cloudinary.
 * Server-only — never import this from a client component.
 */
export async function uploadImage(
  source: string,
  folder: "custom-designs" | "products" | "templates" = "custom-designs"
): Promise<string> {
  ensureConfigured();
  const result = await cloudinary.uploader.upload(source, {
    folder,
    resource_type: "image",
  });
  return result.secure_url;
}

export async function deleteImage(publicId: string): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId);
}


export const UPLOAD_LIMITS = {
  product: 5 * 1024 * 1024,        // admin product/template images — 5MB
  customDesign: 4.5 * 1024 * 1024, // user-uploaded design artwork — 4.5MB
} as const;

/** Uploads a raw file buffer straight from a multipart/form-data request — no base64 overhead. */
export async function uploadBuffer(
  buffer: Buffer,
  folder: "custom-designs" | "products" | "templates" = "custom-designs"
): Promise<string> {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error("Cloudinary upload failed"));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}