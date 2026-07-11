import { z } from "zod";

// Checkout Address Validation
export const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
});

// Admin Product Validation
export const productVariantSchema = z.object({
  id: z.string().optional(),
  color: z.string().min(1),
  size: z.enum(["S", "M", "L", "XL", "XXL"]),
  stockQuantity: z.number().int().min(0),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  basePrice: z.number().min(0, "Base price must be positive"),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  isActive: z.boolean(),
  variants: z.array(productVariantSchema),
});

// Order Status Update Validation
export const orderStatusSchema = z.object({
  status: z.enum(["PROCESSING", "PRINTING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  trackingId: z.string().optional(),
  carrier: z.string().optional(),
  adminNotes: z.string().optional(),
});
