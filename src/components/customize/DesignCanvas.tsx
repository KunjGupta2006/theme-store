"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Rect, Image as KonvaImage, Transformer, Text as KonvaText, Line } from "react-konva";
import useImage from "use-image";
import type Konva from "konva";

export type Side = "front" | "back";
export type ElementType = "image" | "text" | "path";

export interface DesignElement {
  id: string;
  type: ElementType;
  side: Side;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  visible: boolean;
  name: string;
  src?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string; // "normal" | "bold" | "italic" | "italic bold"
  fill?: string;
  baseWidth: number;
  baseHeight: number;
  baseFontSize?: number;
  points?: number[];
  stroke?: string;
  strokeWidth?: number;
}

export interface DesignCanvasApi {
  exportDesign: () => string | null;
  /** Forces any open inline text edit to save immediately — call before exporting. */
  commitPendingEdit: () => void;
}

interface DesignCanvasProps {
  color: string;
  side: Side;
  elements: DesignElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (id: string, attrs: Partial<DesignElement>) => void;
  active: boolean;
  onReady?: (api: DesignCanvasApi) => void;
  paintMode?: boolean;
  brushColor?: string;
  brushSize?: number;
  onPathComplete?: (points: number[]) => void;
  mockupUrl?: string | null;
}

export const STAGE_WIDTH = 440;
export const STAGE_HEIGHT = 520;
export const PRINT_X = 140;
export const PRINT_Y = 130;
export const PRINT_W = 160;
export const PRINT_H = 200;

function ImageLayer({
  el, isSelected, onSelect, onChange,
}: { el: DesignElement; isSelected: boolean; onSelect: () => void; onChange: (a: Partial<DesignElement>) => void }) {
  const [image] = useImage(el.src ?? "", "anonymous");
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);
  if (!el.visible) return null;
  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={image}
        x={el.x} y={el.y} width={el.width} height={el.height} rotation={el.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current!;
          const scaleX = node.scaleX(), scaleY = node.scaleY();
          node.scaleX(1); node.scaleY(1);
          onChange({
            x: node.x(), y: node.y(),
            width: Math.max(20, node.width() * scaleX),
            height: Math.max(20, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          boundBoxFunc={(oldBox, newBox) => (newBox.width < 20 || newBox.height < 20 ? oldBox : newBox)}
        />
      )}
    </>
  );
}

function TextLayer({
  el, isSelected, onSelect, onChange, onDblEdit,
}: {
  el: DesignElement; isSelected: boolean; onSelect: () => void;
  onChange: (a: Partial<DesignElement>) => void; onDblEdit: () => void;
}) {
  const shapeRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);
  if (!el.visible) return null;
  return (
    <>
      <KonvaText
        ref={shapeRef}
        text={el.text || "Double-click to edit"}
        x={el.x} y={el.y} width={el.width}
        fontSize={el.fontSize ?? 24}
        fontFamily={el.fontFamily ?? "Inter Tight"}
        fontStyle={el.fontStyle ?? "normal"}
        fill={el.fill ?? "#ffffff"}
        opacity={el.text ? 1 : 0.45}
        rotation={el.rotation}
        align="center"
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={onDblEdit}
        onDblTap={onDblEdit}
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current!;
          const scaleX = node.scaleX();
          node.scaleX(1); node.scaleY(1);
          onChange({
            x: node.x(), y: node.y(),
            width: Math.max(40, node.width() * scaleX),
            fontSize: Math.max(8, (el.fontSize ?? 24) * scaleX),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} rotateEnabled enabledAnchors={["middle-left", "middle-right"]} />}
    </>
  );
}

