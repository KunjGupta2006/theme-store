"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

interface DesignPrintPreviewProps {
  label: string;
  url: string;
  productName: string;
}

export default function DesignPrintPreview({ label, url, productName }: DesignPrintPreviewProps) {
  const [open, setOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePrint = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(`
      <html>
        <head><style>
          body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
          img { max-width: 100%; max-height: 100vh; object-fit: contain; }
        </style></head>
        <body><img src="${url}" /></body>
      </html>
    `);
    doc.close();
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  }, [url]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group block text-left"
      >
        <div className="w-24 h-24 bg-white border border-black/10 rounded overflow-hidden relative group-hover:border-black/30 transition-colors">
          <Image src={url} alt={`${productName} — ${label} design`} fill className="object-contain" />
        </div>
        <p className="text-[10px] text-[#666666] text-center mt-1 group-hover:text-[#111111] transition-colors">
          {label} · View
        </p>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-[90vw] max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-black/10">
              <h3 className="text-sm font-medium text-[#111111]">{productName} — {label}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="text-xs px-4 py-1.5 bg-[#111111] text-white rounded hover:bg-[#333] transition-colors"
                >
                  Print
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-xs px-3 py-1.5 border border-black/20 text-[#666666] rounded hover:text-[#111111] hover:border-black/40 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-5 flex items-center justify-center overflow-auto">
              <Image src={url} alt={`${productName} — ${label} design`} width={600} height={800} className="object-contain max-w-full max-h-[75vh]" />
            </div>
          </div>
        </div>
      )}

      <iframe ref={iframeRef} className="hidden" title="print-frame" />
    </>
  );
}
