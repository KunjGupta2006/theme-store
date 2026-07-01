// src/data/products.ts

import { Product, TemplateDesign } from "@/types";

export const products: Product[] = [
  {
    id: "prod-001",
    name: "Essential Tee",
    slug: "essential-tee",
    description:
      "Our signature heavyweight cotton tee. 220gsm premium fabric with a relaxed fit that drapes perfectly. Double-stitched seams for durability.",
    basePrice: 899,
    thumbnail: "/products/essential-black.png",
    isFeatured: true,
    variants: [
      { id: "v-001", productId: "prod-001", size: "S", color: "BLACK", stockQuantity: 24, priceAdjustment: 0 },
      { id: "v-002", productId: "prod-001", size: "M", color: "BLACK", stockQuantity: 48, priceAdjustment: 0 },
      { id: "v-003", productId: "prod-001", size: "L", color: "BLACK", stockQuantity: 36, priceAdjustment: 0 },
      { id: "v-004", productId: "prod-001", size: "XL", color: "BLACK", stockQuantity: 18, priceAdjustment: 0 },
      { id: "v-005", productId: "prod-001", size: "XXL", color: "BLACK", stockQuantity: 8, priceAdjustment: 50 },
      { id: "v-006", productId: "prod-001", size: "S", color: "WHITE", stockQuantity: 20, priceAdjustment: 0 },
      { id: "v-007", productId: "prod-001", size: "M", color: "WHITE", stockQuantity: 42, priceAdjustment: 0 },
      { id: "v-008", productId: "prod-001", size: "L", color: "WHITE", stockQuantity: 30, priceAdjustment: 0 },
      { id: "v-009", productId: "prod-001", size: "XL", color: "WHITE", stockQuantity: 15, priceAdjustment: 0 },
      { id: "v-010", productId: "prod-001", size: "XXL", color: "WHITE", stockQuantity: 6, priceAdjustment: 50 },
    ],
  },
  {
    id: "prod-002",
    name: "Oversized Tee",
    slug: "oversized-tee",
    description:
      "A modern oversized silhouette with dropped shoulders and extended length. 240gsm cotton for substantial weight and structure.",
    basePrice: 1099,
    thumbnail: "/products/oversized-white.png",
    isFeatured: true,
    variants: [
      { id: "v-011", productId: "prod-002", size: "S", color: "BLACK", stockQuantity: 15, priceAdjustment: 0 },
      { id: "v-012", productId: "prod-002", size: "M", color: "BLACK", stockQuantity: 30, priceAdjustment: 0 },
      { id: "v-013", productId: "prod-002", size: "L", color: "BLACK", stockQuantity: 25, priceAdjustment: 0 },
      { id: "v-014", productId: "prod-002", size: "XL", color: "BLACK", stockQuantity: 20, priceAdjustment: 0 },
      { id: "v-015", productId: "prod-002", size: "XXL", color: "BLACK", stockQuantity: 10, priceAdjustment: 50 },
      { id: "v-016", productId: "prod-002", size: "S", color: "WHITE", stockQuantity: 12, priceAdjustment: 0 },
      { id: "v-017", productId: "prod-002", size: "M", color: "WHITE", stockQuantity: 28, priceAdjustment: 0 },
      { id: "v-018", productId: "prod-002", size: "L", color: "WHITE", stockQuantity: 22, priceAdjustment: 0 },
      { id: "v-019", productId: "prod-002", size: "XL", color: "WHITE", stockQuantity: 16, priceAdjustment: 0 },
      { id: "v-020", productId: "prod-002", size: "XXL", color: "WHITE", stockQuantity: 8, priceAdjustment: 50 },
    ],
  },
  {
    id: "prod-003",
    name: "Fitted Tee",
    slug: "fitted-tee",
    description:
      "Tailored fit with side seams for a clean, structured look. 200gsm fine-gauge cotton with a smooth hand feel.",
    basePrice: 949,
    thumbnail: "/products/fitted-black.png",
    isFeatured: false,
    variants: [
      { id: "v-021", productId: "prod-003", size: "S", color: "BLACK", stockQuantity: 30, priceAdjustment: 0 },
      { id: "v-022", productId: "prod-003", size: "M", color: "BLACK", stockQuantity: 45, priceAdjustment: 0 },
      { id: "v-023", productId: "prod-003", size: "L", color: "BLACK", stockQuantity: 35, priceAdjustment: 0 },
      { id: "v-024", productId: "prod-003", size: "XL", color: "BLACK", stockQuantity: 20, priceAdjustment: 0 },
      { id: "v-025", productId: "prod-003", size: "S", color: "WHITE", stockQuantity: 25, priceAdjustment: 0 },
      { id: "v-026", productId: "prod-003", size: "M", color: "WHITE", stockQuantity: 40, priceAdjustment: 0 },
      { id: "v-027", productId: "prod-003", size: "L", color: "WHITE", stockQuantity: 30, priceAdjustment: 0 },
      { id: "v-028", productId: "prod-003", size: "XL", color: "WHITE", stockQuantity: 18, priceAdjustment: 0 },
    ],
  },
  {
    id: "prod-004",
    name: "Boxy Tee",
    slug: "boxy-tee",
    description:
      "A square-cut silhouette inspired by vintage workwear. Roomy through the body with a straight hem. 230gsm cotton.",
    basePrice: 999,
    thumbnail: "/products/boxy-white.png",
    isFeatured: true,
    variants: [
      { id: "v-029", productId: "prod-004", size: "S", color: "BLACK", stockQuantity: 18, priceAdjustment: 0 },
      { id: "v-030", productId: "prod-004", size: "M", color: "BLACK", stockQuantity: 32, priceAdjustment: 0 },
      { id: "v-031", productId: "prod-004", size: "L", color: "BLACK", stockQuantity: 28, priceAdjustment: 0 },
      { id: "v-032", productId: "prod-004", size: "XL", color: "BLACK", stockQuantity: 14, priceAdjustment: 0 },
      { id: "v-033", productId: "prod-004", size: "S", color: "WHITE", stockQuantity: 16, priceAdjustment: 0 },
      { id: "v-034", productId: "prod-004", size: "M", color: "WHITE", stockQuantity: 30, priceAdjustment: 0 },
      { id: "v-035", productId: "prod-004", size: "L", color: "WHITE", stockQuantity: 24, priceAdjustment: 0 },
      { id: "v-036", productId: "prod-004", size: "XL", color: "WHITE", stockQuantity: 12, priceAdjustment: 0 },
    ],
  },
  {
    id: "prod-005",
    name: "Heavyweight Tee",
    slug: "heavyweight-tee",
    description:
      "Our heaviest fabric at 280gsm. Substantial, structured, and built to last. Pre-shrunk for consistent fit wash after wash.",
    basePrice: 1299,
    thumbnail: "/products/heavy-black.png",
    isFeatured: false,
    variants: [
      { id: "v-037", productId: "prod-005", size: "S", color: "BLACK", stockQuantity: 10, priceAdjustment: 0 },
      { id: "v-038", productId: "prod-005", size: "M", color: "BLACK", stockQuantity: 22, priceAdjustment: 0 },
      { id: "v-039", productId: "prod-005", size: "L", color: "BLACK", stockQuantity: 18, priceAdjustment: 0 },
      { id: "v-040", productId: "prod-005", size: "XL", color: "BLACK", stockQuantity: 12, priceAdjustment: 0 },
      { id: "v-041", productId: "prod-005", size: "XXL", color: "BLACK", stockQuantity: 5, priceAdjustment: 50 },
      { id: "v-042", productId: "prod-005", size: "S", color: "WHITE", stockQuantity: 8, priceAdjustment: 0 },
      { id: "v-043", productId: "prod-005", size: "M", color: "WHITE", stockQuantity: 20, priceAdjustment: 0 },
      { id: "v-044", productId: "prod-005", size: "L", color: "WHITE", stockQuantity: 15, priceAdjustment: 0 },
      { id: "v-045", productId: "prod-005", size: "XL", color: "WHITE", stockQuantity: 10, priceAdjustment: 0 },
      { id: "v-046", productId: "prod-005", size: "XXL", color: "WHITE", stockQuantity: 4, priceAdjustment: 50 },
    ],
  },
  {
    id: "prod-006",
    name: "Pocket Tee",
    slug: "pocket-tee",
    description:
      "Classic pocket tee with a clean chest pocket detail. 210gsm cotton with a slightly relaxed fit. A wardrobe staple, elevated.",
    basePrice: 979,
    thumbnail: "/products/pocket-white.png",
    isFeatured: false,
    variants: [
      { id: "v-047", productId: "prod-006", size: "S", color: "BLACK", stockQuantity: 20, priceAdjustment: 0 },
      { id: "v-048", productId: "prod-006", size: "M", color: "BLACK", stockQuantity: 35, priceAdjustment: 0 },
      { id: "v-049", productId: "prod-006", size: "L", color: "BLACK", stockQuantity: 28, priceAdjustment: 0 },
      { id: "v-050", productId: "prod-006", size: "XL", color: "BLACK", stockQuantity: 15, priceAdjustment: 0 },
      { id: "v-051", productId: "prod-006", size: "S", color: "WHITE", stockQuantity: 18, priceAdjustment: 0 },
      { id: "v-052", productId: "prod-006", size: "M", color: "WHITE", stockQuantity: 32, priceAdjustment: 0 },
      { id: "v-053", productId: "prod-006", size: "L", color: "WHITE", stockQuantity: 25, priceAdjustment: 0 },
      { id: "v-054", productId: "prod-006", size: "XL", color: "WHITE", stockQuantity: 12, priceAdjustment: 0 },
    ],
  },
];

export const templates: TemplateDesign[] = [
  { id: "tpl-001", name: "Abstract Lines", imageUrl: "/templates/abstract-lines.png", category: "Abstract" },
  { id: "tpl-002", name: "Mountain Range", imageUrl: "/templates/mountain.png", category: "Minimal" },
  { id: "tpl-003", name: "Bold Statement", imageUrl: "/templates/bold-text.png", category: "Typography" },
  { id: "tpl-004", name: "Geometric Shape", imageUrl: "/templates/geometric.png", category: "Graphic" },
  { id: "tpl-005", name: "Wave Pattern", imageUrl: "/templates/wave.png", category: "Abstract" },
  { id: "tpl-006", name: "Streetwear Logo", imageUrl: "/templates/streetwear.png", category: "Streetwear" },
  { id: "tpl-007", name: "Minimal Line Art", imageUrl: "/templates/line-art.png", category: "Minimal" },
  { id: "tpl-008", name: "Vintage Type", imageUrl: "/templates/vintage-type.png", category: "Typography" },
];

export const templateCategories = ["All", "Minimal", "Typography", "Graphic", "Abstract", "Streetwear"] as const;