import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";
import path from "node:path";

const db = new PrismaClient();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error(
    "❌ Cloudinary env vars missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET before seeding."
  );
  process.exit(1);
}
cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

const TEMPLATES_DIR = path.join(process.cwd(), "public", "templates");
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
const DEFAULT_TEMPLATE_SHIRT_PRICE = 499; // admin can edit per-product after seeding

const sizes = ["S", "M", "L", "XL", "XXL"] as const;
const colors = ["BLACK", "WHITE"] as const;

function titleCase(filename: string) {
  const base = filename.replace(path.extname(filename), "");
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function slugify(name: string, suffix: string) {
  return `${name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}-${suffix}`;
}

/**
 * Upserts every size/color combo for a product instead of delete+createMany.
 * This is the key fix: ProductVariant.id is a random uuid() default, so any
 * delete+recreate cycle assigns brand-new ids to every variant. Since carts
 * are persisted client-side (zustand -> localStorage) and store variantId,
 * a reseed would silently orphan every cart already in a browser, causing
 * "One of the items in your cart no longer exists" at checkout even though
 * nothing is actually wrong. Upserting on the (productId, size, color)
 * unique constraint keeps existing variant ids stable across reseeds, and
 * only assigns a new id the first time a combo is created.
 */
async function upsertVariants(productId: string, stockPerVariant: number) {
  for (const size of sizes) {
    for (const color of colors) {
      await db.productVariant.upsert({
        where: { productId_size_color: { productId, size, color } },
        update: {}, // preserve any stock/price edits made later via the admin panel
        create: { productId, size, color, stockQuantity: stockPerVariant, priceAdjustment: 0 },
      });
    }
  }
}

async function main() {
  console.log("🌱 Seeding database...");

  // NOTE: we deliberately do NOT deleteMany() products/variants anymore.
  // Deleting and recreating them reassigns random uuids to every variant,
  // which silently invalidates every cart already sitting in a browser's
  // localStorage. Upserting keeps ids (and therefore existing carts) valid.

  // ── Store-wide pricing defaults (base + per-side print charge) ──────
  await db.storeSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", customShirtBasePrice: 150, printChargePerSide: 15 },
  });
  console.log("✅ Store settings ready (₹150 base + ₹15/side)");

  // ── The one customizable plain shirt (priced via StoreSettings) ─────
  const plainShirt = await db.product.upsert({
    where: { slug: "custom-plain-shirt" },
    update: {}, // don't clobber admin edits (price/description/etc.) on reseed
    create: {
      name: "Custom Plain Shirt",
      slug: "custom-plain-shirt",
      description:
        "A blank canvas. Pick a color, then design your own print in the studio — upload art, add text, or paint freehand.",
      basePrice: 150,
      thumbnail: "/mockup/white-front.png",
      isFeatured: true,
      isCustomizable: true,
    },
  });
  await upsertVariants(plainShirt.id, 100);
  console.log("✅ Plain shirt ready");

  // ── Template-design shirts from public/templates ─────────────────────
  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.warn(`⚠️  ${TEMPLATES_DIR} not found — skipping template-design shirts.`);
  } else {
    const files = fs
      .readdirSync(TEMPLATES_DIR)
      .filter((f) => IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase()));

    if (files.length === 0) {
      console.warn("⚠️  No images found in public/templates.");
    }

    for (const file of files) {
      const name = titleCase(file);
      const slug = slugify(name, "tee");
      const filePath = path.join(TEMPLATES_DIR, file);

      const existing = await db.product.findUnique({ where: { slug } });

      // Only upload to Cloudinary + create the product if it doesn't exist yet.
      // Re-uploading on every reseed is wasteful and would also churn the
      // thumbnail URL for no reason.
      if (existing) {
        await upsertVariants(existing.id, 30);
        console.log(`↺  Already exists, variants ensured: ${name} Tee`);
        continue;
      }

      const upload = await cloudinary.uploader.upload(filePath, { folder: "templates" });
      const imageUrl = upload.secure_url;

      const product = await db.product.create({
        data: {
          name: `${name} Tee`,
          slug,
          description: `Pre-printed ${name.toLowerCase()} design on a premium cotton tee.`,
          basePrice: DEFAULT_TEMPLATE_SHIRT_PRICE,
          thumbnail: imageUrl,
          isFeatured: false,
          isCustomizable: false,
        },
      });
      await upsertVariants(product.id, 30);

      console.log(`✅ Created: ${name} Tee`);
    }
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });