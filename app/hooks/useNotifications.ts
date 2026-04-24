'use client';

import { useState, useCallback } from 'react';

const LS_STAT = 'aq_notif_stat_points';

const readLS = (key: string) => {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(key) || '0', 10) || 0;
};

export function useNotifications() {
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
  const [newStatPoints, setNewStatPoints] = useState(() => readLS(LS_STAT));

  const addNewItem = useCallback((id: string) => {
    setNewItemIds(prev => new Set([...prev, id]));
  }, []);

  const markInventorySeen = useCallback(() => {
    setNewItemIds(new Set());
  }, []);

  const addNewStatPoints = useCallback((n: number) => {
    setNewStatPoints(prev => {
      const next = prev + n;
      try { localStorage.setItem(LS_STAT, String(next)); } catch {}
      return next;
    });
  }, []);

  const markStatsSeen = useCallback(() => {
    setNewStatPoints(0);
    try { localStorage.setItem(LS_STAT, '0'); } catch {}
  }, []);

  return {
    newItemIds,
    newStatPoints,
    addNewItem,
    markInventorySeen,
    addNewStatPoints,
    markStatsSeen,
  };
}
