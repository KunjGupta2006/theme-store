"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { addProductImages, deleteProductImage } from "@/features/admin/actions";

interface GalleryImage {
  id: string;
  url: string;
}

const MAX_SIZE = 5 * 1024 * 1024;

export function MultiImageUploadField({
  productId,
  images,
}: {
  productId: string;
  images: GalleryImage[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const oversized = files.find((f) => f.size > MAX_SIZE);
    if (oversized) {
      setError(`"${oversized.name}" is over 5MB`);
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const body = new FormData();
        body.append("file", file);
        body.append("folder", "products");
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Failed to upload ${file.name}`);
        urls.push(data.url);
      }
      await addProductImages(productId, urls);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    setPending(id);
    try {
      await deleteProductImage(id);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-xs text-[#666666] tracking-widest uppercase">Gallery Images</label>
      <p className="text-[11px] text-[#666666]">
        Shown as a swipeable gallery on the product page, in upload order.
      </p>
      <div className="grid grid-cols-4 gap-3">
        {images.map((img) => (
          <div
            key={img.id}
            className="relative aspect-square bg-white border border-black/8 rounded overflow-hidden group"
          >
            <Image src={img.url} alt="" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => handleDelete(img.id)}
              disabled={pending === img.id}
              className="absolute top-1 right-1 bg-black/70 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
        <label
          htmlFor="gallery-upload"
          className="aspect-square flex items-center justify-center border border-dashed border-black/15 rounded cursor-pointer text-[10px] text-[#999] hover:border-black/30 transition-colors text-center px-2"
        >
          {uploading ? "Uploading…" : "+ Add images"}
        </label>
        <input
          ref={inputRef}
          id="gallery-upload"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={handleFiles}
          className="hidden"
        />
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}