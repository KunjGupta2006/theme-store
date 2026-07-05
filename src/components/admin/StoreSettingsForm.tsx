"use client";

import { useActionState, useEffect } from "react";
import { toast } from "@/lib/toast";
import { updateStoreSettings } from "@/features/admin/actions";

interface Settings {
  customShirtBasePrice: number;
  printChargePerSide: number;
}

type ActionState = { error?: string; success?: boolean };
const initialState: ActionState = {};

export function StoreSettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, pending] = useActionState(updateStoreSettings, initialState);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    else if (state?.success) toast.success("Pricing updated");
  }, [state]);

  return (
    <form action={formAction} className="divide-y divide-black/[0.04]">
      <div className="flex items-center gap-4 px-6 py-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#111111]">Custom Shirt Base Price</p>
          <p className="text-[10px] text-[#999] font-mono mt-0.5">customShirtBasePrice</p>
        </div>
        <input
          name="customShirtBasePrice"
          type="number"
          step={0.01}
          min={0}
          defaultValue={settings.customShirtBasePrice}
          className="w-32 bg-white border border-black/[0.08] px-3 py-1.5 text-sm text-center text-[#111111] focus:outline-none focus:border-[#111111] rounded"
        />
      </div>
      <div className="flex items-center gap-4 px-6 py-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#111111]">Print Charge Per Side</p>
          <p className="text-[10px] text-[#999] font-mono mt-0.5">printChargePerSide</p>
        </div>
        <input
          name="printChargePerSide"
          type="number"
          step={0.01}
          min={0}
          defaultValue={settings.printChargePerSide}
          className="w-32 bg-white border border-black/[0.08] px-3 py-1.5 text-sm text-center text-[#111111] focus:outline-none focus:border-[#111111] rounded"
        />
      </div>
      <div className="px-6 py-4">
        <button
          type="submit"
          disabled={pending}
          className="text-xs text-white bg-[#111111] px-5 py-2.5 rounded hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save Pricing"}
        </button>
      </div>
    </form>
  );
}