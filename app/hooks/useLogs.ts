"use client";

import { useState, useCallback } from "react";

type LogEntry = {
  id: string;
  content: React.ReactNode;
};

export function useLogs(limit = 100) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const pushLog = useCallback((node: React.ReactNode) => {
    setLogs((l) => {
      const id = `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const next = [...l, { id, content: node }];
      return next.slice(Math.max(0, next.length - limit));
    });
  }, [limit]);
  
  const clearLogs = useCallback(() => setLogs([]), []);
  
  // Extract just the content for backward compatibility
  const logsContent = logs.map(log => log.content);
  
  return { logs: logsContent, pushLog, clearLogs, logsWithId: logs };
}
