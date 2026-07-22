import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { checkoutRateLimiter } from "@/lib/rate-limit";
import { env } from "@/lib/env";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { z } from "zod";

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!checkoutRateLimiter.check(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verifySchema.parse(body);

    const expected = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
    }

    const order = await db.order.findUnique({ where: { razorpayOrderId: razorpay_order_id }, include: { user: true, items: true } });
    if (!order || order.user.clerkId !== clerkId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await db.$transaction(async (tx) => {
      // Atomic claim, mirrors the webhook route. Only proceeds if THIS call
      // is the one that flips paymentStatus from non-PAID to PAID. If the
      // webhook already won the race, count is 0 and we skip the decrement —
      // prevents double-decrementing stock when both fire for the same payment.
      const result = await tx.order.updateMany({
        where: { id: order.id, paymentStatus: { not: "PAID" } },
        data: { paymentStatus: "PAID", razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature },
      });

      if (result.count > 0) {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stockQuantity: { decrement: item.quantity } },
            });
          }
        }
      }
    });

    // Fire-and-forget: send order confirmation email
    const orderWithProducts = await db.order.findUnique({
      where: { id: order.id },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: { select: { name: true } },
            variant: { select: { color: true, size: true } },
            customDesign: { select: { selectedColor: true, selectedSize: true } },
          },
        },
      },
    });
    if (orderWithProducts) {
      sendOrderConfirmationEmail({
        customerName: orderWithProducts.user.name,
        customerEmail: orderWithProducts.user.email,
        orderId: orderWithProducts.id,
        items: orderWithProducts.items.map((item) => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          color: item.customDesign?.selectedColor || item.variant?.color || undefined,
          size: item.customDesign?.selectedSize || item.variant?.size || undefined,
          isCustom: !!item.customDesignId,
        })),
        subtotal: orderWithProducts.subtotal,
        totalAmount: orderWithProducts.totalAmount,
        shippingAddress: orderWithProducts.shippingAddress,
      }).catch((err) => console.error("[email] background send failed:", err));
    }

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error("verify failed:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}