# Event System - Arena Quest

## Overview

The Event System enriches the farming loop by introducing random, temporary events that:
- **Modify combat rules** with special effects
- **Provide narrative flavor** through NPC narration and log messages
- **Add visual feedback** with colored console tints and animations
- **Never block progression** (no dungeons are disabled, difficulty is adaptive)

Events are triggered based on **win streaks**, becoming more frequent as players dominate.

---

## Architecture

### Types (`app/game/types.ts`)

```typescript
export type GameEvent = {
  id: string;
  name: string;
  description: string;        // Short UI description
  lore: string;               // Narrative flavor text
  type: 'zone' | 'combat';    // Zone: persists across battles | Combat: single encounter
  narrator?: 'eldran' | 'lya' | 'brak' | 'messenger';
  icon?: string;              // Emoji icon
  duration: number;           // Battles remaining (zone) or 1 (combat)
  consoleTint: string;        // rgba/hex color for console styling
  consolePulse?: boolean;     // Pulsing animation
  effects: EventEffect[];
  rarity?: Rarity;
};

export type EventEffect = {
  type: 'enemy_bonus' | 'player_malus' | 'spawn_modifier' | 'rage_modifier' | 'dodge_bonus' | 'loot_bonus' | 'enemy_debuff';
  value: number;
};

export type ActiveGameEvent = GameEvent & {
  activatedAt: number;
  durationRemaining: number;
};
```

### Event Templates (`app/game/templates/events.ts`)

Defines all available events in the `GAME_EVENTS` catalog. Each event includes:
- Combat effects (damage bonuses/maluses, spawn count, rage modifiers, etc.)
- Visual tints and animation hints
- Narrator assignments for lore
- Duration (zone events last 4-5 battles, combat events are 1-time)

### Hook (`app/game/uses/useEvents.tsx`)

`useEvents()` manages:
- **Active event state** and persistence
- **Event triggering logic** based on win streak
- **Duration decrement** (called after each battle)
- **Event cooldown** (after player death)
- **Save/load** functionality

**Key functions:**

```typescript
useEvents() returns {
  activeEvent: ActiveGameEvent | null,
  tryTriggerEvent(winStreak, onNarration?),   // Try to trigger new event
  decrementEventDuration(),                     // Reduce duration or end event
  endActiveEvent(),                             // Force-end event (on death)
  getActiveEventEffects(),                      // Get effect modifiers
  loadFromSave(data),                           // Load from localStorage
  getSaveData(),                                // Get data for save
}
```

---

## Events Catalog

### 🔴 **Blood Moon** (Zone Event)
- **Duration:** 5 battles
- **Effects:**
  - +20% enemy damage
  - +30% enemy rage gain (more frequent attacks)
  - +10% loot rarity
- **Visual:** Dark red tint with pulsing animation
- **Narration:** "The moon turns crimson. Creatures howl with unnatural fury."

### ⚡ **Essence Storm** (Zone Event)
- **Duration:** 5 battles
- **Effects:**
  - +15% essence drop chance
  - -10% enemy defense (enemies unstable)
  - No spawn modifier
- **Visual:** Indigo/violet tint, no pulsing
- **Narration:** "Essence surges through the air. Reality feels unstable."

### 👁️ **Whispering Shadows** (Combat Event)
- **Duration:** 1 battle only
- **Effects:**
  - +50% enemy rage (enemies attack ~2x more often)
  - +10% player dodge (slight compensation)
- **Visual:** Dark tint, subtle effect
- **Narration:** "Shadows whisper forgotten names. You feel watched."

### 🌊 **Swarm Surge** (Zone Event)
- **Duration:** 4 battles
- **Effects:**
  - +2 additional enemies per encounter
  - -20% enemy HP (balanced tradeoff)
  - +5% loot bonus
- **Visual:** Orange tint with subtle pulsing
- **Narration:** "The ground trembles. More creatures join the fray!"

### ❄️ **Frozen Peaks** (Zone Event)
- **Duration:** 4 battles
- **Effects:**
  - -15% enemy damage (slowed)
  - -5% player dodge (sluggish movement)
  - +12% loot bonus
- **Visual:** Light blue tint
- **Narration:** "Bitter cold settles across the land. Movement feels sluggish."

### ☠️ **Plague Mist** (Zone Event)
- **Duration:** 5 battles
- **Effects:**
  - -10% player damage (weakened)
  - +10% enemy damage (emboldened)
  - +8% loot bonus
- **Visual:** Sickly green tint
- **Narration:** "Noxious vapor seeps from the earth. Every breath burns."

---

## Trigger Probability System (Adaptive Streak)

Events trigger based on **consecutive wins on the current map**:

```
Win Streak 0-3:   0% chance
Win Streak 4-9:   15% per battle
Win Streak 10-19: 25% per battle
Win Streak 20+:   40% per battle
```

**Important:** Events cannot stack—only one event is active at a time. If an event is active, `tryTriggerEvent()` returns `null`.

After **player death:**
1. Active event ends immediately
2. Event chance reduced for **3 battles** (cooldown)
3. Win streak resets, so event chance drops back to 0%

This ensures death is a genuine reset without punishing the player.

---

## Integration Points

### 1. **Game Component** (`app/game/Game.tsx`)

