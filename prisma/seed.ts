import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const products = [
  {
    name: "Plain Round Neck Tee",
    slug: "plain-round-neck-tee",
    description:
      "Classic plain round-neck cotton t-shirt. Soft premium fabric with a clean everyday fit. 220gsm heavyweight cotton.",
    basePrice: 249,
    thumbnail: "/plain-white-t-shirt.png",
    isFeatured: true,
  },
  {
    name: "Premium Cotton Tee",
    slug: "premium-cotton-tee",
    description:
      "Minimal plain t-shirt built for comfort and durability. Structured fit with premium cotton texture. 220gsm.",
    basePrice: 229,
    thumbnail: "/plain-black-t-shirt.png",
    isFeatured: true,
  },
  {
    name: "Essential Plain Tee",
    slug: "essential-plain-tee",
    description:
      "Clean everyday plain round-neck t-shirt with soft-touch cotton fabric. 200gsm mid-heavy fabric.",
    basePrice: 199,
    thumbnail: "/plain-white-t-shirt.png",
    isFeatured: true,
  },
  {
    name: "Classic Basic Tee",
    slug: "classic-basic-tee",
    description:
      "Timeless plain t-shirt design with a comfortable regular fit. Made with durable cotton fabric. 210gsm.",
    basePrice: 239,
    thumbnail: "/plain-black-t-shirt.png",
    isFeatured: false,
  },
  {
    name: "Minimal Everyday Tee",
    slug: "minimal-everyday-tee",
    description:
      "Simple premium cotton t-shirt designed for daily wear. Lightweight feel with clean stitching. 200gsm.",
    basePrice: 209,
    thumbnail: "/plain-white-t-shirt.png",
    isFeatured: false,
  },
  {
    name: "Signature Plain Tee",
    slug: "signature-plain-tee",
    description:
      "Premium round-neck plain cotton t-shirt with a modern fit and soft finish. 220gsm cotton.",
    basePrice: 219,
    thumbnail: "/plain-black-t-shirt.png",
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