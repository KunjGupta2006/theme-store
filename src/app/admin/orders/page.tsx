import { db } from "@/lib/db";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Orders — Admin" };

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

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Inter_Tight'] text-3xl font-bold text-[#111111]">
          Orders
        </h1>
        <p className="text-sm text-[#666666] mt-1">
          {orders.length} {orders.length === 1 ? "order" : "orders"} total
        </p>
      </div>

      <div className="bg-[#FAF7F2] border border-black/6 rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/6">
              {["Order", "Customer", "Items", "Amount", "Payment", "Status", "Date", ""].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] text-[#666666] tracking-widest uppercase px-4 py-4 font-normal"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-sm text-[#666666] py-12">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-black/4 hover:bg-[#EEE7DD]/30 transition-colors"
                >
                  <td className="px-4 py-3 text-xs font-mono text-[#666666]">
                    #{order.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-[#111111]">{order.user.name}</p>
                    <p className="text-xs text-[#666666]">{order.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#666666]">
                    {order._count.items}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[#111111]">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${PAYMENT_COLORS[order.paymentStatus]}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.orderStatus]}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#666666]">
                    {order.createdAt.toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-xs text-[#666666] hover:text-[#111111] transition-colors underline"
                    >
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