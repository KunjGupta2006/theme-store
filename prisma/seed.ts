import { PrismaClient } from "@prisma/client";
import { readdirSync, existsSync } from "fs";
import { join } from "path";

const db = new PrismaClient();

// ─── Products ───────────────────────────────────────────────────────────────
// Plain base tshirts for custom printing (isCustomBase: true)
const CUSTOM_BASE_PRODUCTS = [
  {
    name: "Plain White T-Shirt",
    slug: "plain-white-tshirt",
    description: "Premium 220gsm combed cotton. Pre-shrunk, reinforced collar. The perfect blank canvas for your custom design.",
    basePrice: 150,
    thumbnail: "/mockup/tshirt-white-front.png",
    isFeatured: true,
    isCustomBase: true,
  },
  {
    name: "Plain Black T-Shirt",
    slug: "plain-black-tshirt",
    description: "Premium 220gsm combed cotton. Pre-shrunk, reinforced collar. Deep black fabric built for bold prints.",
    basePrice: 150,
    thumbnail: "/mockup/tshirt-black-front.png",
    isFeatured: true,
    isCustomBase: true,
  },
];

const sizes = ["S", "M", "L", "XL", "XXL"] as const;
const colors = ["BLACK", "WHITE"] as const;


// ─── Templates from public/templates ─────────────────────────────────────────
function getTemplateFiles(): { name: string; imageUrl: string; category: string }[] {
  const templatesDir = join(process.cwd(), "public", "templates");

  if (!existsSync(templatesDir)) {
    console.log("⚠️  public/templates/ folder not found, skipping templates.");
    return [];
  }

  const files = readdirSync(templatesDir).filter((f) =>
    /\.(png|jpg|jpeg|svg|webp)$/i.test(f)
  );

  if (files.length === 0) {
    console.log("⚠️  No image files found in public/templates/, skipping templates.");
    return [];
  }

  // Derive category from filename prefix before first dash/underscore
  // e.g. "streetwear-dragon.png" → category "Streetwear"
  return files.map((file) => {
    const base = file.replace(/\.[^.]+$/, "");
    const parts = base.split(/[-_]/);
    const category =
      parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    const name = parts
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
    return {
      name,
      imageUrl: `/templates/${file}`,
      category,
    };
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding database...\n");

  // Clear in correct FK order
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.cart.deleteMany();
  await db.customDesign.deleteMany();
  await db.productVariant.deleteMany();
  await db.product.deleteMany();
  await db.templateDesign.deleteMany();

  // ── Products ──
  console.log("📦 Creating products...");
  for (const p of CUSTOM_BASE_PRODUCTS) {
    const product = await db.product.create({ data: p });

    // Create all size × color variants
    await db.productVariant.createMany({
      data: sizes.flatMap((size) =>
        colors.map((color) => ({
          productId: product.id,
          size,
          color,
          stockQuantity: 50,
          priceAdjustment: 0,
        }))
      ),
    });

    console.log(`  ✅ ${product.name}`);
  }

  // ── Templates ──
  const templates = getTemplateFiles();
  if (templates.length > 0) {
    console.log(`\n🎨 Seeding ${templates.length} template designs...`);
    for (const t of templates) {
      await db.templateDesign.create({ data: { ...t, isActive: true } });
      console.log(`  ✅ ${t.name} (${t.category})`);
    }
  }

  console.log("\n✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());