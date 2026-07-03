"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  Stage, Layer, Rect, Ellipse, Line, Arrow,
  Image as KonvaImage, Transformer, Text as KonvaText, Group,
} from "react-konva";
import useImage from "use-image";
import type Konva from "konva";

export type Side = "front" | "back";
export type ToolType = "select" | "brush" | "eraser" | "rect" | "ellipse" | "line" | "arrow" | "text" | "image";

export interface DesignElement {
  id: string;
  type: "image" | "text" | "freedraw" | "shape";
  side: Side;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  visible: boolean;
  name: string;
  baseWidth: number;
  baseHeight: number;
  opacity: number;
  // image
  src?: string;
  // text
  text?: string;
  fontSize?: number;
  baseFontSize?: number;
  fontColor?: string;
  fontFamily?: string;
  fontStyle?: string;
  // freedraw
  points?: number[];
  strokeColor?: string;
  strokeWidth?: number;
  isEraser?: boolean;
  tension?: number;
  // shape
  shapeKind?: "rect" | "ellipse" | "line" | "arrow";
  fillColor?: string;
  strokeShapeColor?: string;
  strokeShapeWidth?: number;
  hasFill?: boolean;
  dashEnabled?: boolean;
}

export interface DesignCanvasApi {
  exportDesign: () => string | null;
}

interface DesignCanvasProps {
  color: "BLACK" | "WHITE";
  side: Side;
  elements: DesignElement[];
  selectedId: string | null;
  tool: ToolType;
  brushColor: string;
  brushSize: number;
  brushOpacity: number;
  fillShapes: boolean;
  shapeDash: boolean;
  onSelect: (id: string | null) => void;
  onChange: (id: string, attrs: Partial<DesignElement>) => void;
  onAdd: (el: DesignElement) => void;
  active: boolean;
  onReady?: (api: DesignCanvasApi) => void;
}

export const STAGE_WIDTH = 440;
export const STAGE_HEIGHT = 520;
export const PRINT_X = 135;
export const PRINT_Y = 128;
export const PRINT_W = 170;
export const PRINT_H = 210;