Initialize the hook:
```typescript
const { activeEvent, tryTriggerEvent, decrementEventDuration, endActiveEvent, getSaveData, loadFromSave } = useEvents();
```

Call in `endEncounter()` after battle victory:
```typescript
if (opts?.type === 'death') {
  endActiveEvent();  // Clear on death + apply cooldown
} else if (isBattleWon) {
  const streak = getMapStreak(selectedMapId);
  tryTriggerEvent(streak, pushLog);  // Try trigger, log narration
  decrementEventDuration();            // Decrement ongoing event
}
```

**Narration:**
- Event trigger is logged to console via `pushLog()`
- Message format: `{icon} {EventName} — {description}`

**Persistence:**
- Event data saved in `saveCoreGame()` call
- On app reload, event loads from `localStorage` and resumes with remaining duration

### 2. **Arena Panel Component** (`app/components/arena/ArenaPanel.tsx`)

Pass `activeEvent` prop:
```tsx
<ArenaPanel 
  activeEvent={activeEvent}
  {...otherProps}
/>
```

This displays the **EventDisplay** component at the top of the log.

### 3. **Event Display Component** (`app/components/EventDisplay.tsx`)

Renders active event with:
- Icon + name + remaining duration
- Description text
- Color tint from `consoleTint`
- Optional pulsing animation

---

## Styling (`app/globals.css`)

Added comprehensive event-related styles:

### `.event-display`
- Backdrop-blurred container with color tint
- Rounded corners + shadow for depth
- Transitions for smooth appearance

### `.event-pulse`
- Animation that fades in/out with glow effect
- `eventPulse` keyframes: 2s cycle, 50% intensity

### `.event-icon`
- Bouncing animation (`eventIconBounce`)
- Draws attention to active event

### `.event-trigger-message`
- Styled log message for event trigger
- Slides up from bottom with fade-in
- Orange/warm color for visibility

---

## How Effects Modify Combat

Currently, effects are **defined but not yet applied** in the combat damage calculations. To fully activate, integrate `getActiveEventEffects()` into:

1. **`useCombat.tsx`** — apply damage bonuses/maluses
2. **Enemy spawn logic** — add/remove enemies based on `spawn_modifier`
3. **Rage gain calculations** — multiply by rage modifier
4. **Dodge calculations** — add dodge bonus
5. **Loot drop logic** — boost rarity drops by percentage

**Example integration:**

```typescript
const effects = getActiveEventEffects();
const enemyDamageMultiplier = 1 + (effects.enemy_damage_bonus / 100);
const finalEnemyDamage = enemyDmg * enemyDamageMultiplier;
```

---

## Save/Load Mechanism

### Saving
1. `endEncounter()` calls `saveGameWithEvents()`
2. `saveGameWithEvents()` wrapper includes event data: `{ activeEvent: {...} }`
3. Data persists in `localStorage` under key `arenaquest_core_v1`

### Loading
1. On app mount, Game component runs:
   ```typescript
   useEffect(() => {
     const save = localStorage.getItem('arenaquest_core_v1');
     if (save?.activeEvent) loadEventFromSave(save.activeEvent);
   }, []);
   ```
2. Event resumes with **remaining duration intact**
3. Player can close/reopen browser without losing event state

---

## Extensibility

To add new events:

1. **Define in `app/game/templates/events.ts`:**
   ```typescript
   my_new_event: {
     id: "my_new_event",
     name: "Event Name",
     description: "Short UI text",
     lore: "Narrative flavor",
     type: "zone" | "combat",
     narrator: "eldran",
     icon: "🌀",
     duration: 4,
     consoleTint: "rgba(255, 100, 100, 0.3)",
     consolePulse: true,
     effects: [
       { type: "enemy_bonus", value: 25 },
       { type: "loot_bonus", value: 10 },
     ],
   }
   ```

2. **Implement effects in combat logic** (useCombat.tsx, spawnEnemy, etc.)

3. **Test trigger rates** — monitor logs for event distribution

---

## Design Philosophy

> The goal is NOT to increase raw difficulty, but to **break monotony**, create **narrative tension**, and give the impression that the **world reacts to the player**.

- Events are **readable** and **non-punitive**
- Negative effects are **balanced** with compensatory bonuses (e.g., +2 enemies → -20% HP)
- **Dungeons remain accessible** at all times (difficulty never blocks progression)
- **Win streaks unlock events**, encouraging aggressive play

---

## Future Enhancements

- **Chained events:** certain events can trigger follow-up events
- **Seasonal events:** rotate events weekly/monthly
- **Player-triggered events:** special challenges the player chooses to enable
- **Event combos:** two events active simultaneously with synergy bonuses
- **Custom event narratives:** different narrator reactions based on player level/items

---

## Debugging

### Console Logs
Enable debug output in `useEvents()`:
```typescript
console.log('[EVENT] triggered', triggeredEvent.id);
console.log('[EVENT] duration remaining', activeEvent.durationRemaining);
```

### Testing Event Chance
Manually set win streak in browser console:
```javascript
// Assuming Game component exposes a ref:
window.__arena_debug_streak = 15;  // Trigger 25% event chance
```

---

**Last Updated:** December 28, 2025  
**Author:** GitHub Copilot  
**Status:** Ready for Integration
