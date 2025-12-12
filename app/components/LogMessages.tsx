import React, { useEffect, useRef } from "react";

type Props = {
  logs: string[];
  logColor?: string;
};

export default function LogMessages({ logs, logColor }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // scroll to bottom when logs update
    // use requestAnimationFrame to ensure DOM updated
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [logs.length]);

  // helper: convert hex color to rgba with provided alpha
  const hexToRgba = (hex: string, alpha = 1) => {
    try {
      const h = hex.replace('#', '');
      const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (e) {
      return hex;
    }
  };

  // apply theme color as a subtle background tint for the log area
  const style = logColor ? { backgroundColor: hexToRgba(logColor, 0.12) } : undefined;
  return (
    <div ref={containerRef} className="log-messages" style={style}>
      {logs.map((l, i) => (
        <div key={i} className="log-line">{l}</div>
      ))}
    </div>
  );
}
