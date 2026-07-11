"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getOrdersForUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await db.user.findUnique({
    where: { clerkId },
  });

  if (!user) return null;

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
          customDesign: true,
        },
      },
    },
  });

  return orders;
}

export async function getOrderWithHistoryForUser(orderId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) return null;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
          customDesign: true,
        },
      },
      statusHistory: {
        orderBy: { changedAt: "desc" },
      }
    },
  });

  if (!order || order.userId !== user.id) return null;

  return order;
}
