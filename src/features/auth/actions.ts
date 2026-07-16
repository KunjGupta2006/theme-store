"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return false;
  const user = await db.user.findUnique({
    where: { clerkId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}
