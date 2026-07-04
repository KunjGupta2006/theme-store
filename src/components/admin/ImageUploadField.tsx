"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface ImageUploadFieldProps {
  name: string;
  label: string;
  defaultValue?: string | null;
  folder?: "products" | "templates";
}

export function ImageUploadField({ name, label, defaultValue, folder = "products" }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE) {
      setError("File must be under 5MB");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Check Cloudinary env vars, then try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs text-[#666666] tracking-widest uppercase">{label}</label>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 shrink-0 bg-white border border-black/8 rounded overflow-hidden relative">
          {url ? (
            <Image src={url} alt="" fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#999]">No image</div>
          )}
        </div>
        <div className="space-y-1">
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} className="hidden" id={`upload-${name}`} />
          <label
            htmlFor={`upload-${name}`}
            className="inline-block cursor-pointer text-xs border border-black/10 rounded px-4 py-2 hover:border-black/30 transition-colors text-[#111111]"
          >
            {uploading ? "Uploading…" : url ? "Replace image" : "Upload image"}
          </label>
          {error && <p className="text-[11px] text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
