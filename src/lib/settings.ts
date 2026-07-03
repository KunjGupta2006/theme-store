import { db } from "@/lib/db";

/**
 * Returns the singleton store settings row, creating it with defaults
 * on first access. Safe to call from anywhere (no admin check) — this
 * only reads pricing, never writes.
 */
export async function getStoreSettings() {
  const settings = await db.storeSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return settings;
}

/**
 * Computes the price for a plain custom-printed shirt given how many
 * sides (front/back) carry a design.
 */
export function computeCustomShirtPrice(
  settings: { customShirtBasePrice: number; printChargePerSide: number },
  sidesPrinted: number
) {
  return settings.customShirtBasePrice + settings.printChargePerSide * sidesPrinted;
}
