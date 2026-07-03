"use client";

import { useRef, useEffect } from "react";
import { Stage, Layer, Rect, Image as KonvaImage, Transformer, Text as KonvaText } from "react-konva";
import useImage from "use-image";
import type Konva from "konva";

export type Side = "front" | "back";
export type ElementType = "image" | "text";

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
  fill?: string;
  baseWidth: number;
  baseHeight: number;
  baseFontSize?: number;
}

export interface DesignCanvasApi {
  exportDesign: () => string | null;
}

interface DesignCanvasProps {
  color: "BLACK" | "WHITE";
  side: Side;
  elements: DesignElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (id: string, attrs: Partial<DesignElement>) => void;
  active: boolean;
  onReady?: (api: DesignCanvasApi) => void;
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
  el, isSelected, onSelect, onChange,
}: { el: DesignElement; isSelected: boolean; onSelect: () => void; onChange: (a: Partial<DesignElement>) => void }) {
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
        text={el.text ?? "Your Text"}
        x={el.x} y={el.y} width={el.width}
        fontSize={el.fontSize ?? 24}
        fontFamily="Inter Tight"
        fill={el.fill ?? "#ffffff"}
        rotation={el.rotation}
        align="center"
        draggable
        onClick={onSelect}
        onTap={onSelect}
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

export default function DesignCanvas({ color, side, elements, selectedId, onSelect, onChange, active, onReady }: DesignCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const guideLayerRef = useRef<Konva.Layer>(null);
  const shirtLayerRef = useRef<Konva.Layer>(null);
  const [shirtImage] = useImage(`/mockups/tshirt-${color.toLowerCase()}-${side}.png`, "anonymous");

  useEffect(() => {
    onReady?.({
      exportDesign: () => {
        const stage = stageRef.current;
        if (!stage) return null;
        guideLayerRef.current?.hide();
        shirtLayerRef.current?.hide();
        const dataUrl = stage.toDataURL({ pixelRatio: 2 });
        guideLayerRef.current?.show();
        shirtLayerRef.current?.show();
        return dataUrl;
      },
    });
  });

  const sideElements = elements.filter((e) => e.side === side);

  return (
    <div className="relative select-none shadow-2xl" style={{ pointerEvents: active ? "auto" : "none" }}>
      <Stage
        ref={stageRef}
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        onMouseDown={(e) => { if (e.target === e.target.getStage()) onSelect(null); }}
      >
        <Layer ref={shirtLayerRef}>
          {shirtImage ? (
            <KonvaImage image={shirtImage} x={0} y={0} width={STAGE_WIDTH} height={STAGE_HEIGHT} />
          ) : (
            <Rect
              x={40} y={40} width={STAGE_WIDTH - 80} height={STAGE_HEIGHT - 80}
              fill={color === "BLACK" ? "#1a1a1a" : "#f5f5f5"}
              stroke={color === "BLACK" ? "#333" : "#ddd"}
              cornerRadius={12}
            />
          )}
        </Layer>

        <Layer ref={guideLayerRef} listening={false}>
          <Rect
            x={PRINT_X} y={PRINT_Y} width={PRINT_W} height={PRINT_H}
            stroke={color === "BLACK" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)"}
            dash={[4, 4]} cornerRadius={2}
          />
        </Layer>

        <Layer>
          {sideElements.map((el) =>
            el.type === "image" ? (
              <ImageLayer key={el.id} el={el} isSelected={el.id === selectedId} onSelect={() => onSelect(el.id)} onChange={(a) => onChange(el.id, a)} />
            ) : (
              <TextLayer key={el.id} el={el} isSelected={el.id === selectedId} onSelect={() => onSelect(el.id)} onChange={(a) => onChange(el.id, a)} />
            )
          )}
        </Layer>
      </Stage>
    </div>
  );
}