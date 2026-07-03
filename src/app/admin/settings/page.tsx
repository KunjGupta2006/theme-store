import { getStoreSettings } from "@/lib/settings";
import { updateStoreSettings } from "@/features/admin/actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings — Admin" };

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-['Inter_Tight'] text-3xl font-bold text-[#111111]">Settings</h1>
        <p className="text-sm text-[#666666] mt-1">Store-wide pricing for custom plain-printed shirts</p>
      </div>

      <form action={updateStoreSettings} className="bg-[#FAF7F2] border border-black/6 rounded p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs text-[#666666] tracking-widest uppercase">Base Price (₹)</label>
          <input
            name="customShirtBasePrice"
            type="number"
            required
            min={0}
            step={0.01}
            defaultValue={settings.customShirtBasePrice}
            className="w-full bg-white border border-black/8 px-4 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors rounded"
          />
          <p className="text-[11px] text-[#666666]">Price of a plain shirt before any print is added.</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-[#666666] tracking-widest uppercase">Print Charge Per Side (₹)</label>
          <input
            name="printChargePerSide"
            type="number"
            required
            min={0}
            step={0.01}
            defaultValue={settings.printChargePerSide}
            className="w-full bg-white border border-black/8 px-4 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors rounded"
          />
          <p className="text-[11px] text-[#666666]">Added once per side (front/back) that has a design.</p>
        </div>
        <div className="pt-2 text-xs text-[#666666] bg-white border border-black/8 rounded p-3">
          Example: front + back print = {settings.customShirtBasePrice} + 2 × {settings.printChargePerSide} = ₹
          {settings.customShirtBasePrice + 2 * settings.printChargePerSide}
        </div>
        <button
          type="submit"
          className="bg-[#111111] text-white text-xs tracking-widest uppercase px-6 py-3 hover:opacity-80 transition-opacity"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}
