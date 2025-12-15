import { useEffect, useState } from "react";

type Stats = {
  combats: number;
  kills: number;
  deaths: number;
  goldEarned: number;
  goldSpent: number;
};

const STATS_KEY = "arenaquest_stats_v1";

export default function useStatistics() {
  const [stats, setStats] = useState<Stats>({ combats: 0, kills: 0, deaths: 0, goldEarned: 0, goldSpent: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STATS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setStats((s) => ({ ...s, ...(parsed || {}) }));
    } catch (e) {}
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch (e) {}
    }, 30000);
    return () => clearInterval(t);
  }, [stats]);

  const record = {
    combat: () => setStats((s) => ({ ...s, combats: s.combats + 1 })),
    kill: () => setStats((s) => ({ ...s, kills: s.kills + 1 })),
    death: () => setStats((s) => ({ ...s, deaths: s.deaths + 1 })),
    goldEarned: (n: number) => setStats((s) => ({ ...s, goldEarned: +(s.goldEarned + n), })),
    goldSpent: (n: number) => setStats((s) => ({ ...s, goldSpent: +(s.goldSpent + n), })),
  };

  return { stats, record } as const;
}
