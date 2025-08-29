// ===== types/stencil.ts (или в этом же файле, над компонентом) =====
export type StencilType = 'rect' | 'circle' | 'rect+circle';

export type StencilConfig = {
  type: StencilType;
  // прямоугольник под документ (ID/права)
  rect?: {
    aspect?: number;        // соотношение сторон (ширина/высота), по умолч. 1.58 для ID
    widthPct?: number;      // ширина “окна” в % от ширины экрана, по умолч. 80
    borderRadiusPct?: number; // скругление углов в % от ширины прямоугольника (напр. 2–4)
    offsetYPct?: number;    // вертикальный сдвиг, % высоты экрана (напр. -5 = чуть выше центра)
  };
  // круг под лицо
  circle?: {
    diameterPct?: number;   // диаметр круга в % от ширины экрана, по умолч. 55
    offsetYPct?: number;    // вертикальный сдвиг круга, % высоты экрана (напр. -10)
  };
};
