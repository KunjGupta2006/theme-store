"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useCartStore } from "@/store/cart";
import { toast } from "@/lib/toast";
import { saveDesign, uploadToCloudinary } from "@/features/customize/actions";
import type { DesignElement, DesignCanvasApi, Side } from "./DesignCanvas";
import { PRINT_X, PRINT_Y, PRINT_W, PRINT_H, STAGE_WIDTH } from "./DesignCanvas";

const DesignCanvas = dynamic(() => import("./DesignCanvas"), { ssr: false });

type Color = string ;
type Size = "S" | "M" | "L" | "XL" | "XXL";
type Tool = "select" | "upload" | "text" | "paint";
type MobilePanel = "studio" | "canvas" | "details";

interface ProductColorInfo { name: string; hex: string; frontMockup?: string | null; backMockup?: string | null; }
interface Variant { id: string; size: Size; color: Color; stockQuantity: number; priceAdjustment: number; }
interface Product {
  id: string; name: string; slug: string; basePrice: number; thumbnail: string | null;
  isCustomizable: boolean; variants: Variant[]; colors: ProductColorInfo[];
}
interface Pricing { customShirtBasePrice: number; printChargePerSide: number; }
interface DesignEditorProps {
  product: Product;
  initialColor: Color;
  initialSize?: string;
  pricing: Pricing;
}

const SIZE_ORDER: Size[] = ["S", "M", "L", "XL", "XXL"];
const BRUSH_COLORS = ["#111111", "#ffffff", "#e11d48", "#2563eb", "#16a34a", "#f59e0b"];
const FONT_OPTIONS = ["Inter Tight", "Inter", "Georgia", "Arial", "Times New Roman", "Cursive" , "Courier New"];
const MAX_DESIGN_UPLOAD = 4.5 * 1024 * 1024; // 4.5MB

const AlignLeftIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M4 3v18M8 8h10M8 16h6" strokeLinecap="round" /></svg>);
const AlignCenterIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M12 3v18M6 8h12M8 16h8" strokeLinecap="round" /></svg>);
const AlignRightIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M20 3v18M6 8h10M10 16h6" strokeLinecap="round" /></svg>);
const TrashIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0l1 13h8l1-13" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const PaintIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>);
const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
) : (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M6.5 6.7C4 8.3 2 12 2 12s4 7 10 7c1.6 0 3-.4 4.3-1.1M17.6 17.4C20 15.7 22 12 22 12s-1-1.8-2.7-3.5" strokeLinecap="round" /></svg>
);

