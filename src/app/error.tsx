"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F5F1EA] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="font-['Inter_Tight'] text-4xl font-bold text-[#111111] mb-4">Something went wrong</h1>
      <p className="text-[#666666] mb-8 max-w-md">
        An unexpected error occurred. Our team has been notified.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="border border-[#111111] text-[#111111] text-xs tracking-widest uppercase px-8 py-4 hover:bg-[#111111] hover:text-white transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="bg-[#111111] text-white text-xs tracking-widest uppercase px-8 py-4 hover:opacity-80 transition-opacity"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
