import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { webhookRateLimiter } from "@/lib/rate-limit";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!webhookRateLimiter.check(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature || !env.RAZORPAY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Configuration error or no signature" }, { status: 400 });
  }

  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  if (expected !== signature) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  const event = JSON.parse(body);
  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const order = await db.order.findUnique({ where: { razorpayOrderId: payment.order_id }, include: { items: true } });

    if (order) {
      await db.$transaction(async (tx) => {
        // Atomic claim: only proceeds if THIS call is the one that flips
        // paymentStatus from non-PAID to PAID. If /api/checkout/verify (client
        // callback) already won the race, count is 0 and we skip the decrement
        // entirely — prevents double-decrementing stock when both the client
        // handler and this webhook fire for the same payment.
        const result = await tx.order.updateMany({
          where: { id: order.id, paymentStatus: { not: "PAID" } },
          data: { paymentStatus: "PAID", razorpayPaymentId: payment.id },
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
    }
  } else if (event.event === "payment.failed") {
    const payment = event.payload.payment.entity;
    const order = await db.order.findUnique({ where: { razorpayOrderId: payment.order_id } });

    // Only downgrade a still-pending order. Never overwrite an order that's
    // already PAID (e.g. a late/retried failed-webhook arriving after the
    // client-side verify already confirmed success).
    if (order && order.paymentStatus === "PENDING") {
      await db.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } });
    }
  }

  return NextResponse.json({ received: true });
}