import React, { useEffect, useRef } from "react";

type Props = {
  logs: string[];
};

export default function LogMessages({ logs }: Props) {
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

  return (
    <div ref={containerRef} className="log-messages">
      {logs.map((l, i) => (
        <div key={i} className="log-line">{l}</div>
      ))}
    </div>
  );
}
