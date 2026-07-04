"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="relative aspect-4/5 bg-[#EEE7DD] overflow-hidden flex items-center justify-center text-[#999999] text-sm">
        No image
      </div>
    );
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      setActive((prev) =>
        delta < 0 ? Math.min(prev + 1, images.length - 1) : Math.max(prev - 1, 0)
      );
    }
    touchStartX.current = null;
  }

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-4/5 bg-[#EEE7DD] overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          key={images[active]}
          src={images[active]}
          alt={`${name} — view ${active + 1}`}
          fill
          priority={active === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => setActive((p) => Math.max(p - 1, 0))}
              disabled={active === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 text-[#111111] text-sm flex items-center justify-center disabled:opacity-0 transition-opacity hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => setActive((p) => Math.min(p + 1, images.length - 1))}
              disabled={active === images.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 text-[#111111] text-sm flex items-center justify-center disabled:opacity-0 transition-opacity hover:bg-white"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === active ? "bg-[#111111]" : "bg-white/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-square bg-[#EEE7DD] overflow-hidden ${
                i === active ? "ring-1 ring-[#111111]" : "opacity-50 hover:opacity-80 transition-opacity"
              }`}
            >
              <Image src={src} alt={`${name} thumbnail ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}