import { getOrdersForUser } from "@/features/account/actions";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ProfileButton } from "./ProfileButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account — Atelier",
};

export default async function AccountPage() {
  const orders = await getOrdersForUser();

  if (!orders) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-[#FAF7F2]">
        <h1 className="font-['Inter_Tight'] text-2xl font-bold tracking-tight text-[#111111] mb-2 uppercase">Please Sign In</h1>
        <p className="text-sm text-[#666666]">You need to be signed in to view your account.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#FAF7F2]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10">
          <h1 className="font-['Inter_Tight'] text-2xl font-bold tracking-tight text-[#111111] uppercase">My Account</h1>
          <ProfileButton />
        </div>

        <section>
          <h2 className="font-['Inter_Tight'] text-lg font-semibold tracking-tight text-[#111111] uppercase mb-4">Order History</h2>
          
          {orders.length === 0 ? (
            <div className="bg-white border border-black/8 rounded p-8 text-center">
              <p className="text-sm text-[#666666] mb-4">You haven&apos;t placed any orders yet.</p>
              <Link href="/shop" className="inline-block bg-[#111111] text-white text-xs tracking-widest uppercase px-6 py-3 hover:opacity-80 transition-opacity">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-black/8 rounded p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#666666] tracking-widest uppercase mb-1">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-[#111111] mb-1">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] tracking-widest uppercase px-2 py-1 bg-[#F5F1EA] text-[#666] rounded-sm">
                        {order.orderStatus}
                      </span>
                      <span className="text-sm font-medium text-[#111111]">{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={item.id} className="w-12 h-12 rounded-full border-2 border-white bg-[#F5F1EA] overflow-hidden relative" style={{ zIndex: 3 - i }}>
                          <Image
                            src={item.customDesign?.frontDesignUrl || item.product.thumbnail || ""}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-12 h-12 rounded-full border-2 border-white bg-[#E5E1DA] text-[#666] text-[10px] flex items-center justify-center relative z-0">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    
                    <Link href={`/account/orders/${order.id}`} className="text-xs text-[#111111] underline hover:opacity-70 transition-opacity whitespace-nowrap">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
