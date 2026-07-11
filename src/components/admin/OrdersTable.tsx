"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "@/lib/toast";
import { bulkUpdateOrderStatus } from "@/features/admin/actions";

export interface OrderRow {
  id: string;
  customerName: string;
  userName: string;
  userEmail: string;
  itemCount: number;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string; // ISO string
}

const STATUS_COLORS: Record<string, string> = {
  PROCESSING: "bg-yellow-100 text-yellow-800",
  PRINTING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};
const PAYMENT_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};
const BULK_STATUSES = ["PROCESSING", "PRINTING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<(typeof BULK_STATUSES)[number]>("PROCESSING");
  const [isPending, startTransition] = useTransition();

  const allSelected = orders.length > 0 && selected.size === orders.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(orders.map((o) => o.id)));
  }
  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function applyBulkUpdate() {
    const ids = Array.from(selected);
    startTransition(async () => {
      const result = await bulkUpdateOrderStatus(ids, bulkStatus);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Updated ${ids.length} ${ids.length === 1 ? "order" : "orders"} to ${bulkStatus}`);
        setSelected(new Set());
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="sticky top-0 z-10 bg-[#111111] text-white rounded px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="text-sm">{selected.size} selected</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value as (typeof BULK_STATUSES)[number])}
            className="bg-white text-[#111111] text-sm px-3 py-1.5 rounded focus:outline-none"
          >
            {BULK_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={applyBulkUpdate}
            disabled={isPending}
            className="bg-white text-[#111111] text-xs tracking-widest uppercase px-4 py-1.5 rounded hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {isPending ? "Applying…" : "Apply"}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-white/70 hover:text-white transition-colors underline ml-auto"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="bg-[#FAF7F2] border border-black/6 rounded overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/6">
              <th className="w-10 px-4 py-4">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-[#111111]" />
              </th>
              {["Order", "Customer", "Items", "Amount", "Payment", "Status", "Date", ""].map((h) => (
                <th key={h} className="text-left text-[10px] text-[#666666] tracking-widest uppercase px-4 py-4 font-normal whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center text-sm text-[#666666] py-12">
                  No orders match these filters.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-black/4 hover:bg-[#EEE7DD]/30 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(order.id)}
                      onChange={() => toggleOne(order.id)}
                      className="accent-[#111111]"
                    />
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-[#666666] whitespace-nowrap">#{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-[#111111]">{order.userName}</p>
                    <p className="text-xs text-[#666666]">{order.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#666666]">{order.itemCount}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#111111] whitespace-nowrap">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium whitespace-nowrap ${PAYMENT_COLORS[order.paymentStatus]}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium whitespace-nowrap ${STATUS_COLORS[order.orderStatus]}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#666666] whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-xs text-[#666666] hover:text-[#111111] transition-colors underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}