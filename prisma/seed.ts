import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const products = [
  {
    name: "Structured Heavyweight Tee",
    slug: "structured-heavyweight-tee",
    description:
      "230gsm combed cotton. Pre-shrunk. Reinforced collar. Built to hold its shape through repeated wear.",
    basePrice: 899,
    thumbnail:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    isFeatured: true,
  },
  {
    name: "Relaxed Drop Shoulder Tee",
    slug: "relaxed-drop-shoulder-tee",
    description:
      "Oversized silhouette with a dropped shoulder seam. 200gsm jersey. Lived-in feel from day one.",
    basePrice: 799,
    thumbnail:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
    isFeatured: true,
  },
  {
    name: "Classic Fitted Crew",
    slug: "classic-fitted-crew",
    description:
      "180gsm ringspun cotton. Clean lines, zero distraction. The foundation of any wardrobe.",
    basePrice: 699,
    thumbnail:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
    isFeatured: true,
  },
  {
    name: "Boxy Oversized Tee",
    slug: "boxy-oversized-tee",
    description:
      "Wide box cut. 220gsm cotton-blend. Designed for custom prints — maximum canvas, minimum distraction.",
    basePrice: 849,
    thumbnail:
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80",
    isFeatured: false,
  },
  {
    name: "Slim Tapered Tee",
    slug: "slim-tapered-tee",
    description:
      "Slightly tapered through the waist. 190gsm combed cotton. A cleaner line without being restrictive.",
    basePrice: 749,
    thumbnail:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80",
    isFeatured: false,
  },
  {
    name: "Longline Extended Tee",
    slug: "longline-extended-tee",
    description:
      "Extended hem, 3 inches longer than standard. 210gsm cotton. Works layered or standalone.",
    basePrice: 849,
    thumbnail:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
    isFeatured: false,
  },
];

const sizes = ["S", "M", "L", "XL", "XXL"] as const;
const colors = ["BLACK", "WHITE"] as const;

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing
  await db.productVariant.deleteMany();
  await db.product.deleteMany();

  for (const product of products) {
    const created = await db.product.create({
      data: product,
    });

    const variants = sizes.flatMap((size) =>
      colors.map((color) => ({
        productId: created.id,
        size,
        color,
        stockQuantity: Math.floor(Math.random() * 50) + 10,
        priceAdjustment: 0,
      }))
    );

    await db.productVariant.createMany({ data: variants });

    console.log(`✅ Created: ${product.name}`);
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