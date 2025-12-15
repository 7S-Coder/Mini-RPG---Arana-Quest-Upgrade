import { useEffect, useState, useCallback } from "react";

type Allocated = {
  hp: number;
  dmg: number;
  def: number;
  crit: number;
  dodge: number;
};

type ProgressionState = {
  points: number;
  allocated: Allocated;
};

const PROGRESSION_KEY = "arenaquest_progression_v1";

export default function useProgression() {
  const [state, setState] = useState<ProgressionState>({
    points: 0,
    allocated: { hp: 0, dmg: 0, def: 0, crit: 0, dodge: 0 },
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROGRESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ProgressionState;
        setState((s) => ({ ...s, ...parsed }));
      }
    } catch (e) {
      try { console.error('useProgression load error', e); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESSION_KEY, JSON.stringify(state));
    } catch (e) {
      try { console.error('useProgression save error', e); } catch (e) {}
    }
  }, [state]);

  const COSTS: Record<keyof Allocated, number> = { hp: 1, dmg: 2, def: 3, crit: 3, dodge: 3 };

  const addPoints = useCallback((n: number) => {
    if (!n || n <= 0) return;
    try { console.log('[useProgression] addPoints ->', n); } catch (e) {}
    setState((s) => {
      const next = (s.points || 0) + n;
      try { console.log('[useProgression] points', s.points, '=>', next); } catch (e) {}
      return { ...s, points: next };
    });
  }, []);

  const allocateFn = useCallback((stat: keyof Allocated) => {
    const cost = COSTS[stat] || 1;
    setState((s) => {
      if ((s.points || 0) < cost) return s;
      return { ...s, points: s.points - cost, allocated: { ...s.allocated, [stat]: (s.allocated[stat] || 0) + 1 } };
    });
  }, []);

  const deallocateFn = useCallback((stat: keyof Allocated) => {
    const cost = COSTS[stat] || 1;
    setState((s) => {
      if (!s.allocated || (s.allocated[stat] || 0) <= 0) return s;
      return { ...s, points: s.points + cost, allocated: { ...s.allocated, [stat]: (s.allocated[stat] || 0) - 1 } };
    });
  }, []);

  const reset = useCallback(() => setState({ points: 0, allocated: { hp: 0, dmg: 0, def: 0, crit: 0, dodge: 0 } }), []);

  return {
    progression: state,
    addPoints,
    allocate: (s: keyof Allocated) => allocateFn(s),
    deallocate: (s: keyof Allocated) => deallocateFn(s),
    reset,
  } as const;
}
