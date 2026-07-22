"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: "..." },
  { label: "Products",  href: "/admin/products", icon: "..." },
  { label: "Orders",    href: "/admin/orders",   icon: "..." },
  { label: "Users",     href: "/admin/users",    icon: "..." },
  { label: "Settings",  href: "/admin/settings", icon: "..." },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 min-h-screen bg-[#FAF7F2] border-r border-black/6 flex-col fixed left-0 top-0 z-50">
        <div className="px-6 py-5 border-b border-black/6">
          <span className="font-['Inter_Tight'] text-lg font-bold text-[#111111]">Admin</span>
          <p className="text-[10px] text-[#999] tracking-widest uppercase mt-0.5">Atelier</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all ${isActive ? "bg-[#111111] text-white" : "text-[#666] hover:text-[#111111] hover:bg-[#EEE7DD]"}`}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-black/6 flex items-center gap-3">
          <UserButton />
          <span className="text-xs text-[#666]">Account</span>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAF7F2] border-t border-black/6 flex items-center justify-around px-2 py-3 safe-area-pb">
        {NAV.map((item) => {
          const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive ? "text-[#111111]" : "text-[#999] hover:text-[#111111]"}`}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="text-[9px] uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}