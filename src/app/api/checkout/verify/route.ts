import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
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

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error("verify failed:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}