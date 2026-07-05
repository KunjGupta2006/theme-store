import { db } from "@/lib/db";
import type { Metadata } from "next";
import { StoreSettingsForm } from "@/components/admin/StoreSettingsForm";

export const metadata: Metadata = { title: "Settings — Admin" };

export default async function SettingsPage() {
  const settings = await db.storeSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", customShirtBasePrice: 150, printChargePerSide: 15 },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-['Inter_Tight'] text-3xl font-bold text-[#111111]">Settings</h1>
        <p className="text-sm text-[#666] mt-1">Configure pricing for customizable plain shirts.</p>
      </div>

      <div className="bg-[#FAF7F2] border border-black/[0.06] rounded overflow-hidden">
        <div className="px-6 py-4 border-b border-black/[0.06]">
          <h2 className="text-sm font-medium text-[#111111]">Custom Shirt Pricing</h2>
        </div>
        <StoreSettingsForm settings={settings} />
      </div>

      <p className="text-xs text-[#999]">
        These prices apply only to products marked &quot;Customizable&quot; in the studio — final price is
        Base + (Print Charge U+0078 sides printed). Fixed-price template products keep their own Base Price
        and are unaffected by this.
      </p>
    </div>
  );
}