function PathLayer({
  el, isSelected, onSelect, onChange,
}: { el: DesignElement; isSelected: boolean; onSelect: () => void; onChange: (a: Partial<DesignElement>) => void }) {
  const shapeRef = useRef<Konva.Line>(null);
  const trRef = useRef<Konva.Transformer>(null);
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);
  if (!el.visible) return null;
  return (
    <>
      <Line
        ref={shapeRef}
        points={el.points ?? []}
        stroke={el.stroke ?? "#111111"}
        strokeWidth={el.strokeWidth ?? 6}
        lineCap="round"
        lineJoin="round"
        tension={0.4}
        x={el.x} y={el.y} rotation={el.rotation}
        draggable
        hitStrokeWidth={Math.max(20, el.strokeWidth ?? 6)}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current!;
          const scaleX = node.scaleX(), scaleY = node.scaleY();
          node.scaleX(1); node.scaleY(1);
          const scaledPoints = (el.points ?? []).map((p, i) => (i % 2 === 0 ? p * scaleX : p * scaleY));
          onChange({
            x: node.x(), y: node.y(), rotation: node.rotation(),
            points: scaledPoints,
            strokeWidth: (el.strokeWidth ?? 6) * ((scaleX + scaleY) / 2),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
        />
      )}
    </>
  );
}

