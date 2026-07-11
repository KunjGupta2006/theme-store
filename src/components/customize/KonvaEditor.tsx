"use client";

import { useRef, useEffect, useState } from "react";
import { Stage, Layer, Rect, Image as KonvaImage, Transformer, Text } from "react-konva";
import useImage from "use-image";
import type Konva from "konva";

type Side = "front" | "back";

interface KonvaEditorProps {
  color: string;
  side: Side;
  designUrl: string | null;
  onDesignChange?: (url: string | null) => void;
  mockupUrl?: string | null;
}

const STAGE_WIDTH = 380;
const STAGE_HEIGHT = 460;
// Print area (centered on shirt)
const PRINT_X = 115;
const PRINT_Y = 100;
const PRINT_W = 150;
const PRINT_H = 180;

function DesignImage({
  url,
  isSelected,
  onSelect,
  onChange,
}: {
  url: string;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (attrs: { x: number; y: number; width: number; height: number; rotation: number }) => void;
}) {
  const [image] = useImage(url, "anonymous");
  const imgRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && imgRef.current) {
      trRef.current.nodes([imgRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        ref={imgRef}
        image={image}
        x={PRINT_X + 10}
        y={PRINT_Y + 10}
        width={PRINT_W - 20}
        height={PRINT_H - 20}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
            width: e.target.width(),
            height: e.target.height(),
            rotation: e.target.rotation(),
          });
        }}
        onTransformEnd={() => {
          const node = imgRef.current!;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(20, node.width() * scaleX),
            height: Math.max(20, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) return oldBox;
            return newBox;
          }}
          rotateEnabled
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
        />
      )}
    </>
  );
}

export default function KonvaEditor({ side, designUrl, mockupUrl }: KonvaEditorProps) {
  const [selected, setSelected] = useState(true);
  const [mockupImg] = useImage(mockupUrl ?? "", "anonymous");

  const shirtBg = "#f5f5f5";
  const shirtStroke = "#ddd";
  const printAreaColor = "rgba(0,0,0,0.04)";
  const printAreaStroke = "rgba(0,0,0,0.15)";
  const labelColor = "rgba(0,0,0,0.25)";

  return (
    <div className="relative select-none shadow-2xl">
      <Stage
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) setSelected(false);
        }}
      >
        <Layer>
          {mockupUrl && mockupImg ? (
            <KonvaImage image={mockupImg} x={0} y={0} width={STAGE_WIDTH} height={STAGE_HEIGHT} />
          ) : (
            <>
              <Rect x={60} y={60} width={260} height={360} fill={shirtBg} stroke={shirtStroke} strokeWidth={1} cornerRadius={8} />
              <Rect x={155} y={55} width={70} height={30} fill={shirtBg} stroke={shirtStroke} strokeWidth={1} cornerRadius={[0, 0, 12, 12]} />
              <Rect x={20} y={60} width={55} height={80} fill={shirtBg} stroke={shirtStroke} strokeWidth={1} cornerRadius={[4, 0, 0, 4]} />
              <Rect x={305} y={60} width={55} height={80} fill={shirtBg} stroke={shirtStroke} strokeWidth={1} cornerRadius={[0, 4, 4, 0]} />
            </>
          )}

          {/* Print area */}
          <Rect
            x={PRINT_X}
            y={PRINT_Y}
            width={PRINT_W}
            height={PRINT_H}
            fill={printAreaColor}
            stroke={printAreaStroke}
            strokeWidth={1}
            dash={[4, 4]}
            cornerRadius={2}
          />

          {/* Print area label */}
          {!designUrl && (
            <Text
              x={PRINT_X}
              y={PRINT_Y + PRINT_H / 2 - 16}
              width={PRINT_W}
              text={`${side.toUpperCase()} PRINT AREA`}
              fontSize={10}
              fill={labelColor}
              align="center"
            />
          )}
          {!designUrl && (
            <Text
              x={PRINT_X}
              y={PRINT_Y + PRINT_H / 2}
              width={PRINT_W}
              text="Upload or select a design"
              fontSize={9}
              fill={labelColor}
              align="center"
            />
          )}
        </Layer>

        {/* Design layer */}
        <Layer>
          {designUrl && (
            <DesignImage
              url={designUrl}
              isSelected={selected}
              onSelect={() => setSelected(true)}
              onChange={() => {}}
            />
          )}
        </Layer>
      </Stage>

      {/* Side label */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center">
        <span className="text-[10px] tracking-widest uppercase text-[#999] bg-[#F5F1EA]/80 px-2 py-0.5 rounded">
          {side} view
        </span>
      </div>
    </div>
  );
}