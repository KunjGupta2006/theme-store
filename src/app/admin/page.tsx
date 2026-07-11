import { db } from "@/lib/db";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrderStatusChart } from "@/components/admin/OrderStatusChart";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — Admin" };

async function getDashboardData() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [
    totalRevenue,
    totalOrders,
    totalUsers,
    pendingOrders,
    recentOrders,
    ordersByStatus,
    topProducts,
    revenueByDay,
    lowStockVariants,
  ] = await Promise.all([
    // Total revenue from paid orders
    db.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    }),

    // Total orders
    db.order.count(),

    // Total users
    db.user.count(),

    // Pending orders
    db.order.count({ where: { orderStatus: "PROCESSING" } }),

    // Recent 5 orders
    db.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),

    // Orders grouped by status
    db.order.groupBy({
      by: ["orderStatus"],
      _count: { id: true },
    }),

    // Top 5 products by quantity sold
    db.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),

    // Revenue last 30 days
    db.order.findMany({
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: "asc" },
    }),

    // Low stock variants (less than 10)
    db.productVariant.count({ where: { stockQuantity: { lt: 10 } } }),
  ]);

  // Resolve product names for top products
  const topProductIds = topProducts.map((p) => p.productId);
  const products = await db.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]));

  // Build revenue chart data (group by day)
  const revenueMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    revenueMap[key] = 0;
  }
  for (const order of revenueByDay) {
    const key = order.createdAt.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
    if (key in revenueMap) revenueMap[key] += order.totalAmount;
  }
  const revenueChartData = Object.entries(revenueMap).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  // Order status chart data
  const statusData = [
    "PROCESSING",
    "PRINTING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ].map((status) => ({
    name: status,
    value:
      ordersByStatus.find((o) => o.orderStatus === status)?._count.id ?? 0,
  }));

  return {
    stats: {
      revenue: totalRevenue._sum.totalAmount ?? 0,
      orders: totalOrders,
      users: totalUsers,
      pending: pendingOrders,
      lowStock: lowStockVariants,
    },
    recentOrders,
    topProducts: topProducts.map((p) => ({
      name: productMap[p.productId] ?? "Unknown",
      sold: p._sum.quantity ?? 0,
    })),
    revenueChartData,
    statusData,
  };
}

const STATUS_COLORS: Record<string, string> = {
  PROCESSING: "bg-yellow-100 text-yellow-800",
  PRINTING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function AdminDashboard() {
  const { stats, recentOrders, topProducts, revenueChartData, statusData } =
    await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-['Inter_Tight'] text-3xl font-bold text-[#111111]">
          Dashboard
        </h1>
        <p className="text-sm text-[#666666] mt-1">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: "Total Revenue",
            value: `₹${stats.revenue.toLocaleString("en-IN")}`,
            sub: "All time, paid orders",
          },
          {
            label: "Total Orders",
            value: stats.orders.toLocaleString(),
            sub: "All time",
          },
          {
            label: "Registered Users",
            value: stats.users.toLocaleString(),
            sub: "All time",
          },
          {
            label: "Pending Orders",
            value: stats.pending.toLocaleString(),
            sub: "Needs action",
          },
          {
            label: "Low Stock Items",
            value: stats.lowStock.toLocaleString(),
            sub: "Variants < 10 units",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-[#FAF7F2] border border-black/6 p-5 rounded"
          >
            <p className="text-xs text-[#666666] tracking-widest uppercase mb-2">
              {card.label}
            </p>
            <p className="font-['Inter_Tight'] text-3xl font-bold text-[#111111]">
              {card.value}
            </p>
            <p className="text-xs text-[#666666] mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-[#FAF7F2] border border-black/6 p-6 rounded">
          <h2 className="text-sm font-medium text-[#111111] mb-1">
            Revenue — Last 30 Days
          </h2>
          <p className="text-xs text-[#666666] mb-6">Paid orders only</p>
          <RevenueChart data={revenueChartData} />
        </div>

        {/* Order status chart */}
        <div className="bg-[#FAF7F2] border border-black/6 p-6 rounded">
          <h2 className="text-sm font-medium text-[#111111] mb-1">
            Orders by Status
          </h2>
          <p className="text-xs text-[#666666] mb-6">All time</p>
          <OrderStatusChart data={statusData} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-[#FAF7F2] border border-black/6 rounded overflow-hidden">
          <div className="px-6 py-4 border-b border-black/6 flex items-center justify-between">
            <h2 className="text-sm font-medium text-[#111111]">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs text-[#666666] hover:text-[#111111] transition-colors"
            >
              View all →
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/6">
                {["Order ID", "Customer", "Amount", "Status"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] text-[#666666] tracking-widest uppercase px-6 py-3 font-normal"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center text-sm text-[#666666] py-8"
                  >
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-black/4 hover:bg-[#EEE7DD]/40 transition-colors"
                  >
                    <td className="px-6 py-3 text-xs font-mono text-[#666666]">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-3 text-sm text-[#111111]">
                      {order.user.name}
                    </td>
                    <td className="px-6 py-3 text-sm text-[#111111]">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                          STATUS_COLORS[order.orderStatus] ?? ""
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Top products */}
        <div className="bg-[#FAF7F2] border border-black/6 rounded overflow-hidden">
          <div className="px-6 py-4 border-b border-black/6">
            <h2 className="text-sm font-medium text-[#111111]">
              Top Products
            </h2>
            <p className="text-xs text-[#666666] mt-0.5">By units sold</p>
          </div>
          <div className="p-6 space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-sm text-[#666666] text-center py-4">
                No sales yet
              </p>
            ) : (
              topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-xs text-[#666666] w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#111111] truncate">{p.name}</p>
                    <div className="mt-1 h-1 bg-[#EEE7DD] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#111111] rounded-full"
                        style={{
                          width: `${
                            topProducts[0].sold > 0
                              ? (p.sold / topProducts[0].sold) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-[#666666] shrink-0">
                    {p.sold} sold
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}