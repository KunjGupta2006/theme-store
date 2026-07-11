"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

const ORDER_STATUSES = ["ALL", "PROCESSING", "PRINTING", "SHIPPED", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUSES = ["ALL", "PENDING", "PAID", "FAILED"];
const SORTS = [
  { value: "date_desc", label: "Newest first" },
  { value: "date_asc", label: "Oldest first" },
  { value: "amount_desc", label: "Amount: high to low" },
  { value: "amount_asc", label: "Amount: low to high" },
];

export function OrdersFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL" || value === "") params.delete(key);
    else params.set(key, value);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", q);
  }

  const activeFilterCount = ["status", "payment", "q"].filter((k) => searchParams.get(k)).length;

  return (
    <div className="bg-[#FAF7F2] border border-black/6 rounded p-4 flex flex-wrap items-center gap-3">
      <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px]">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order id, customer name, email, phone…"
          className="w-full bg-white border border-black/8 px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors rounded"
        />
      </form>

      <select
        value={searchParams.get("status") ?? "ALL"}
        onChange={(e) => updateParam("status", e.target.value)}
        className="bg-white border border-black/8 px-3 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors rounded"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>{s === "ALL" ? "All statuses" : s}</option>
        ))}
      </select>

      <select
        value={searchParams.get("payment") ?? "ALL"}
        onChange={(e) => updateParam("payment", e.target.value)}
        className="bg-white border border-black/8 px-3 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors rounded"
      >
        {PAYMENT_STATUSES.map((s) => (
          <option key={s} value={s}>{s === "ALL" ? "All payments" : s}</option>
        ))}
      </select>

      <select
        value={searchParams.get("sort") ?? "date_desc"}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="bg-white border border-black/8 px-3 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors rounded"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {activeFilterCount > 0 && (
        <button
          onClick={() => router.push(pathname)}
          className="text-xs text-[#666666] hover:text-red-500 transition-colors underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}