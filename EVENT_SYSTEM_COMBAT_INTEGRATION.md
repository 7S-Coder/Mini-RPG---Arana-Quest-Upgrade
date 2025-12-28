# Event System - Combat Integration Guide

## Overview

The Event System is **structurally complete** but effects require integration into combat calculations. This guide explains where and how to apply event modifiers.

---

## Effect Types & Values

From `GameEvent.effects`:

```typescript
interface EventEffect {
  type: 'enemy_bonus' | 'player_malus' | 'spawn_modifier' | 
        'rage_modifier' | 'dodge_bonus' | 'loot_bonus' | 'enemy_debuff';
  value: number;  // Percentage (10 = +10%)
}
```

Retrieved in Game.tsx via:
```typescript
const effects = getActiveEventEffects();
// Returns:
// {
//   enemy_damage_bonus: 0,
//   player_damage_malus: 0,
//   spawn_count_bonus: 0,
//   enemy_rage_bonus: 0,
//   player_dodge_bonus: 0,
//   loot_rarity_bonus: 0,
//   enemy_defense_debuff: 0,
// }
```

---

## Integration Points

### 1. **Enemy Damage Calculation** (`useCombat.tsx`)

**Location:** `applyEnemyAttacksToPlayer()` or similar

**Current code (example):**
```typescript
const calcDamage = (atk: number, def: number, isCrit = false) => {
  const variance = 0.85 + Math.random() * 0.3;
  let base = Math.max(1, atk * variance);
  if (isCrit) base = base * (1.5 + Math.random() * 0.4);
  const mitigation = 100 / (100 + Math.max(0, def));
  return Math.max(1, Math.round(base * mitigation));
};
```

**Integration:**
```typescript
const calcDamage = (atk: number, def: number, isCrit = false, enemyDamageBonus = 0) => {
  const variance = 0.85 + Math.random() * 0.3;
  let base = Math.max(1, atk * variance);
  if (isCrit) base = base * (1.5 + Math.random() * 0.4);
  
  // Apply event modifier
  base *= (1 + enemyDamageBonus / 100);
  
  // Account for enemy defense reduction (from event)
  const adjustedDef = Math.max(0, def - (def * (enemyDefenseDebuff / 100)));
  
  const mitigation = 100 / (100 + adjustedDef);
  return Math.max(1, Math.round(base * mitigation));
};
```

**Call site:**
```typescript
// When calling calcDamage() in applyEnemyAttacksToPlayer:
const enemyDamage = calcDamage(
  enemy.dmg, 
  player.def, 
  isCrit,
  effects?.enemy_damage_bonus ?? 0  // ADD THIS
);
```

---

### 2. **Player Damage Calculation** (`useCombat.tsx`)

**Location:** Player attack functions (quick/safe/risky)

**Integration:**
```typescript
// Example: onAttack function
const playerDamage = Math.max(1, 
  calcDamage(player.dmg, targetEnemy.def) * 
  (1 - (effects?.player_damage_malus ?? 0) / 100)  // APPLY MALUS
);
```

**Note:** Negative malus during **Plague Mist** reduces player output, making events more challenging.

---

### 3. **Dodge Calculations** (`useCombat.tsx` or `Game.tsx`)

**Location:** Enemy dodge/miss chance calculation

**Current logic (typical):**
```typescript
const dodgeThreshold = enemy.dodge;
const dodgeChance = (dodgeThreshold / 100) * 100;  // As percentage
const dodged = Math.random() * 100 < dodgeChance;
```

**Integration:**
```typescript
const dodgeThreshold = enemy.dodge;
// No modifier for enemies; but player dodge can be boosted
const playerDodgeBonus = effects?.player_dodge_bonus ?? 0;
const dodgeChance = (dodgeThreshold / 100) * 100;
const dodged = Math.random() * 100 < (dodgeChance - playerDodgeBonus);
```

**Note:** This **reduces** enemy accuracy against the player during **Whispering Shadows**.

---

### 4. **Rage Gain Per Turn** (`useCombat.tsx` or damage calc)

**Location:** Where enemy rage is incremented after attacks

**Current code (typical):**
```typescript
const rageGain = 10;  // Base rage per attack
enemy.rage = Math.min(100, (enemy.rage ?? 0) + rageGain);
```

**Integration:**
```typescript
const baseRageGain = 10;
const rageModifier = effects?.enemy_rage_bonus ?? 0;
const adjustedRageGain = baseRageGain * (1 + rageModifier / 100);
enemy.rage = Math.min(100, (enemy.rage ?? 0) + adjustedRageGain);
```

**Effect:** During **Blood Moon** (+30% rage), enemies hit 100 rage threshold faster, triggering special attacks sooner.

---

### 5. **Enemy Spawn Count** (`Game.tsx` or map logic)

**Location:** `startEncounter()` or enemy spawning logic

**Current code (typical):**
```typescript
const enemyCount = selectedMap?.enemyCount ?? 3;
for (let i = 0; i < enemyCount; i++) {
  spawnEnemy(...);
}
```

**Integration:**
```typescript
const baseEnemyCount = selectedMap?.enemyCount ?? 3;
const spawnModifier = effects?.spawn_count_bonus ?? 0;
const finalEnemyCount = Math.max(1, baseEnemyCount + spawnModifier);

for (let i = 0; i < finalEnemyCount; i++) {
  spawnEnemy(...);
}
```

