import Link from "next/link";
import type { Metadata } from "next";
import { NewProductForm } from "@/components/admin/NewProductForm";

export const metadata: Metadata = { title: "New Product — Admin" };

export default function NewProductPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-sm text-[#666666] hover:text-[#111111] transition-colors">
          ← Products
        </Link>
        <span className="text-[#666666]">/</span>
        <h1 className="font-['Inter_Tight'] text-2xl font-bold text-[#111111]">New Product</h1>
      </div>
      <NewProductForm />
      <p className="text-xs text-[#666666]">
        All size/color variants (S–XXL × Black/White) are created automatically with 0 stock. Edit
        individual variants after creation.
      </p>
    </div>
  );
}