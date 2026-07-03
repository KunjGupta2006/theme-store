// src/types/index.ts

export type Size = "S" | "M" | "L" | "XL" | "XXL";
export type Color = "BLACK" | "WHITE";

export interface Product {
  id: string;
  name: string;
  description: string | null ;
  slug: string;
  basePrice: number;
  thumbnail: string | null;
  isFeatured: boolean;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: Size;
  color: Color;
  stockQuantity: number;
  priceAdjustment: number;
}

export interface TemplateDesign {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
}

export interface DesignPosition {
  x: number;
  y: number;
  scale: number;
}

export interface CustomDesignState {
  productId: string;
  selectedColor: Color;
  selectedSize: Size;
  view: "front" | "back";
  frontDesign: string | null;
  backDesign: string | null;
  frontPosition: DesignPosition;
  backPosition: DesignPosition;
  activeSide: "front" | "back";
}