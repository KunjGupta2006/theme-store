import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { updateOrderStatus } from "@/features/admin/actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order Detail — Admin" };

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  PROCESSING: "bg-yellow-100 text-yellow-800",
  PRINTING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, imageUrl: true } },
      items: {
        include: {
          product: { select: { name: true, thumbnail: true } },
        },
      },
    },
  });

  if (!order) notFound();

  const updateAction = updateOrderStatus.bind(null, order.id);

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/orders"
          className="text-sm text-[#666666] hover:text-[#111111] transition-colors"
        >
          ← Orders
        </Link>
        <span className="text-[#666666]">/</span>
        <h1 className="font-['Inter_Tight'] text-2xl font-bold text-[#111111]">
          #{order.id.slice(0, 8)}
        </h1>
        <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.orderStatus]}`}>
          {order.orderStatus}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Customer */}
        <div className="bg-[#FAF7F2] border border-black/6 rounded p-5">
          <h2 className="text-xs text-[#666666] tracking-widest uppercase mb-3">
            Customer
          </h2>
          <p className="text-sm font-medium text-[#111111]">{order.user.name}</p>
          <p className="text-xs text-[#666666] mt-0.5">{order.user.email}</p>
        </div>

        {/* Shipping */}
        <div className="bg-[#FAF7F2] border border-black/6 rounded p-5">
          <h2 className="text-xs text-[#666666] tracking-widest uppercase mb-3">
            Shipping Address
          </h2>
          <p className="text-sm text-[#111111] whitespace-pre-line">
            {order.shippingAddress}
          </p>
          {order.trackingId && (
            <p className="text-xs text-[#666666] mt-2">
              Tracking: <span className="font-mono">{order.trackingId}</span>
            </p>
          )}
        </div>

        {/* Payment */}
        <div className="bg-[#FAF7F2] border border-black/6 rounded p-5">
          <h2 className="text-xs text-[#666666] tracking-widest uppercase mb-3">
            Payment
          </h2>
          <p className="text-sm text-[#111111]">
            Status:{" "}
            <span className="font-medium">{order.paymentStatus}</span>
          </p>
          <p className="text-sm text-[#111111] mt-1">
            Subtotal:{" "}
            <span className="font-medium">
              ₹{order.subtotal.toLocaleString("en-IN")}
            </span>
          </p>
          <p className="text-sm text-[#111111] mt-1">
            Total:{" "}
            <span className="font-bold">
              ₹{order.totalAmount.toLocaleString("en-IN")}
            </span>
          </p>
        </div>

        {/* Update status */}
        <div className="bg-[#FAF7F2] border border-black/6 rounded p-5">
          <h2 className="text-xs text-[#666666] tracking-widest uppercase mb-3">
            Update Status
          </h2>
          <form action={updateAction} className="space-y-3">
            <select
              name="orderStatus"
              defaultValue={order.orderStatus}
              className="w-full bg-white border border-black/[0.08] px-3 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors rounded"
            >
              {["PROCESSING", "PRINTING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input
              name="trackingId"
              placeholder="Tracking ID (optional)"
              defaultValue={order.trackingId ?? ""}
              className="w-full bg-white border border-black/[0.08] px-3 py-2 text-sm text-[#111111] placeholder:text-[#999] focus:outline-none focus:border-[#111111] transition-colors rounded"
            />
            <button
              type="submit"
              className="w-full bg-[#111111] text-white text-xs tracking-widest uppercase py-2.5 hover:opacity-80 transition-opacity"
            >
              Update Order
            </button>
          </form>
        </div>
      </div>

      {/* Order items */}
      <div className="bg-[#FAF7F2] border border-black/6 rounded overflow-hidden">
        <div className="px-6 py-4 border-b border-black/6">
          <h2 className="text-sm font-medium text-[#111111]">
            Items ({order.items.length})
          </h2>
        </div>
        <div className="divide-y divide-black/[0.04]">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-6 py-4">
              <div className="w-12 h-12 bg-[#EEE7DD] rounded overflow-hidden shrink-0">
                {item.product.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.product.thumbnail}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111111] truncate">
                  {item.product.name}
                </p>
                <p className="text-xs text-[#666666] mt-0.5">
                  Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                </p>
              </div>
              <p className="text-sm font-medium text-[#111111] shrink-0">
                ₹{(item.quantity * item.price).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}