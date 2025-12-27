import React, { useEffect, useRef, useMemo } from "react";

type Props = {
  logs: React.ReactNode[];
  logColor?: string;
  inDungeonActive?: boolean;
};

const MAX_VISIBLE_LOGS = 50; // Limit visible logs to improve performance

export default function LogMessages({ logs, logColor, inDungeonActive }: Props) {
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

  // Memoize the visible logs slice to avoid unnecessary re-renders
  const visibleLogsWithKeys = useMemo(() => {
    const start = Math.max(0, logs.length - MAX_VISIBLE_LOGS);
    return logs.slice(start).map((log, idx) => ({
      key: `${start + idx}`,
      content: log,
    }));
  }, [logs]);

  // apply theme color as a subtle background tint for the log area
  const style = logColor ? { backgroundColor: hexToRgba(logColor, 0.08) } : undefined;
  return (
    <div
      ref={containerRef}
      className={`log-messages${inDungeonActive ? ' pulse-effect' : ''}`}
      style={style}
    >
      {visibleLogsWithKeys.map(({ key, content }) => (
        <div key={key} className="log-line">
          <div className="log-content">{content}</div>
        </div>
      ))}
    </div>
  );
}
