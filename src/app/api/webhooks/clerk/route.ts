// theme-store/src/app/api/webhooks/clerk/route.ts

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  console.log("🔔 Webhook received");

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  console.log("🔐 Secret exists:", !!WEBHOOK_SECRET);

  if (!WEBHOOK_SECRET) {
    console.error("❌ CLERK_WEBHOOK_SECRET is not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("❌ Missing svix headers", { svix_id, svix_timestamp, svix_signature });
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();
  console.log("📦 Body length:", body.length);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    console.log("✅ Signature verified, event type:", evt.type);
  } catch (err) {
    console.error("❌ Signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    console.log("👤 Creating user:", { id, email: email_addresses[0]?.email_address });

    try {
      await db.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0].email_address,
          name: `${first_name ?? ""} ${last_name ?? ""}`.trim() || email_addresses[0].email_address.split("@")[0],
          imageUrl: image_url ?? null,
        },
      });
      console.log("✅ User saved to database");
    } catch (dbErr) {
      console.error("❌ Database save failed:", dbErr);
      return new Response("DB error", { status: 500 });
    }
  }

  return new Response("OK", { status: 200 });
}