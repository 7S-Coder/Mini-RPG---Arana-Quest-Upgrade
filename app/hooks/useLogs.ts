"use client";

import { useState, useCallback } from "react";

export function useLogs(limit = 100) {
  const [logs, setLogs] = useState<React.ReactNode[]>([]);
  const pushLog = useCallback((node: React.ReactNode) => {
    setLogs((l) => {
      const next = [...l, node];
      return next.slice(Math.max(0, next.length - limit));
    });
  }, [limit]);
  const clearLogs = useCallback(() => setLogs([]), []);
  return { logs, pushLog, clearLogs };
}
