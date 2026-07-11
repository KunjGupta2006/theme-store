import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order — Admin" };

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

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          product: { select: { name: true, thumbnail: true } },
          customDesign: {
            select: { frontDesignUrl: true, backDesignUrl: true, uploadedImageUrl: true, selectedColor: true, selectedSize: true },
          },
        },
      },
    },
  });
  if (!order) notFound();

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-sm text-[#666666] hover:text-[#111111] transition-colors">← Orders</Link>
        <span className="text-[#666666]">/</span>
        <h1 className="font-['Inter_Tight'] text-2xl font-bold text-[#111111]">Order #{order.id.slice(0, 8)}</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#FAF7F2] border border-black/6 rounded overflow-hidden">
          <div className="px-6 py-4 border-b border-black/6"><h2 className="text-sm font-medium text-[#111111]">Items</h2></div>
          <div className="divide-y divide-black/6">
            {order.items.map((item) => {
              // Plain (non-customized) products just show the product thumbnail.
              // Customized products get their own dedicated print section below
              // instead, since the admin needs the actual design file to print —
              // not just the shirt color it's printed on.
              const designImages = [
                item.customDesign?.frontDesignUrl ? { label: "Front", url: item.customDesign.frontDesignUrl } : null,
                item.customDesign?.backDesignUrl ? { label: "Back", url: item.customDesign.backDesignUrl } : null,
                !item.customDesign?.frontDesignUrl && !item.customDesign?.backDesignUrl && item.customDesign?.uploadedImageUrl
                  ? { label: "Uploaded artwork", url: item.customDesign.uploadedImageUrl }
                  : null,
              ].filter((d): d is { label: string; url: string } => d !== null);

              return (
                <div key={item.id} className="px-6 py-4 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-[#EEE7DD] shrink-0 relative overflow-hidden rounded">
                        {item.product.thumbnail && (
                          <Image src={item.product.thumbnail} alt={item.product.name} fill className="object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111111]">{item.product.name}</p>
                        {item.customDesign && (
                          <p className="text-xs text-[#666666] mt-0.5">
                            Custom · {item.customDesign.selectedColor} · Size {item.customDesign.selectedSize}
                          </p>
                        )}
                        <p className="text-xs text-[#666666]">Qty {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-[#111111] shrink-0">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>

                  {designImages.length > 0 && (
                    <div className="flex gap-3 pl-[68px]">
                      {designImages.map((d) => (
                        <a
                          key={d.label}
                          href={d.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block"
                          title={`Open ${d.label.toLowerCase()} design full-size to print`}
                        >
                          <div className="w-24 h-24 bg-white border border-black/10 rounded overflow-hidden relative group-hover:border-black/30 transition-colors">
                            <Image src={d.url} alt={`${item.product.name} — ${d.label} design`} fill className="object-contain" />
                          </div>
                          <p className="text-[10px] text-[#666666] text-center mt-1 group-hover:text-[#111111] transition-colors">
                            {d.label} · Print ↗
                          </p>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="px-6 py-4 border-t border-black/6 space-y-1">
            <div className="flex justify-between text-sm text-[#666666]"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-sm font-medium text-[#111111]"><span>Total</span><span>₹{order.totalAmount.toLocaleString("en-IN")}</span></div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-[#FAF7F2] border border-black/6 rounded p-6 space-y-3">
            <h2 className="text-sm font-medium text-[#111111]">Customer</h2>
            <p className="text-sm text-[#111111]">{order.user.name}</p>
            <p className="text-xs text-[#666666]">{order.user.email}</p>
            <div className="pt-2 border-t border-black/6">
              <p className="text-xs text-[#666666] tracking-widest uppercase mb-1">Shipping Address</p>
              <p className="text-sm text-[#111111] whitespace-pre-line">{order.shippingAddress}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${PAYMENT_COLORS[order.paymentStatus]}`}>{order.paymentStatus}</span>
              <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.orderStatus]}`}>{order.orderStatus}</span>
            </div>
          </div>
          <OrderStatusForm orderId={order.id} currentStatus={order.orderStatus} currentTrackingId={order.trackingId} />
        </div>
      </div>
    </div>
  );
}