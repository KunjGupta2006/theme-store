import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getOrderForOwner } from "@/features/checkout/actions";

interface Props { params: Promise<{ id: string }> }

export default async function CheckoutSuccessPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderForOwner(id);
  if (!order) notFound();

  return (
    <main className="min-h-screen bg-[#F5F1EA] px-6 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="font-['Inter_Tight'] text-3xl font-bold text-[#111111]">
          {order.paymentStatus === "PAID" ? "Order Confirmed" : "Order Received"}
        </h1>
        <p className="text-sm text-[#666666] mt-2">
          Order #{order.id.slice(0, 8)} · ₹{order.totalAmount.toLocaleString("en-IN")}
        </p>
        <p className="text-xs text-[#999999] mt-1">A confirmation will be sent to you shortly.</p>
      </div>

      <div className="max-w-2xl mx-auto mt-10 bg-[#FAF7F2] border border-black/8 divide-y divide-black/6">
        {order.items.map((item) => {
          // Prefer the actual printed design over the plain product thumbnail
          // when this line item was custom-designed in the studio.
          const previewUrl =
            item.customDesign?.frontDesignUrl ??
            item.customDesign?.backDesignUrl ??
            item.customDesign?.uploadedImageUrl ??
            item.product.thumbnail;

          return (
            <div key={item.id} className="flex gap-4 p-5">
              <div className="w-20 h-20 bg-[#EEE7DD] shrink-0 relative overflow-hidden rounded">
                {previewUrl && <Image src={previewUrl} alt={item.product.name} fill className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111111]">{item.product.name}</p>
                {item.variant && (
                  <p className="text-xs text-[#666666] mt-0.5">{item.variant.color} · Size {item.variant.size}</p>
                )}
                {item.customDesign && (
                  <p className="text-xs text-[#666666]">Custom design attached</p>
                )}
                <p className="text-xs text-[#666666] mt-0.5">Qty {item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-[#111111] shrink-0">
                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
              </p>
            </div>
          );
        })}
      </div>

      <div className="max-w-2xl mx-auto mt-8 flex justify-center">
        <Link href="/shop" className="bg-[#111111] text-white text-xs tracking-widest uppercase px-8 py-4 hover:opacity-80 transition-opacity">
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}