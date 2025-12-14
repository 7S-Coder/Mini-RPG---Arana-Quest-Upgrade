export function calcDamage(atk: number, def: number, isCrit = false) {
  const variance = 0.85 + Math.random() * 0.3; // 0.85 .. 1.15
  let base = Math.max(1, atk * variance);
  if (isCrit) base = base * (1.5 + Math.random() * 0.4);
  const mitigation = 100 / (100 + Math.max(0, def));
  const dmg = Math.max(1, Math.round(base * mitigation));
  return dmg;
}
