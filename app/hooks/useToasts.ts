"use client";

import { useState, useCallback } from "react";

type Toast = { 
  id: string; 
  text: string; 
  type?: 'ok' | 'error';
  icon?: string; // Optional SVG path or src for custom icon
};

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((text: string, type: 'ok' | 'error' = 'ok', ttl = 3000, icon?: string) => {
    const id = (typeof crypto !== 'undefined' && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    setToasts((t) => [...t, { id, text, type, icon }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ttl);
  }, []);
  return { toasts, addToast };
}
