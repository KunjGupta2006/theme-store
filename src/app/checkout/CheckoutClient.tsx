"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCartStore } from "@/store/cart";
import { toast } from "@/lib/toast";
import { createRazorpayOrder } from "@/features/checkout/actions";

declare global {
  interface Window { Razorpay: new (options: Record<string, unknown>) => { open: () => void }; }
}

export function CheckoutClient() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "",
  });

  const subtotal = totalPrice();
  const shipping = subtotal >= 999 ? 0 : 79;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#F5F1EA] flex flex-col items-center justify-center gap-4">
        <h1 className="font-['Inter_Tight'] text-3xl font-bold text-[#111111]">Your cart is empty</h1>
        <Link href="/shop/" className="mt-4 bg-[#111111] text-white text-xs tracking-widest uppercase px-8 py-4">Browse Shop</Link>
      </main>
    );
  }

  function update<K extends keyof typeof address>(key: K, value: string) {
    setAddress((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.state || !address.pincode) {
      toast.error("Please fill in all required address fields");
      return;
    }
    setLoading(true);
    try {
      const result = await createRazorpayOrder(
        items.map((i) => ({ variantId: i.id, quantity: i.quantity, customDesignId: i.customDesignId })),
        address
      );
      if (result.error || !result.razorpayOrderId) {
        toast.error(result.error || "Failed to start checkout");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(result.amount! * 100),
        currency: "INR",
        name: "Atelier",
        order_id: result.razorpayOrderId,
        prefill: { name: address.fullName, contact: address.phone },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            toast.error(verifyData.error || "Payment verification failed");
            setLoading(false);
            return;
          }
          clearCart();
          router.push(`/checkout/success/${result.orderId}`);
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error("Payment cancelled");
          },
        },
        theme: { color: "#111111" },
      });
      rzp.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <main className="min-h-screen bg-[#F5F1EA]">
        <div className="max-w-[1000px] mx-auto px-6 pt-24 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <form onSubmit={handlePay} className="lg:col-span-2 space-y-4">
            <h1 className="font-['Inter_Tight'] text-3xl font-bold text-[#111111] mb-6">Shipping Address</h1>
            <input required placeholder="Full Name" value={address.fullName} onChange={(e) => update("fullName", e.target.value)} className="w-full bg-white border border-black/8 px-4 py-3 text-sm rounded" />
            <input required placeholder="Phone" value={address.phone} onChange={(e) => update("phone", e.target.value)} className="w-full bg-white border border-black/8 px-4 py-3 text-sm rounded" />
            <input required placeholder="Address Line 1" value={address.addressLine1} onChange={(e) => update("addressLine1", e.target.value)} className="w-full bg-white border border-black/8 px-4 py-3 text-sm rounded" />
            <input placeholder="Address Line 2 (optional)" value={address.addressLine2} onChange={(e) => update("addressLine2", e.target.value)} className="w-full bg-white border border-black/8 px-4 py-3 text-sm rounded" />
            <div className="grid grid-cols-3 gap-3">
              <input required placeholder="City" value={address.city} onChange={(e) => update("city", e.target.value)} className="bg-white border border-black/8 px-4 py-3 text-sm rounded" />
              <input required placeholder="State" value={address.state} onChange={(e) => update("state", e.target.value)} className="bg-white border border-black/8 px-4 py-3 text-sm rounded" />
              <input required placeholder="Pincode" value={address.pincode} onChange={(e) => update("pincode", e.target.value)} className="bg-white border border-black/8 px-4 py-3 text-sm rounded" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#111111] text-white text-xs tracking-widest uppercase py-4 hover:opacity-80 transition-opacity disabled:opacity-50">
              {loading ? "Processing…" : `Pay ₹${total.toLocaleString("en-IN")}`}
            </button>
          </form>

          <div className="bg-[#FAF7F2] border border-black/[0.06] p-6 space-y-3 h-fit sticky top-24">
            <h2 className="font-['Inter_Tight'] text-lg font-bold text-[#111111]">Order Summary</h2>
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-xs text-[#666666]">
                <span>{i.name} ({i.color}, {i.size}) × {i.quantity}</span>
                <span>₹{(i.price * i.quantity).toLocaleString("en-IN")}</span>
              </div>
            ))}
            <div className="border-t border-black/[0.08] pt-3 space-y-1">
              <div className="flex justify-between text-sm text-[#666666]"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between text-sm text-[#666666]"><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
              <div className="flex justify-between font-medium text-[#111111] pt-2"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}