export default function DesignCanvas({
  color, side, elements, selectedId, onSelect, onChange, active, onReady,
  paintMode = false, brushColor = "#111111", brushSize = 6, onPathComplete, mockupUrl,
}: DesignCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const guideLayerRef = useRef<Konva.Layer>(null);
  const shirtLayerRef = useRef<Konva.Layer>(null);
  const shirtUrl = mockupUrl ?? `/mockup/${color.toLowerCase()}-${side}.png`;
  const [shirtImage] = useImage(shirtUrl, "anonymous");

  const [isDrawing, setIsDrawing] = useState(false);
  const [livePoints, setLivePoints] = useState<number[]>([]);
  const drawingRef = useRef(false);

  // ─── Inline text editing (replaces window.prompt) ───────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingValueRef = useRef("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const startEditingText = useCallback((el: DesignElement) => {
    editingValueRef.current = el.text ?? "";
    setEditingId(el.id);
    onSelect(el.id);
  }, [onSelect]);

  const commitEditingText = useCallback(() => {
    setEditingId((currentId) => {
      if (currentId) {
        onChange(currentId, { text: editingValueRef.current.trim() });
      }
      return null;
    });
  }, [onChange]);

  useEffect(() => {
    if (editingId && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editingId]);

  // Auto-enter edit mode for a freshly-created, still-empty text element on this side.
  useEffect(() => {
    const blank = elements.find((e) => e.side === side && e.type === "text" && !e.text);
    if (blank && editingId !== blank.id) {
      const elementToEdit = blank;
      const timeoutId = window.setTimeout(() => {
        startEditingText(elementToEdit);
      }, 0);
      return () => {
        window.clearTimeout(timeoutId);
      };
    }
    return undefined;
  }, [elements, side, editingId, startEditingText]);

  useEffect(() => {
    onReady?.({
      exportDesign: () => {
        const stage = stageRef.current;
        if (!stage) return null;
        guideLayerRef.current?.hide();
        shirtLayerRef.current?.hide();
        const transformers = stage.find("Transformer");
        transformers.forEach((tr) => tr.hide());
        stage.batchDraw();
        const dataUrl = stage.toDataURL({
          x: PRINT_X,
          y: PRINT_Y,
          width: PRINT_W,
          height: PRINT_H,
          pixelRatio: 2,
          mimeType: 'image/png',
        });
        transformers.forEach((tr) => tr.show());
        guideLayerRef.current?.show();
        shirtLayerRef.current?.show();
        stage.batchDraw();
        return dataUrl;
      },
      commitPendingEdit: () => {
        if (editingId) commitEditingText();
      },
    });
  });

  const getPointerPos = useCallback(() => {
    const stage = stageRef.current;
    return stage?.getPointerPosition() ?? null;
  }, []);

  const handlePointerDown = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!paintMode) {
      if (e.target === e.target.getStage()) onSelect(null);
      return;
    }
    const pos = getPointerPos();
    if (!pos) return;
    drawingRef.current = true;
    setIsDrawing(true);
    setLivePoints([pos.x, pos.y]);
  }, [paintMode, onSelect, getPointerPos]);

  const handlePointerMove = useCallback(() => {
    if (!paintMode || !drawingRef.current) return;
    const pos = getPointerPos();
    if (!pos) return;
    setLivePoints((prev) => [...prev, pos.x, pos.y]);
  }, [paintMode, getPointerPos]);

  const handlePointerUp = useCallback(() => {
    if (!paintMode || !drawingRef.current) return;
    drawingRef.current = false;
    setIsDrawing(false);
    setLivePoints((prev) => {
      if (prev.length >= 4) onPathComplete?.(prev);
      return [];
    });
  }, [paintMode, onPathComplete]);

  const sideElements = elements.filter((e) => e.side === side);
  const editingEl = editingId ? sideElements.find((e) => e.id === editingId) : null;

  return (
    <div
      className="relative select-none shadow-2xl"
      style={{ pointerEvents: active ? "auto" : "none", cursor: paintMode ? "crosshair" : "default" }}
    >
      <Stage
        ref={stageRef}
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        <Layer ref={shirtLayerRef}>
          {shirtImage ? (
            <KonvaImage image={shirtImage} x={0} y={0} width={STAGE_WIDTH} height={STAGE_HEIGHT} />
          ) : (
            <Rect
              x={40} y={40} width={STAGE_WIDTH - 80} height={STAGE_HEIGHT - 80}
              fill="#f5f5f5"
              stroke="#ddd"
              cornerRadius={12}
            />
          )}
        </Layer>
        <Layer ref={guideLayerRef} listening={false}>
          <Rect
            x={PRINT_X} y={PRINT_Y} width={PRINT_W} height={PRINT_H}
            stroke="rgba(0,0,0,0.25)"
            dash={[4, 4]} cornerRadius={2}
          />
        </Layer>
        <Layer listening={!paintMode}>
          {sideElements.map((el) => {
            if (el.id === editingId) return null; // hidden while the HTML overlay is active
            if (el.type === "image") {
              return <ImageLayer key={el.id} el={el} isSelected={el.id === selectedId} onSelect={() => onSelect(el.id)} onChange={(a) => onChange(el.id, a)} />;
            }
            if (el.type === "text") {
              return (
                <TextLayer
                  key={el.id}
                  el={el}
                  isSelected={el.id === selectedId}
                  onSelect={() => onSelect(el.id)}
                  onChange={(a) => onChange(el.id, a)}
                  onDblEdit={() => startEditingText(el)}
                />
              );
            }
            return <PathLayer key={el.id} el={el} isSelected={el.id === selectedId} onSelect={() => onSelect(el.id)} onChange={(a) => onChange(el.id, a)} />;
          })}
        </Layer>
        {paintMode && (
          <Layer listening={false}>
            {isDrawing && livePoints.length >= 2 && (
              <Line points={livePoints} stroke={brushColor} strokeWidth={brushSize} lineCap="round" lineJoin="round" tension={0.4} />
            )}
          </Layer>
        )}
      </Stage>

      {/* Inline text-edit overlay — replaces window.prompt() */}
      {editingEl && (
        <textarea
          ref={textareaRef}
          defaultValue={editingEl.text ?? ""}
          onFocus={(e) => e.target.select()}
          onChange={(e) => { editingValueRef.current = e.target.value; }}
          onBlur={commitEditingText}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitEditingText(); }
            if (e.key === "Escape") { e.preventDefault(); setEditingId(null); }
          }}
          rows={1}
          style={{
            position: "absolute",
            left: editingEl.x,
            top: editingEl.y,
            width: editingEl.width,
            minHeight: (editingEl.fontSize ?? 24) * 1.4,
            fontSize: editingEl.fontSize ?? 24,
            fontFamily: editingEl.fontFamily ?? "Inter Tight",
            fontStyle: (editingEl.fontStyle ?? "normal").includes("italic") ? "italic" : "normal",
            fontWeight: (editingEl.fontStyle ?? "normal").includes("bold") ? 700 : 400,
            color: editingEl.fill ?? "#111111",
            textAlign: "center",
            background: "rgba(255,255,255,0.18)",
            border: "1px dashed rgba(0,0,0,0.45)",
            outline: "none",
            resize: "none",
            overflow: "hidden",
            lineHeight: 1.2,
            padding: 0,
            transform: `rotate(${editingEl.rotation}deg)`,
            transformOrigin: "top left",
          }}
        />
      )}
    </div>
  );
}