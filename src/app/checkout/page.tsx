import type { Metadata } from "next";
import { CheckoutClient } from "./CheckoutClient";
import { getStoreSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Checkout — Atelier" };

export default async function CheckoutPage() {
  const settings = await getStoreSettings();
  return <CheckoutClient shippingFlatRate={settings.shippingFlatRate} freeShippingThreshold={settings.freeShippingThreshold} />;
}