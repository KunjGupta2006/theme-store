"use server";

import { db } from "@/lib/db";
import { getRazorpay } from "@/lib/razorpay";
import { auth } from "@clerk/nextjs/server";
import { addressSchema } from "@/lib/validations";
import { getStoreSettings } from "@/lib/settings";

interface CheckoutItem { variantId: string; quantity: number; customDesignId?: string; }
interface AddressInput { fullName: string; phone: string; addressLine1: string; addressLine2?: string; city: string; state: string; pincode: string; }
interface CreateOrderResult { error?: string; orderId?: string; razorpayOrderId?: string; amount?: number; }

export async function createRazorpayOrder(items: CheckoutItem[], address: AddressInput): Promise<CreateOrderResult> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { error: "Please sign in to checkout" };
    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return { error: "User not found" };
    if (items.length === 0) return { error: "Cart is empty" };

    const mappedAddress = {
      name: address.fullName,
      phone: address.phone,
      address: address.addressLine1,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    };

    const parsedAddress = addressSchema.safeParse(mappedAddress);
    if (!parsedAddress.success) return { error: parsedAddress.error.errors[0].message };
    const validAddress = parsedAddress.data;

    let subtotal = 0;
    const validated: { variantId: string; productId: string; quantity: number; price: number; customDesignId?: string }[] = [];

    for (const item of items) {
      const variant = await db.productVariant.findUnique({ where: { id: item.variantId }, include: { product: true } });
      if (!variant) return { error: "One of the items in your cart no longer exists" };
      if (variant.stockQuantity < item.quantity) return { error: `${variant.product.name} (${variant.color}, ${variant.size}) is out of stock` };
      const price = variant.product.basePrice + variant.priceAdjustment;
      subtotal += price * item.quantity;
      validated.push({ variantId: variant.id, productId: variant.productId, quantity: item.quantity, price, customDesignId: item.customDesignId });
    }

    const settings = await getStoreSettings();
    const shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFlatRate;
    const totalAmount = subtotal + shipping;
    const shippingAddress = `${validAddress.name}\n${validAddress.address}${address.addressLine2 ? ", " + address.addressLine2 : ""}\n${validAddress.city}, ${validAddress.state} ${validAddress.pincode}\nPhone: ${validAddress.phone}`;

    const order = await db.order.create({
      data: {
        userId: user.id,
        subtotal,
        totalAmount,
        shippingAddress,
        customerName: validAddress.name,
        customerPhone: validAddress.phone,
        items: { create: validated.map((v) => ({ productId: v.productId, variantId: v.variantId, quantity: v.quantity, price: v.price, customDesignId: v.customDesignId })) },
      },
    });

    const razorpayOrder = await getRazorpay().orders.create({ amount: Math.round(totalAmount * 100), currency: "INR", receipt: order.id });
    await db.order.update({ where: { id: order.id }, data: { razorpayOrderId: razorpayOrder.id } });

    return { orderId: order.id, razorpayOrderId: razorpayOrder.id, amount: totalAmount };
  } catch (err) {
    console.error("createRazorpayOrder failed:", err);
    return { error: "Failed to create order. Please try again." };
  }
}

export async function getOrderForOwner(orderId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: {
        include: {
          product: true,
          variant: true,
          // Needed so the confirmation page can preview the printed design,
          // not just the plain product thumbnail.
          customDesign: { select: { frontDesignUrl: true, backDesignUrl: true, uploadedImageUrl: true } },
        },
      },
    },
  });
  if (!order || order.user.clerkId !== clerkId) return null;
  return order;
}