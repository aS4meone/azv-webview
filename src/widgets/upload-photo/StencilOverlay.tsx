// ===== StencilOverlay.tsx =====
import React from "react";
import { StencilConfig } from "./types/stencil"; // путь поправьте под ваш проект

type Props = {
  stencil?: StencilConfig;
  visible: boolean;
};

export const StencilOverlay: React.FC<Props> = ({ stencil, visible }) => {
  if (!visible || !stencil) return null;

  const rect = stencil.rect ?? {};
  const circle = stencil.circle ?? {};

  const rectWidth = rect.widthPct ?? 80;            // % от ширины экрана
  const rectAspect = rect.aspect ?? 1.58;
  const rectRadius = rect.borderRadiusPct ?? 3;
  const rectOffsetY = rect.offsetYPct ?? 0;

  const circDia = circle.diameterPct ?? 55;         // % от ширины экрана
  const circOffsetY = circle.offsetYPct ?? 0;

  // Базовый слой затемнения
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* затемнение фона */}
      <div className="absolute inset-0 bg-black/45" />

      {/* рамки */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* контейнер по центру, позволяющий смещать по Y */}
        <div className="relative w-full h-full">
          {/* CIRCLE */}
          {(stencil.type === "circle" || stencil.type === "rect+circle") && (
            <div
              className="absolute left-1/2 -translate-x-1/2 border-2 border-white/90 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
              style={{
                width: `${circDia}vw`,
                height: `${circDia}vw`,
                top: `calc(50% + ${circOffsetY}vh - ${(circDia / 2)}vw)`,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)", // для псевдо-“вырезания”
              }}
            />
          )}

          {/* RECT */}
          {(stencil.type === "rect" || stencil.type === "rect+circle") && (
            <div
              className="absolute left-1/2 -translate-x-1/2 border-2 border-white/90 rounded-[2.5%] shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
              style={{
                width: `${rectWidth}vw`,
                height: `calc(${rectWidth}vw / ${rectAspect})`,
                borderRadius: `${rectRadius}%`,
                top: `calc(50% + ${rectOffsetY}vh - ((${rectWidth}vw / ${rectAspect}) / 2))`,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
              }}
            />
          )}
        </div>
      </div>

      {/* подсказка */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white/95 text-sm px-4">
        Сориентируйте документ/лицо внутри рамки
      </div>
    </div>
  );
};
