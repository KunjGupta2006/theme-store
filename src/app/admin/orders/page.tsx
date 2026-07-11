import { db } from "@/lib/db";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { OrdersFilterBar } from "@/components/admin/OrdersFilterBar";
import { OrdersTable, type OrderRow } from "@/components/admin/OrdersTable";

export const metadata: Metadata = { title: "Orders — Admin" };

interface AdminOrdersPageProps {
  searchParams: Promise<{ status?: string; payment?: string; q?: string; sort?: string }>;
}

const ORDER_STATUS_VALUES = ["PROCESSING", "PRINTING", "SHIPPED", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUS_VALUES = ["PENDING", "PAID", "FAILED"];

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const { status, payment, q, sort } = await searchParams;

  const where: Prisma.OrderWhereInput = {};
  if (status && ORDER_STATUS_VALUES.includes(status)) {
    where.orderStatus = status as Prisma.EnumOrderStatusFilter["equals"];
  }
  if (payment && PAYMENT_STATUS_VALUES.includes(payment)) {
    where.paymentStatus = payment as Prisma.EnumPaymentStatusFilter["equals"];
  }
  if (q) {
    where.OR = [
      { id: { contains: q, mode: "insensitive" } },
      { customerName: { contains: q, mode: "insensitive" } },
      { customerPhone: { contains: q, mode: "insensitive" } },
      { user: { is: { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } } },
    ];
  }

  const orderBy: Prisma.OrderOrderByWithRelationInput =
    sort === "date_asc" ? { createdAt: "asc" } :
    sort === "amount_desc" ? { totalAmount: "desc" } :
    sort === "amount_asc" ? { totalAmount: "asc" } :
    { createdAt: "desc" };

  const orders = await db.order.findMany({
    where,
    orderBy,
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
  });

  const rows: OrderRow[] = orders.map((o) => ({
    id: o.id,
    customerName: o.customerName,
    userName: o.user.name,
    userEmail: o.user.email,
    itemCount: o._count.items,
    totalAmount: o.totalAmount,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Inter_Tight'] text-3xl font-bold text-[#111111]">Orders</h1>
        <p className="text-sm text-[#666666] mt-1">
          {rows.length} {rows.length === 1 ? "order" : "orders"}
          {(status || payment || q) ? " matching filters" : " total"}
        </p>
      </div>
      <OrdersFilterBar />
      <OrdersTable orders={rows} />
    </div>
  );
}