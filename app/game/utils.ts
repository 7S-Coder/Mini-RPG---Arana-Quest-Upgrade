export const uid = () => {
  try {
    // @ts-ignore
    if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
      // @ts-ignore
      return (crypto as any).randomUUID();
    }
  } catch (e) {}
  return `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
};

export const clampToViewport = (x?: number, y?: number) => {
  try {
    if (typeof window === 'undefined') return { x: x ?? 200, y: y ?? 120 };
    const padX = 48;
    const padTop = 80;
    const padBottom = 120;
    const w = window.innerWidth || 800;
    const h = window.innerHeight || 600;
    const cx = Math.min(Math.max(typeof x === 'number' ? x : w / 2, padX), Math.max(w - padX, padX));
    const cy = Math.min(Math.max(typeof y === 'number' ? y : h / 2, padTop), Math.max(h - padBottom, padTop));
    return { x: Math.round(cx), y: Math.round(cy) };
  } catch (e) {
    return { x: x ?? 200, y: y ?? 120 };
  }
};