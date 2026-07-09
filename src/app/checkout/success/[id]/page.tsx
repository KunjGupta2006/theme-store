import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderForOwner } from "@/features/checkout/actions";

interface Props { params: Promise<{ id: string }> }

export default async function CheckoutSuccessPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderForOwner(id);
  if (!order) notFound();

  return (
    <main className="min-h-screen bg-[#F5F1EA] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-['Inter_Tight'] text-3xl font-bold text-[#111111]">
        {order.paymentStatus === "PAID" ? "Order Confirmed" : "Order Received"}
      </h1>
      <p className="text-sm text-[#666666]">Order #{order.id.slice(0, 8)} · ₹{order.totalAmount.toLocaleString("en-IN")}</p>
      <p className="text-xs text-[#999999]">A confirmation will be sent to you shortly.</p>
      <Link href="/shop" className="mt-4 bg-[#111111] text-white text-xs tracking-widest uppercase px-8 py-4">Continue Shopping</Link>
    </main>
  );
}