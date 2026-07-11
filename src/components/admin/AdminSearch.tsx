"use client";

import { useState, useEffect, useRef } from "react";
import { adminSearch } from "@/features/admin/actions";
import Link from "next/link";
import Image from "next/image";

interface SearchProduct { id: string; name: string; thumbnail?: string | null; }
interface SearchOrder { id: string; customerName: string; orderStatus: string; }
interface SearchUser { id: string; name: string; email: string; imageUrl?: string | null; }

export function AdminSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ products: SearchProduct[]; orders: SearchOrder[]; users: SearchUser[] } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults(null);
        return;
      }
      const res = await adminSearch(query);
      setResults(res);
      setIsOpen(true);
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.length >= 2) setIsOpen(true); }}
          placeholder="Search orders, products, users..."
          className="w-full bg-[#FAF7F2] border border-black/8 rounded-full pl-10 pr-4 py-2 text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black/30 transition-all"
        />
      </div>

      {isOpen && results && (
        <div className="absolute top-full mt-2 w-full bg-white border border-black/10 rounded shadow-xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
          {results.orders.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1 bg-[#FAF7F2] text-xs font-medium text-[#666666] tracking-widest uppercase">Orders</div>
              {results.orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-4 py-2 hover:bg-[#FAF7F2] transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-[#111111]">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-[#666666]">{order.customerName}</p>
                  </div>
                  <span className="text-[10px] tracking-widest uppercase px-2 py-1 bg-[#EEE7DD] rounded-sm">{order.orderStatus}</span>
                </Link>
              ))}
            </div>
          )}
          
          {results.products.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1 bg-[#FAF7F2] text-xs font-medium text-[#666666] tracking-widest uppercase">Products</div>
              {results.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}/edit`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-[#FAF7F2] transition-colors"
                >
                  <div className="w-8 h-8 rounded bg-[#EEE7DD] overflow-hidden relative">
                    {product.thumbnail && <Image src={product.thumbnail} alt={product.name} fill className="object-cover" />}
                  </div>
                  <p className="text-sm font-medium text-[#111111]">{product.name}</p>
                </Link>
              ))}
            </div>
          )}

          {results.users.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1 bg-[#FAF7F2] text-xs font-medium text-[#666666] tracking-widest uppercase">Users</div>
              {results.users.map((user) => (
                <Link
                  key={user.id}
                  href={`/admin/users`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-[#FAF7F2] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#EEE7DD] overflow-hidden relative">
                    {user.imageUrl && <Image src={user.imageUrl} alt={user.name} fill className="object-cover" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111111]">{user.name}</p>
                    <p className="text-xs text-[#666666]">{user.email}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {results.orders.length === 0 && results.products.length === 0 && results.users.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-[#666666]">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