**Effect:** During **Swarm Surge** (+2), encounters have 2 extra enemies (balanced by -20% HP).

---

### 6. **Loot Rarity Boost** (`Game.tsx` or item drop logic)

**Location:** `maybeDropFromEnemy()` or rarity roll

**Current code (typical):**
```typescript
const rollRarity = (): Rarity | null => {
  const r = Math.random() * 100;
  if (r < 0.1) return "mythic";      // 0.1%
  if (r < 1.1) return "legendary";   // 1%
  if (r < 6.1) return "epic";        // 5%
  if (r < 16.1) return "rare";       // 10%
  if (r < 46.1) return "common";     // 30%
  return null;
};
```

**Integration:**
```typescript
const rollRarity = (lootBonus = 0): Rarity | null => {
  // Apply bonus by shifting thresholds down
  // Higher bonus = better rarities appear sooner
  const r = Math.random() * 100;
  const shift = lootBonus;  // Percentage shift
  
  if (r < (0.1 + shift)) return "mythic";
  if (r < (1.1 + shift)) return "legendary";
  if (r < (6.1 + shift)) return "epic";
  if (r < (16.1 + shift)) return "rare";
  if (r < (46.1 + shift)) return "common";
  return null;
};

// Call:
const rarity = rollRarity(effects?.loot_rarity_bonus ?? 0);
```

**Effect:** During **Essence Storm** (+15%), legendary/epic items drop more frequently.

---

## Implementation Checklist

- [ ] **Enemy Damage**: Apply `enemy_damage_bonus` to enemy attack calculations
- [ ] **Enemy Defense**: Apply `enemy_defense_debuff` to enemy DEF stat
- [ ] **Player Damage**: Apply `player_damage_malus` (reduce) to player attacks
- [ ] **Player Dodge**: Apply `player_dodge_bonus` (reduce enemy dodge against player)
- [ ] **Rage Gain**: Multiply rage increment by `enemy_rage_bonus` modifier
- [ ] **Spawn Count**: Add `spawn_count_bonus` to enemy count per encounter
- [ ] **Loot Rarity**: Apply `loot_rarity_bonus` to rarity roll thresholds
- [ ] **Test**: Verify each effect works and feels balanced
- [ ] **Documentation**: Update combat logic docs with event modifiers

---

## Getting Effects in Combat

### In Game.tsx
```typescript
const { getActiveEventEffects } = useEvents();

// Pass to useCombat:
const effects = getActiveEventEffects();
const { onAttack, onRun } = useCombat({
  // ... other props
  activeEventEffects: effects,
});
```

### In useCombat.tsx
```typescript
export default function useCombat({
  // ... existing params
  activeEventEffects,  // NEW
}: {
  // ... existing types
  activeEventEffects?: Record<string, number> | null;
}) {
  // Use in calculations:
  const enemyDamageBonus = activeEventEffects?.enemy_damage_bonus ?? 0;
  const playerDamageReduction = activeEventEffects?.player_damage_malus ?? 0;
  // ... etc
}
```

---

## Testing Integration

### 1. **Trigger Blood Moon** (+20% enemy damage)
- Win 4+ battles, trigger Blood Moon
- Next enemy should deal ~20% more damage
- Verify by comparing health loss vs. previous encounters

### 2. **Trigger Swarm Surge** (+2 enemies, -20% HP)
- Should see 5 enemies instead of 3 (assuming base 3)
- Each enemy should have 80% max HP
- Still killable but more complex

### 3. **Trigger Whispering Shadows** (+10% dodge)
- Single encounter with rage boost
- Enemies should attack ~2x per turn
- But player dodge should mitigate some hits

### 4. **Trigger Plague Mist** (-10% player damage)
- Your attacks should deal noticeably less damage
- Compensated by +8% loot bonus (fight longer, get more drops)

---

## Balancing Notes

**Philosophy:** Events should **challenge but not overwhelm**.

- **Positive events** (Essence Storm, Frozen Peaks): Reduce difficulty
- **Negative events** (Plague Mist): Compensate with loot boosts
- **Neutral events** (Swarm Surge): Add difficulty but balance with reduced enemy HP

If an event feels too punishing:
1. Reduce the modifier value (e.g., 30% → 20%)
2. Add a compensatory effect (e.g., +loot_bonus)
3. Reduce duration (4 battles → 3)

---

## Performance Considerations

⚠️ **Avoid recalculating effects every frame.**

Instead:
```typescript
// Good: Cache effects at combat start
const combatEffects = getActiveEventEffects();

// Then use combatEffects in all calculations
// Don't call getActiveEventEffects() repeatedly
```

---

## Future Enhancements

- **Event synergies:** Blood Moon + Swarm Surge = enemies deal +30% + faster attack frequency
- **Player-triggered events:** Optional challenges to enable specific events
- **Event chains:** One event triggers a follow-up after X battles
- **Dynamic difficulty:** AI adjusts AI behavior based on active event

---

## References

- Full Event System docs: `EVENT_SYSTEM.md`
- Quick start guide: `EVENT_SYSTEM_QUICKSTART.md`
- Event templates: `app/game/templates/events.ts`
- Hook implementation: `app/game/uses/useEvents.tsx`

---

**Status:** Ready for Integration  
**Difficulty:** Medium (2-3 hours)  
**Priority:** High (enables event system to function)

