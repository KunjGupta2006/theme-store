"use client";

import { useCartStore } from "@/store/cart";

export function CartButton() {
  const { openCart, totalItems } = useCartStore();
  const count = totalItems();

  return (
    <button
      onClick={openCart}
      className="relative text-[#111111] hover:opacity-70 transition-opacity"
      aria-label="Open cart"
    >
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#111111] text-white text-[10px] rounded-full flex items-center justify-center font-medium">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}