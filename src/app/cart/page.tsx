"use client";

import { useCartStore } from "@/store/cart";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } =
    useCartStore();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#F5F1EA] flex flex-col items-center justify-center gap-4">
        <h1 className="font-['Inter_Tight'] text-3xl font-bold text-[#111111]">
          Your cart is empty
        </h1>
        <p className="text-sm text-[#666666]">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/shop"
          className="mt-4 bg-[#111111] text-white text-xs tracking-widest uppercase px-8 py-4 hover:opacity-80 transition-opacity"
        >
          Browse Shop
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F1EA]">
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="font-['Inter_Tight'] text-4xl font-bold text-[#111111]">
            Your Cart
          </h1>
          <button
            onClick={clearCart}
            className="text-xs text-[#666666] hover:text-red-500 transition-colors underline"
          >
            Clear cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-0 divide-y divide-black/6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-6 py-6">
                <div className="w-24 h-24 bg-[#EEE7DD] shrink-0 relative overflow-hidden">
                  {item.thumbnail && (
                    <Image
                      src={item.thumbnail}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/shop/${item.slug}`}
                        className="text-sm font-medium text-[#111111] hover:opacity-70 transition-opacity"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-[#666666] mt-1">
                        {item.color} · Size {item.size}
                      </p>
                      {item.customDesignId && (
                        <p className="text-xs text-[#666666]">
                          Custom design attached
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-bold text-[#111111] shrink-0">
                      {"\u20B9"}{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center border border-black/10">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#666666] hover:text-[#111111]"
                      >
                        −
                      </button>
                      <span className="w-8 h-8 flex items-center justify-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#666666] hover:text-[#111111]"
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
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#FAF7F2] border border-black/6 p-6 space-y-4 sticky top-24">
              <h2 className="font-['Inter_Tight'] text-lg font-bold text-[#111111]">
                Order Summary
              </h2>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm text-[#666666]">
                  <span>Subtotal</span>
                  <span> {"\u20B9"} {totalPrice().toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm text-[#666666]">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-black/8 pt-4 flex justify-between">
                <span className="font-medium text-[#111111]">Total</span>
                  <span className="font-['Inter_Tight'] text-xl font-bold text-[#111111]">
                  {"\u20B9"} {totalPrice().toLocaleString("en-IN")}
                </span>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-[#111111] text-white text-xs tracking-widest uppercase text-center py-4 hover:opacity-80 transition-opacity"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/shop"
                className="block w-full text-xs text-[#666666] hover:text-[#111111] transition-colors text-center"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}