// ── Image element ──────────────────────────────────────────────────────────
function ImageEl({
  el, isSelected, onSelect, onChange,
}: { el: DesignElement; isSelected: boolean; onSelect: () => void; onChange: (a: Partial<DesignElement>) => void }) {
  const [image] = useImage(el.src ?? "", "anonymous");
  const ref = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  useEffect(() => {
    if (isSelected && trRef.current && ref.current) {
      trRef.current.nodes([ref.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);
  if (!el.visible) return null;
  return (
    <>
      <KonvaImage
        ref={ref} image={image}
        x={el.x} y={el.y} width={el.width} height={el.height}
        rotation={el.rotation} opacity={el.opacity / 100}
        draggable onClick={onSelect} onTap={onSelect}
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const n = ref.current!;
          const sx = n.scaleX(), sy = n.scaleY();
          n.scaleX(1); n.scaleY(1);
          onChange({ x: n.x(), y: n.y(), width: Math.max(10, n.width() * sx), height: Math.max(10, n.height() * sy), rotation: n.rotation() });
        }}
      />
      {isSelected && (
        <Transformer ref={trRef} rotateEnabled
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          boundBoxFunc={(o, n) => (n.width < 10 || n.height < 10 ? o : n)} />
      )}
    </>
  );
}

// ── Text element ───────────────────────────────────────────────────────────
function TextEl({
  el, isSelected, onSelect, onChange,
}: { el: DesignElement; isSelected: boolean; onSelect: () => void; onChange: (a: Partial<DesignElement>) => void }) {
  const ref = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);
  useEffect(() => {
    if (isSelected && trRef.current && ref.current) {
      trRef.current.nodes([ref.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);
  if (!el.visible) return null;
  return (
    <>
      <KonvaText
        ref={ref} text={el.text ?? "Text"} x={el.x} y={el.y} width={el.width}
        fontSize={el.fontSize ?? 24} fontFamily={el.fontFamily ?? "Inter Tight"}
        fontStyle={el.fontStyle ?? "bold"} fill={el.fontColor ?? "#ffffff"}
        rotation={el.rotation} opacity={el.opacity / 100} align="center"
        draggable onClick={onSelect} onTap={onSelect}
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const n = ref.current!;
          const sx = n.scaleX(); n.scaleX(1); n.scaleY(1);
          onChange({ x: n.x(), y: n.y(), width: Math.max(40, n.width() * sx), fontSize: Math.max(8, (el.fontSize ?? 24) * sx), rotation: n.rotation() });
        }}
      />
      {isSelected && <Transformer ref={trRef} rotateEnabled enabledAnchors={["middle-left", "middle-right"]} />}
    </>
  );
}

// ── Shape element ──────────────────────────────────────────────────────────
function ShapeEl({
  el, isSelected, onSelect, onChange,
}: { el: DesignElement; isSelected: boolean; onSelect: () => void; onChange: (a: Partial<DesignElement>) => void }) {
  const ref = useRef<Konva.Rect | Konva.Ellipse | null>(null);
  const trRef = useRef<Konva.Transformer>(null);
  useEffect(() => {
    if (isSelected && trRef.current && ref.current) {
      trRef.current.nodes([ref.current as unknown as Konva.Node]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);
  if (!el.visible) return null;

  const shared = {
    x: el.x, y: el.y, rotation: el.rotation, opacity: el.opacity / 100,
    fill: el.hasFill ? (el.fillColor ?? "transparent") : "transparent",
    stroke: el.strokeShapeColor ?? "#ffffff", strokeWidth: el.strokeShapeWidth ?? 2,
    dash: el.dashEnabled ? [6, 4] : undefined,
    draggable: true, onClick: onSelect, onTap: onSelect,
    onDragEnd: (e: Konva.KonvaEventObject<MouseEvent>) => onChange({ x: e.target.x(), y: e.target.y() }),
    onTransformEnd: () => {
      const n = ref.current as unknown as Konva.Node;
      const sx = n.scaleX(), sy = n.scaleY();
      n.scaleX(1); n.scaleY(1);
      onChange({ x: n.x(), y: n.y(), width: Math.max(10, el.width * sx), height: Math.max(10, el.height * sy), rotation: n.rotation() });
    },
  };

  return (
    <>
      {el.shapeKind === "ellipse" ? (
        <Ellipse
          ref={ref as React.RefObject<Konva.Ellipse>}
          radiusX={el.width / 2} radiusY={el.height / 2}
          {...shared}
        />
      ) : (
        <Rect
          ref={ref as React.RefObject<Konva.Rect>}
          width={el.width} height={el.height}
          cornerRadius={el.shapeKind === "rect" ? 0 : 0}
          {...shared}
        />
      )}
      {isSelected && (
        <Transformer ref={trRef} rotateEnabled
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          boundBoxFunc={(o, n) => (n.width < 10 || n.height < 10 ? o : n)} />
      )}
    </>
  );
}

// ── Main Canvas ────────────────────────────────────────────────────────────
export default function DesignCanvas({
  color, side, elements, selectedId, tool, brushColor, brushSize, brushOpacity,
  fillShapes, shapeDash, onSelect, onChange, onAdd, active, onReady,
}: DesignCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const guideRef = useRef<Konva.Layer>(null);
  const shirtRef = useRef<Konva.Layer>(null);
  const drawRef = useRef<Konva.Layer>(null);

  const [shirtImg] = useImage(`/mockup/tshirt-${color.toLowerCase()}-${side}.png`, "anonymous");

  const isDrawing = useRef(false);
  const currentEl = useRef<DesignElement | null>(null);

  const sideEls = elements.filter((e) => e.side === side);

  useEffect(() => {
    onReady?.({
      exportDesign: () => {
        const stage = stageRef.current;
        if (!stage) return null;
        guideRef.current?.hide();
        shirtRef.current?.hide();
        const url = stage.toDataURL({ pixelRatio: 2 });
        guideRef.current?.show();
        shirtRef.current?.show();
        return url;
      },
    });
  });

  const getPos = () => {
    const pos = stageRef.current?.getPointerPosition();
    return pos ?? { x: 0, y: 0 };
  };

  const handleMouseDown = useCallback(() => {
    if (!active || tool === "select") return;
    const { x, y } = getPos();
    isDrawing.current = true;

    if (tool === "brush" || tool === "eraser") {
      const id = crypto.randomUUID();
      const el: DesignElement = {
        id, type: "freedraw", side,
        x: 0, y: 0, width: 0, height: 0, rotation: 0,
        visible: true, name: tool === "eraser" ? "Eraser" : "Brush",
        baseWidth: 0, baseHeight: 0, opacity: brushOpacity,
        points: [x, y],
        strokeColor: tool === "eraser" ? (color === "BLACK" ? "#111111" : "#f5f5f5") : brushColor,
        strokeWidth: tool === "eraser" ? brushSize * 2 : brushSize,
        isEraser: tool === "eraser",
        tension: 0.5,
      };
      currentEl.current = el;
      onAdd(el);
    } else if (tool === "text") {
      const text = window.prompt("Enter text");
      if (!text) return;
      const id = crypto.randomUUID();
      onAdd({
        id, type: "text", side, x, y, width: 150, height: 30,
        rotation: 0, visible: true, name: text, baseWidth: 150, baseHeight: 30,
        opacity: 100, text, fontSize: 24, baseFontSize: 24,
        fontColor: brushColor, fontFamily: "Inter Tight", fontStyle: "bold",
      });
      onSelect(id);
    } else {
      // rect, ellipse, line, arrow — start shape
      const id = crypto.randomUUID();
      const el: DesignElement = {
        id, type: "shape", side, x, y, width: 1, height: 1,
        rotation: 0, visible: true, name: tool, baseWidth: 1, baseHeight: 1,
        opacity: brushOpacity, shapeKind: tool as "rect" | "ellipse" | "line" | "arrow",
        fillColor: brushColor, hasFill: fillShapes,
        strokeShapeColor: brushColor, strokeShapeWidth: brushSize,
        dashEnabled: shapeDash,
      };
      currentEl.current = el;
      onAdd(el);
    }
  }, [active, tool, side, color, brushColor, brushSize, brushOpacity, fillShapes, shapeDash, onAdd, onSelect]);

  const handleMouseMove = useCallback(() => {
    if (!isDrawing.current || !currentEl.current) return;
    const { x, y } = getPos();
    const el = currentEl.current;

    if (el.type === "freedraw") {
      onChange(el.id, { points: [...(el.points ?? []), x, y] });
      currentEl.current = { ...el, points: [...(el.points ?? []), x, y] };
    } else if (el.type === "shape") {
      const w = x - el.x, h = y - el.y;
      onChange(el.id, { width: Math.abs(w) || 1, height: Math.abs(h) || 1 });
      currentEl.current = { ...el, width: Math.abs(w) || 1, height: Math.abs(h) || 1 };
    }
  }, [onChange]);

  const handleMouseUp = useCallback(() => {
    isDrawing.current = false;
    if (currentEl.current?.type === "shape") {
      onSelect(currentEl.current.id);
    }
    currentEl.current = null;
  }, [onSelect]);

  const guideFill = color === "BLACK" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.22)";
  const cursor =
    tool === "select" ? "default" :
    tool === "brush" ? "crosshair" :
    tool === "eraser" ? "cell" :
    tool === "text" ? "text" : "crosshair";

  return (
    <div className="relative select-none shadow-2xl" style={{ cursor, pointerEvents: active ? "auto" : "none" }}>
      <Stage
        ref={stageRef}
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onClick={(e) => { if (tool === "select" && e.target === e.target.getStage()) onSelect(null); }}
      >
        {/* Shirt mockup */}
        <Layer ref={shirtRef} listening={false}>
          {shirtImg ? (
            <KonvaImage image={shirtImg} x={0} y={0} width={STAGE_WIDTH} height={STAGE_HEIGHT} />
          ) : (
            <>
              <Rect x={60} y={55} width={320} height={420} fill={color === "BLACK" ? "#1a1a1a" : "#f0f0f0"} cornerRadius={10} />
              <Rect x={160} y={48} width={120} height={40} fill={color === "BLACK" ? "#1a1a1a" : "#f0f0f0"} cornerRadius={[0, 0, 14, 14]} />
              <Rect x={18} y={55} width={55} height={100} fill={color === "BLACK" ? "#1a1a1a" : "#f0f0f0"} cornerRadius={[6, 0, 0, 6]} />
              <Rect x={367} y={55} width={55} height={100} fill={color === "BLACK" ? "#1a1a1a" : "#f0f0f0"} cornerRadius={[0, 6, 6, 0]} />
            </>
          )}
        </Layer>

        {/* Elements */}
        <Layer ref={drawRef}>
          {sideEls.map((el) => {
            const shared = {
              el, isSelected: el.id === selectedId,
              onSelect: () => tool === "select" && onSelect(el.id),
              onChange: (a: Partial<DesignElement>) => onChange(el.id, a),
            };
            if (el.type === "image") return <ImageEl key={el.id} {...shared} />;
            if (el.type === "text") return <TextEl key={el.id} {...shared} />;
            if (el.type === "shape") return <ShapeEl key={el.id} {...shared} />;
            if (el.type === "freedraw" && el.points) {
              return (
                <Line
                  key={el.id}
                  points={el.points}
                  stroke={el.strokeColor}
                  strokeWidth={el.strokeWidth}
                  tension={el.tension ?? 0.5}
                  lineCap="round"
                  lineJoin="round"
                  opacity={el.opacity / 100}
                  globalCompositeOperation={el.isEraser ? "destination-out" : "source-over"}
                  listening={tool === "select"}
                  onClick={() => tool === "select" && onSelect(el.id)}
                />
              );
            }
            return null;
          })}
        </Layer>

        {/* Print area guide */}
        <Layer ref={guideRef} listening={false}>
          <Rect
            x={PRINT_X} y={PRINT_Y} width={PRINT_W} height={PRINT_H}
            stroke={guideFill} strokeWidth={1} dash={[5, 4]}
          />
        </Layer>
      </Stage>

      <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
        <span className="text-[9px] tracking-widest uppercase text-[#999]/70 bg-[#F5F1EA]/70 px-2 py-0.5 rounded">
          {side} — print area outlined
        </span>
      </div>
    </div>
  );
}