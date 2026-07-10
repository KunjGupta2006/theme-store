"use client";

import { useCartStore } from "@/store/cart";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
    useCartStore();

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-100 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-[#FAF7F2] z-50 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between z-1000 px-6 py-5 border-b border-black/8">
          <h2 className="font-['Inter_Tight'] text-lg font-bold text-[#111111]">
            Cart ({items.length})
          </h2>
          <button
            onClick={closeCart}
            className="text-[#666666] hover:text-[#111111] transition-colors"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <p className="text-[#111111] font-medium">Your cart is empty</p>
              <p className="text-sm text-[#666666]">
                Add something from the shop.
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="text-xs tracking-widest uppercase border border-[#111111] px-6 py-3 hover:bg-[#111111] hover:text-white transition-all"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 pb-4 border-b border-black/6"
              >
                {/* Image */}
                <div className="w-20 h-20 bg-[#EEE7DD] shrink-0 relative overflow-hidden">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : item.customDesignUrl ? (
                    <Image
                      src={item.customDesignUrl}
                      alt="Custom design"
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#111111] truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#666666] mt-0.5">
                    {item.color} · {item.size}
                  </p>
                  {item.customDesignId && (
                    <p className="text-xs text-[#666666]">Custom design</p>
                  )}
                  <p className="text-sm font-medium text-[#111111] mt-1">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>

                  {/* Quantity + Remove */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-black/10">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-[#666666] hover:text-[#111111]"
                      >
                        −
                      </button>
                      <span className="w-7 h-7 flex items-center justify-center text-xs font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-[#666666] hover:text-[#111111]"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-[#666666] hover:text-red-500 transition-colors underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-black/8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#666666]">Subtotal</span>
              <span className="font-['Inter_Tight'] text-lg font-bold text-[#111111]">
                ₹{totalPrice().toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-xs text-[#666666]">
              Shipping calculated at checkout
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-[#111111] text-white text-xs tracking-widest uppercase text-center py-4 hover:opacity-80 transition-opacity"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={closeCart}
              className="block w-full text-xs text-[#666666] hover:text-[#111111] transition-colors text-center"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}