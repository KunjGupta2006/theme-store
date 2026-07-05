"use client";

import { useTransition } from "react";
import { toast } from "@/lib/toast";
import { updateOrderStatus } from "@/features/admin/actions";

interface OrderStatusFormProps {
  orderId: string;
  currentStatus: string;
  currentTrackingId: string | null;
}

const STATUSES = ["PROCESSING", "PRINTING", "SHIPPED", "DELIVERED", "CANCELLED"];

export function OrderStatusForm({ orderId, currentStatus, currentTrackingId }: OrderStatusFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, formData);
      if (result?.error) toast.error(result.error);
      else toast.success("Order status updated");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#FAF7F2] border border-black/6 rounded p-6 space-y-4">
      <h2 className="text-sm font-medium text-[#111111]">Update Status</h2>
      <div className="space-y-1.5">
        <label className="text-xs text-[#666666] tracking-widest uppercase">Order Status</label>
        <select
          name="orderStatus"
          defaultValue={currentStatus}
          className="w-full bg-white border border-black/8 px-4 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors rounded"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-[#666666] tracking-widest uppercase">Tracking ID</label>
        <input
          name="trackingId"
          defaultValue={currentTrackingId ?? ""}
          placeholder="Optional"
          className="w-full bg-white border border-black/8 px-4 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors rounded"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="bg-[#111111] text-white text-xs tracking-widest uppercase px-6 py-3 hover:opacity-80 transition-opacity w-full disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}