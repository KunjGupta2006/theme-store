import { getOrderWithHistoryForUser } from "@/features/account/actions";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Details — Atelier",
};

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderWithHistoryForUser(id);

  if (!order) return notFound();

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#FAF7F2]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-6">
          <Link href="/account" className="text-xs text-[#666666] tracking-widest uppercase hover:text-[#111111] transition-colors">
            ← Back to Account
          </Link>
        </div>

        <div className="bg-white border border-black/8 rounded p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/10 pb-6 mb-6">
            <div>
              <h1 className="font-['Inter_Tight'] text-2xl font-bold tracking-tight text-[#111111] uppercase mb-1">
                Order Details
              </h1>
              <p className="text-sm text-[#666666]">
                Order #{order.id}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs text-[#666666] tracking-widest uppercase mb-1">Date Placed</p>
              <p className="text-sm text-[#111111]">
                {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Tracking / Timeline */}
            <div className="space-y-6">
              <h2 className="text-xs text-[#666666] tracking-widest uppercase mb-4">Tracking</h2>
              
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-black/10">
                {/* Current Status */}
                <div className="relative">
                  <div className="absolute left-[-24px] top-1 w-[9px] h-[9px] rounded-full bg-[#111111] border-2 border-white ring-1 ring-[#111111]" />
                  <p className="text-sm font-medium text-[#111111]">{order.orderStatus}</p>
                  
                  {order.trackingId && order.carrier && (
                    <div className="mt-2 text-sm text-[#666666] bg-[#FAF7F2] p-3 rounded">
                      <p>Shipped via <span className="font-medium text-[#111111]">{order.carrier}</span></p>
                      <p>Tracking Number: <span className="font-medium text-[#111111]">{order.trackingId}</span></p>
                    </div>
                  )}
                </div>

                {/* History */}
                {order.statusHistory.map((history) => (
                  <div key={history.id} className="relative">
                    <div className="absolute left-[-24px] top-1 w-2 h-2 rounded-full bg-white border border-black/20" />
                    <p className="text-sm text-[#666666]">{history.status}</p>
                    <p className="text-xs text-[#999999] mt-0.5">
                      {new Date(history.changedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}

                {/* Initial Placed State */}
                <div className="relative">
                  <div className="absolute left-[-24px] top-1 w-2 h-2 rounded-full bg-white border border-black/20" />
                  <p className="text-sm text-[#666666]">PLACED</p>
                  <p className="text-xs text-[#999999] mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-black/10">
                <h2 className="text-xs text-[#666666] tracking-widest uppercase mb-2">Shipping Address</h2>
                <p className="text-sm text-[#111111] whitespace-pre-line">{order.shippingAddress}</p>
              </div>
            </div>

            {/* Items & Summary */}
            <div>
              <h2 className="text-xs text-[#666666] tracking-widest uppercase mb-4">Items</h2>
              <div className="space-y-4 mb-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-[#FAF7F2] rounded relative shrink-0 border border-black/6">
                      <Image
                        src={item.customDesign?.frontDesignUrl || item.product.thumbnail || ""}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#111111] truncate">{item.product.name}</p>
                      <p className="text-xs text-[#666666] mt-0.5">
                        {item.variant?.color} / {item.variant?.size} {item.customDesign ? " (Custom)" : ""}
                      </p>
                      <p className="text-xs text-[#666666] mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[#111111]">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-black/10 pt-4 space-y-2 text-sm text-[#666666]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{order.totalAmount - order.subtotal === 0 ? "Free" : formatPrice(order.totalAmount - order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#111111] font-medium pt-2 border-t border-black/10">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