// Two animation frames = give React time to commit + Konva time to redraw the canvas
// before we read pixels off it. Used so an in-progress text edit is never lost on export.
function waitForRender() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export function DesignEditor({ product, initialColor, initialSize, pricing }: DesignEditorProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frontApi = useRef<DesignCanvasApi | null>(null);
  const backApi = useRef<DesignCanvasApi | null>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);

  const validInitialColor = product.colors.some((c) => c.name === initialColor) ? initialColor : (product.colors[0]?.name ?? "");
  const [color, setColor] = useState<Color>(validInitialColor);
  const [size, setSize] = useState<Size | null>(SIZE_ORDER.includes(initialSize as Size) ? (initialSize as Size) : null);
  const [side, setSide] = useState<Side>("front");
  const [zoom, setZoom] = useState(1);
  const [fitScale, setFitScale] = useState(1);
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("canvas");

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const [tool, setTool] = useState<Tool>("select");
  const [brushColor, setBrushColor] = useState("#111111");
  const [brushSize, setBrushSize] = useState(8);

  const availableSizes = product.variants.filter((v) => v.color === color && v.stockQuantity > 0).map((v) => v.size);
  const selectedVariant = product.variants.find((v) => v.color === color && v.size === size);

  const currentColorInfo = product.colors.find((c) => c.name === color);
  const colorHex = currentColorInfo?.hex ?? "#ffffff";
  const frontMockupUrl = currentColorInfo?.frontMockup ?? product.thumbnail ?? undefined;
  const backMockupUrl = currentColorInfo?.backMockup ?? product.thumbnail ?? undefined;

  function isLightColor(hex: string): boolean {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
  }

  const frontHasDesign = elements.some((e) => e.side === "front" && e.visible);
  const backHasDesign = elements.some((e) => e.side === "back" && e.visible);
  const sidesPrinted = (frontHasDesign ? 1 : 0) + (backHasDesign ? 1 : 0);
  const finalPrice = product.isCustomizable
    ? pricing.customShirtBasePrice + pricing.printChargePerSide * sidesPrinted
    : product.basePrice + (selectedVariant?.priceAdjustment ?? 0);

  const selected = elements.find((e) => e.id === selectedId) ?? null;
  const sideElements = elements.filter((e) => e.side === side);

  // Shrink the canvas to fit narrow screens; manual zoom then multiplies on top of that fit.
  useEffect(() => {
    function updateFit() {
      const el = stageWrapRef.current;
      if (!el) return;
      const available = el.clientWidth - 32;
      setFitScale(Math.min(1, Math.max(0.4, available / STAGE_WIDTH)));
    }
    updateFit();
    window.addEventListener("resize", updateFit);
    return () => window.removeEventListener("resize", updateFit);
  }, [mobilePanel]);

  const updateElement = useCallback((id: string, attrs: Partial<DesignElement>) => {
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, ...attrs } : e)));
  }, []);

  const addImageElement = (src: string) => {
    const id = crypto.randomUUID();
    setElements((prev) => [
      ...prev,
      {
        id, type: "image", side, src,
        x: PRINT_X + 20, y: PRINT_Y + 20, width: 120, height: 120, baseWidth: 120, baseHeight: 120,
        rotation: 0, visible: true, name: `Image ${prev.filter((e) => e.type === "image").length + 1}`,
      },
    ]);
    setSelectedId(id);
    setTool("select");
    setMobilePanel("canvas");
  };

  const addTextElement = () => {
    const id = crypto.randomUUID();
    setElements((prev) => [
      ...prev,
      {
        id, type: "text", side, text: "", // starts blank — DesignCanvas auto-opens inline editing for it
        x: PRINT_X + 10, y: PRINT_Y + PRINT_H / 2, width: 140, height: 30, baseWidth: 140, baseHeight: 30,
        fontSize: 22, baseFontSize: 22, fontFamily: "Inter Tight", fontStyle: "normal",
        fill: isLightColor(colorHex) ? "#111111" : "#ffffff",
        rotation: 0, visible: true, name: "Text",
      },
    ]);
    setSelectedId(id);
    setTool("select");
    setMobilePanel("canvas"); // jump to the canvas so the user sees the inline editor open
  };

  const addPathElement = useCallback((points: number[]) => {
    const xs = points.filter((_, i) => i % 2 === 0);
    const ys = points.filter((_, i) => i % 2 === 1);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const id = crypto.randomUUID();
    setElements((prev) => [
      ...prev,
      {
        id, type: "path", side,
        x: 0, y: 0,
        width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY),
        baseWidth: Math.max(1, maxX - minX), baseHeight: Math.max(1, maxY - minY),
        rotation: 0, visible: true, name: `Paint ${prev.filter((e) => e.type === "path").length + 1}`,
        points, stroke: brushColor, strokeWidth: brushSize,
      },
    ]);
    setSelectedId(id);
  }, [side, brushColor, brushSize]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
 if (file.size > MAX_DESIGN_UPLOAD) { toast.error("File must be under 4.5MB"); return; }
    if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
      toast.error("Only PNG, JPG, and SVG files are allowed");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", "custom-designs");
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      addImageElement(data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [side, color, toast]);

  const deleteSelected = () => {
    if (!selected) return;
    setElements((prev) => prev.filter((e) => e.id !== selected.id));
    setSelectedId(null);
  };

  const scalePercent = selected ? Math.round((selected.width / selected.baseWidth) * 100) : 100;
  const handleScale = (pct: number) => {
    if (!selected) return;
    const ratio = pct / 100;
    if (selected.type === "path") {
      const baseRatio = ratio / ((selected.width || 1) / (selected.baseWidth || 1));
      updateElement(selected.id, {
        width: selected.baseWidth * ratio,
        height: selected.baseHeight * ratio,
        points: (selected.points ?? []).map((p) => p * baseRatio),
      });
      return;
    }
    updateElement(selected.id, {
      width: selected.baseWidth * ratio,
      height: selected.baseHeight * ratio,
      ...(selected.type === "text" ? { fontSize: (selected.baseFontSize ?? 22) * ratio } : {}),
    });
  };

  const alignLeft = () => selected && updateElement(selected.id, { x: PRINT_X });
  const alignCenter = () => selected && updateElement(selected.id, {
    x: PRINT_X + (PRINT_W - selected.width) / 2,
    y: PRINT_Y + (PRINT_H - selected.height) / 2,
  });
  const alignRight = () => selected && updateElement(selected.id, { x: PRINT_X + PRINT_W - selected.width });

  async function exportSide(target: Side): Promise<string | undefined> {
    const api = target === "front" ? frontApi.current : backApi.current;
    // Force-save any open inline text edit before we read pixels off the canvas,
    // and wait a couple of frames so the commit actually lands on the bitmap.
    api?.commitPendingEdit();
    await waitForRender();
    const hasVisible = elements.some((e) => e.side === target && e.visible);
    if (!hasVisible) return undefined;
    const dataUrl = api?.exportDesign();
    if (!dataUrl) return undefined;
    return uploadToCloudinary(dataUrl);
  }

  async function handleFinishDesign() {
    if (!size) { toast.error("Please select a size"); return; }
    if (elements.length === 0) { toast.error("Please add a design to at least one side"); return; }
    if (!selectedVariant) { toast.error("Selected size is out of stock"); return; }
    setSaving(true);
    try {
      const [frontUrl, backUrl] = await Promise.all([exportSide("front"), exportSide("back")]);
      const { designId } = await saveDesign({
        productId: product.id, frontDesignUrl: frontUrl, backDesignUrl: backUrl, selectedColor: color, selectedSize: size,
      });
      addItem({
        id: selectedVariant.id,
        productId: product.id,
        name: `Custom ${product.name}`,
        slug: product.slug,
        thumbnail: product.thumbnail,
        color,
        size,
        price: finalPrice,
        quantity: 1,
        customDesignId: designId,
        customDesignUrl: frontUrl ?? backUrl,
      });
      toast.success("Design saved — added to your cart");
      router.push("/cart");
    } catch {
      toast.error("Failed to save design. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDraft() {
    if (elements.length === 0) { toast.error("Add a design element before saving a draft"); return; }
    setSavingDraft(true);
    try {
      const [frontUrl, backUrl] = await Promise.all([exportSide("front"), exportSide("back")]);
      await saveDesign({
        productId: product.id, frontDesignUrl: frontUrl, backDesignUrl: backUrl,
        selectedColor: color, selectedSize: size ?? "M",
      });
      setDraftSaved(true);
      toast.success("Draft saved");
      setTimeout(() => setDraftSaved(false), 2500);
    } catch {
      toast.error("Failed to save draft.");
    } finally {
      setSavingDraft(false);
    }
  }

  const mobileTabs: { key: MobilePanel; label: string }[] = [
    { key: "studio", label: "Tools" },
    { key: "canvas", label: "Canvas" },
    { key: "details", label: "Details" },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] overflow-hidden bg-[#F5F1EA]">
      {/* Mobile-only panel switcher */}
      <div className="lg:hidden flex items-center border-b border-black/6 bg-[#FAF7F2] shrink-0">
        {mobileTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setMobilePanel(t.key)}
            className={`flex-1 py-3 text-[11px] tracking-widest uppercase transition-colors border-b-2 ${
              mobilePanel === t.key ? "text-[#111111] border-[#111111]" : "text-[#999999] border-transparent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Left — Studio Editor */}
      <div className={`${mobilePanel === "studio" ? "flex" : "hidden"} lg:flex w-full lg:w-72 h-full bg-[#FAF7F2] lg:border-r border-black/6 flex-col shrink-0`}>
        <div className="hidden lg:block px-5 py-5 border-b border-black/6">
          <h2 className="font-['Inter_Tight'] text-lg font-bold text-[#111111]">Studio Editor</h2>
          <p className="text-xs text-[#666666] mt-0.5">Design your bespoke piece.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Add Elements */}
          <div className="space-y-3">
            <span className="text-xs text-[#666666] tracking-widest uppercase">Add Elements</span>
            <div className="grid grid-cols-3 gap-2">
              <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.svg" className="hidden" onChange={handleFileUpload} />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex flex-col items-center gap-1.5 border border-black/10 rounded py-4 hover:border-black/30 transition-colors text-[#111111]"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-xs">{uploading ? "Uploading…" : "Upload"}</span>
              </button>
              <button
                onClick={addTextElement}
                className="flex flex-col items-center gap-1.5 border border-black/10 rounded py-4 hover:border-black/30 transition-colors text-[#111111]"
              >
                <span className="text-base font-['Inter_Tight'] font-bold">Aa</span>
                <span className="text-xs">Text</span>
              </button>
              <button
                onClick={() => { setTool((t) => (t === "paint" ? "select" : "paint")); setSelectedId(null); }}
                className={`flex flex-col items-center gap-1.5 border rounded py-4 transition-colors ${
                  tool === "paint" ? "border-[#111111] bg-[#111111] text-white" : "border-black/10 text-[#111111] hover:border-black/30"
                }`}
              >
                <PaintIcon />
                <span className="text-xs">Paint</span>
              </button>
            </div>

            {tool === "paint" && (
              <div className="border border-black/10 rounded p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#666666]">Brush</span>
                  <span className="text-xs text-[#111111]">{brushSize}px</span>
                </div>
                <input type="range" min={2} max={30} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full accent-[#111111]" />
                <div className="flex items-center gap-2 flex-wrap">
                  {BRUSH_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setBrushColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${brushColor === c ? "border-[#111111] scale-110" : "border-black/10"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-6 h-6 rounded-full border border-black/10 cursor-pointer"
                    title="Custom color"
                  />
                </div>
                <p className="text-[11px] text-[#999999]">Draw directly on the shirt. Each stroke becomes its own layer you can move, scale, or delete.</p>
              </div>
            )}
          </div>

          <div className="h-px bg-black/6" />

          {/* Properties */}
          <div className="space-y-3">
            <span className="text-xs text-[#666666] tracking-widest uppercase">Properties</span>
            {!selected ? (
              <p className="text-xs text-[#999999]">
                {tool === "paint" ? "Click and drag on the shirt to paint." : "Select an element to edit it."}
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-[#666666] mb-1">
                    <span>Scale</span><span>{scalePercent}%</span>
                  </div>
                  <input type="range" min={30} max={250} value={scalePercent} onChange={(e) => handleScale(Number(e.target.value))} className="w-full accent-[#111111]" />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-[#666666] mb-1">
                    <span>Rotate</span><span>{Math.round(selected.rotation)}°</span>
                  </div>
                  <input type="range" min={-180} max={180} value={selected.rotation} onChange={(e) => updateElement(selected.id, { rotation: Number(e.target.value) })} className="w-full accent-[#111111]" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <button onClick={alignLeft} className="border border-black/10 rounded py-2 flex items-center justify-center hover:border-black/30 text-[#111111]"><AlignLeftIcon /></button>
                  <button onClick={alignCenter} className="border border-black/10 rounded py-2 flex items-center justify-center hover:border-black/30 text-[#111111]"><AlignCenterIcon /></button>
                  <button onClick={alignRight} className="border border-black/10 rounded py-2 flex items-center justify-center hover:border-black/30 text-[#111111]"><AlignRightIcon /></button>
                  <button onClick={deleteSelected} className="border border-black/10 rounded py-2 flex items-center justify-center hover:border-red-300 text-red-500"><TrashIcon /></button>
                </div>

                {selected.type === "text" && (
                  <div className="space-y-3 pt-3 border-t border-black/6">
                    <div className="space-y-1.5">
                      <span className="text-xs text-[#666666]">Font</span>
                      <select
                        value={selected.fontFamily ?? "Inter Tight"}
                        onChange={(e) => updateElement(selected.id, { fontFamily: e.target.value })}
                        className="w-full bg-white border border-black/10 rounded px-2 py-1.5 text-sm text-[#111111]"
                      >
                        {FONT_OPTIONS.map((f) => (
                          <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#666666]">Style</span>
                      <div className="flex gap-1">
                        {([
                          { v: "normal", l: "Reg" },
                          { v: "bold", l: "B" },
                          { v: "italic", l: "I" },
                          { v: "italic bold", l: "B+I" },
                        ] as const).map(({ v, l }) => (
                          <button
                            key={v}
                            onClick={() => updateElement(selected.id, { fontStyle: v })}
                            className={`px-2 py-1 text-[10px] border rounded transition-colors ${
                              (selected.fontStyle ?? "normal") === v
                                ? "border-[#111111] bg-[#111111] text-white"
                                : "border-black/10 text-[#111111] hover:border-black/30"
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#666666]">Color</span>
                      <input
                        type="color"
                        value={selected.fill ?? "#111111"}
                        onChange={(e) => updateElement(selected.id, { fill: e.target.value })}
                        className="w-8 h-8 rounded border border-black/10 cursor-pointer bg-white"
                      />
                    </div>
                    <p className="text-[11px] text-[#999999]">Double-click the text on the canvas to edit its wording.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-px bg-black/6" />

          {/* Layers */}
          <div className="space-y-2">
            <span className="text-xs text-[#666666] tracking-widest uppercase">Layers</span>
            {sideElements.length === 0 ? (
              <p className="text-xs text-[#999999]">No elements on this side yet.</p>
            ) : (
              <div className="space-y-1">
                {sideElements.map((el) => (
                  <div
                    key={el.id}
                    onClick={() => setSelectedId(el.id)}
                    className={`flex items-center gap-2 px-2 py-2 rounded text-sm cursor-pointer transition-colors ${
                      el.id === selectedId ? "bg-[#111111] text-white" : "text-[#111111] hover:bg-[#EEE7DD]"
                    }`}
                  >
                    <span className="text-xs shrink-0">{el.type === "image" ? "🖼" : el.type === "text" ? "Aa" : "🖌"}</span>
                    <span className="flex-1 truncate text-xs">{el.type === "text" ? (el.text || "Text (empty)") : el.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); updateElement(el.id, { visible: !el.visible }); }} className="shrink-0 opacity-70 hover:opacity-100">
                      <EyeIcon open={el.visible} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="p-5 border-t border-black/6">
          <button
            onClick={handleFinishDesign}
            disabled={saving}
            className="w-full bg-[#111111] text-white text-xs tracking-widest uppercase py-4 hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving…" : "Finish Design"}
          </button>
        </div>
      </div>

      {/* Center — Canvas */}
      <div className={`${mobilePanel === "canvas" ? "flex" : "hidden"} lg:flex flex-1 flex-col bg-[#F5F1EA] overflow-hidden min-h-0`}>
        <div className="flex items-center justify-center px-6 py-3 border-b border-black/6 bg-[#FAF7F2] shrink-0">
          <div className="flex items-center gap-1 bg-[#EEE7DD] p-1 rounded-full">
            {(["front", "back"] as Side[]).map((s) => (
              <button
                key={s}
                onClick={() => setSide(s)}
                className={`px-5 py-1.5 text-xs tracking-widest uppercase rounded-full transition-all ${
                  side === s ? "bg-[#111111] text-white" : "text-[#666666] hover:text-[#111111]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div ref={stageWrapRef} className="flex-1 flex items-center justify-center overflow-auto relative p-4">
          <div style={{ transform: `scale(${fitScale * zoom})`, transformOrigin: "center center", transition: "transform 0.15s ease" }} className="relative">
            <div style={{ display: side === "front" ? "block" : "none" }}>
              <DesignCanvas
                color={color} side="front" elements={elements} selectedId={selectedId}
                onSelect={setSelectedId} onChange={updateElement} active={side === "front"}
                onReady={(api) => { frontApi.current = api; }}
                paintMode={tool === "paint" && side === "front"}
                brushColor={brushColor} brushSize={brushSize}
                onPathComplete={addPathElement}
                mockupUrl={frontMockupUrl}
              />
            </div>
            <div style={{ display: side === "back" ? "block" : "none" }}>
              <DesignCanvas
                color={color} side="back" elements={elements} selectedId={selectedId}
                onSelect={setSelectedId} onChange={updateElement} active={side === "back"}
                onReady={(api) => { backApi.current = api; }}
                paintMode={tool === "paint" && side === "back"}
                brushColor={brushColor} brushSize={brushSize}
                onPathComplete={addPathElement}
                mockupUrl={backMockupUrl}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 py-3 lg:py-4 shrink-0">
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="w-9 h-9 rounded-full border border-black/10 bg-[#FAF7F2] flex items-center justify-center hover:border-black/30 text-[#111111]">−</button>
          <button onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))} className="w-9 h-9 rounded-full border border-black/10 bg-[#FAF7F2] flex items-center justify-center hover:border-black/30 text-[#111111]">+</button>
          <button onClick={() => setZoom(1)} className="w-9 h-9 rounded-full border border-black/10 bg-[#FAF7F2] flex items-center justify-center hover:border-black/30 text-[#111111]" title="Reset zoom">↺</button>
        </div>
      </div>

      {/* Right — Product info */}
      <div className={`${mobilePanel === "details" ? "flex" : "hidden"} lg:flex w-full lg:w-80 h-full bg-[#FAF7F2] lg:border-l border-black/6 flex-col shrink-0`}>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h2 className="font-['Inter_Tight'] text-2xl font-bold text-[#111111]">{product.name}</h2>
            <p className="text-xs text-[#666666] mt-1">Crafted from premium cotton, featuring a structured, architectural drape.</p>
          </div>
          <div className="space-y-2">
            <span className="text-xs text-[#666666] tracking-widest uppercase">Base Color</span>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => { setColor(c.name); setSize(null); }}
                  title={c.name}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === c.name ? "border-[#111111] scale-110" : "border-transparent"}`}
                  style={{
                    backgroundColor: c.hex,
                    boxShadow: c.hex.toLowerCase() === "#ffffff" ? "inset 0 0 0 1px rgba(0,0,0,0.15)" : "none",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#666666] tracking-widest uppercase">Size</span>
              <button className="text-xs text-[#666666] underline hover:text-[#111111]">Size Guide</button>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {SIZE_ORDER.map((s) => {
                const available = availableSizes.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => available && setSize(s)}
                    disabled={!available}
                    className={`h-9 text-xs border transition-all ${
                      size === s ? "border-[#111111] bg-[#111111] text-white" : available ? "border-black/10 text-[#111111] hover:border-[#111111]" : "border-black/5 text-[#CCC] cursor-not-allowed"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          {product.isCustomizable && (
            <div className="bg-white border border-black/8 rounded p-3 space-y-1">
              <div className="flex justify-between text-xs text-[#666666]">
                <span>Base price</span><span>₹{pricing.customShirtBasePrice}</span>
              </div>
              <div className="flex justify-between text-xs text-[#666666]">
                <span>Print charge ({sidesPrinted} {sidesPrinted === 1 ? "side" : "sides"})</span>
                <span>₹{pricing.printChargePerSide * sidesPrinted}</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-black/6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#666666] tracking-widest uppercase">Total Price</span>
            <span className="font-['Inter_Tight'] text-xl font-bold text-[#111111]">₹{finalPrice.toLocaleString("en-IN")}</span>
          </div>
          <button
            onClick={handleSaveDraft}
            disabled={savingDraft}
            className="w-full border border-[#111111] text-[#111111] text-xs tracking-widest uppercase py-3 hover:bg-[#111111] hover:text-white transition-all disabled:opacity-50"
          >
            {savingDraft ? "Saving…" : draftSaved ? "Draft Saved ✓" : "Save Draft"}
          </button>
          {/* Mobile-only: Finish Design is also reachable here since the left panel is hidden on phones */}
          <button
            onClick={handleFinishDesign}
            disabled={saving}
            className="lg:hidden w-full bg-[#111111] text-white text-xs tracking-widest uppercase py-4 hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving…" : "Finish Design"}
          </button>
        </div>
      </div>
    </div>
  );
}