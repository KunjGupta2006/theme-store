"use client";

import { useState } from "react";

export function CopyOrderIdButton({ orderId }: { orderId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy full order ID"
      className="text-xs text-[#666666] hover:text-[#111111] transition-colors underline"
    >
      {copied ? "Copied ✓" : "Copy full ID"}
    </button>
  );
}