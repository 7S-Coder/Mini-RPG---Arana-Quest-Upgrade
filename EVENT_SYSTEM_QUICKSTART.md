# Event System - Quick Start Guide

## What Was Implemented

A complete **Event System** that enriches the farming loop with temporary, narrative-driven events that:
- ✅ Trigger randomly based on **win streaks** (more wins = higher chance)
- ✅ Display **visually** in the console with colored tints and animations
- ✅ Add **narration** to both the console log and UI
- ✅ **Persist** across browser reloads via localStorage
- ✅ **Never block** dungeon access (all difficulty is adaptive)

---

## Files Created/Modified

### New Files
- `app/game/templates/events.ts` — Event catalog (6 events defined)
- `app/game/uses/useEvents.tsx` — Event management hook
- `app/components/EventDisplay.tsx` — Visual event component
- `EVENT_SYSTEM.md` — Full documentation

### Modified Files
- `app/game/types.ts` — Added `GameEvent`, `EventEffect`, `ActiveGameEvent` types
- `app/game/Game.tsx` — Integrated hook, calls, and event persistence
- `app/components/arena/ArenaPanel.tsx` — Display active event at top of log
- `app/globals.css` — Added event styling + animations

---

## How to Test

### 1. **Trigger an Event**
1. Start a game and pick any map
2. **Win 4+ consecutive battles** without dying on the same map
3. At ~15% chance per battle (after 4 wins), an event will trigger
4. Watch the console log for: `{icon} EventName — description`
5. Look at the top of the log panel for the colored event display

### 2. **Watch Events Persist**
1. With an active event (4-5 battles remaining), **reload the page** (Ctrl+R)
2. The event should still be active with updated duration counter
3. Finish the battles to see the event expire naturally

### 3. **Trigger on Death**
1. Get an active event (step 1)
2. **Die in combat** (let enemy health reach 0)
3. The event should end immediately
4. Event chance resets for 3 battles (cooldown)

### 4. **Event-Specific Mechanics**

#### Blood Moon (Red tint, pulsing)
- Enemies deal more damage (+20%)
- More frequent attacks (+30% rage)

#### Essence Storm (Purple tint)
- Better essence drops (+15%)
- Enemies less defensive (-10%)

#### Whispering Shadows (Dark tint)
- Single-encounter only
- Enemies attack ~2x per turn (+50% rage)

#### Swarm Surge (Orange tint)
- +2 extra enemies per fight
- Enemy HP reduced to balance (-20%)

#### Frozen Peaks & Plague Mist
- Negative player effects balanced by loot boosts
- Test the "adaptive difficulty" philosophy

---

## Current Limitations

⚠️ **Effects are defined but NOT YET integrated into combat calculations.** 

The event system is **complete** as a structure, but damage bonuses, spawn modifiers, and rage changes require implementation in:
- `app/game/uses/useCombat.tsx` (damage calculations)
- Enemy spawn logic (add/remove by `spawn_modifier`)
- Rage gain per turn (multiply by `rage_modifier`)

To enable effects fully:

```typescript
// In useCombat or relevant combat function:
const effects = getActiveEventEffects();  // From useEvents hook
const enemyDamageBonus = effects?.enemy_damage_bonus ?? 0;
const finalDamage = baseDamage * (1 + enemyDamageBonus / 100);
```

---

## Architecture at a Glance

```
Game.tsx
├── useEvents() Hook
│   ├── activeEvent state
│   ├── tryTriggerEvent(streak)  → triggers based on wins
│   ├── decrementEventDuration() → reduce battle counter
│   └── getActiveEventEffects()  → returns modifier object
│
├── endEncounter() callback
│   ├── On death: endActiveEvent() + cooldown
│   ├── On win: tryTriggerEvent() + decrementEventDuration()
│   └── saveCoreGame() with event data
│
└── Render
    └── ArenaPanel
        └── EventDisplay (shows active event)
```

---

## Save/Load Behavior

**What's saved:**
- Active event object (if any)
- Remaining duration
- Effects modifiers

**When saved:**
- After `endEncounter()` (battle win/death/flee)
- When achievements unlock (already saving)

**When loaded:**
- On app mount via `loadEventFromSave()`
- Event resumes with **exact remaining duration**
- No duplicate events on reload

---

## Event Chance Calculation

```
Win Streak 0-3:   0% (warmup phase)
Win Streak 4-9:   15% per battle
Win Streak 10-19: 25% per battle
Win Streak 20+:   40% per battle
```

This means:
- New players won't see events immediately
- At 10 consecutive wins, event chance reaches 25%
- Veterans at 20+ wins see events regularly
- **Each death resets streak** (and cooldown for 3 battles)

---

## Visual Feedback

### Event Display Box (at top of log)
- **Color:** Matches event's `consoleTint`
- **Animation:** Pulse effect on Blood Moon, Swarm Surge, Plague Mist
- **Content:** Icon + Name + Duration counter
- **Persistence:** Stays visible until event expires

### Log Message
- **Style:** Orange-ish border, slide-up animation
- **Text:** `{icon} {EventName} — {description}`
- **Timing:** Appears immediately when event triggers

### Console Tints
- Blood Moon: Dark red `rgba(139, 0, 0, 0.3)`
- Essence Storm: Indigo `rgba(75, 0, 130, 0.3)`
- Swarm Surge: Orange `rgba(255, 140, 0, 0.3)`
- Frozen Peaks: Light blue `rgba(173, 216, 230, 0.3)`
- Plague Mist: Green `rgba(100, 150, 100, 0.3)`

---

## Adding New Events

1. **Define in `app/game/templates/events.ts`:**
```typescript
export const GAME_EVENTS: Record<string, GameEvent> = {
  // ... existing events
  my_event: {
    id: "my_event",
    name: "My Custom Event",
    description: "What happens",
    lore: "Narrative flavor",
    type: "zone",  // or "combat"
    narrator: "eldran",
    icon: "🔥",
    duration: 5,
    consoleTint: "rgba(255, 100, 0, 0.3)",
    consolePulse: true,
    effects: [
      { type: "enemy_bonus", value: 15 },
      { type: "loot_bonus", value: 10 },
    ],
  }
}
```

2. **Implement the effects** in combat logic (see "Current Limitations")

3. **Test:** Win 4+ battles and watch for random triggers

---

## Next Steps (When Ready)

1. **Integrate effect modifiers into combat:**
   - Apply `enemy_damage_bonus` to enemy attacks
   - Apply `spawn_modifier` to enemy count
   - Apply `rage_modifier` to rage gain per turn

2. **Test balance:** Monitor if events are too easy/hard

3. **Consider synergies:**
   - Chain events (one triggers another)
   - Double-event possibility (rare, high impact)

4. **Analytics:** Track which events are triggered most/least

---

## Debugging Tips

### See active event state
```javascript
// In browser console (requires React DevTools):
// Find Game component, look for activeEvent prop
```

### Force event trigger for testing
```javascript
// Manually set win streak (in Game component test):
window.__arena_test_streak = 15;  // Simulates 15 wins
```

### Check localStorage
```javascript
const save = JSON.parse(localStorage.getItem('arenaquest_core_v1'));
console.log(save.activeEvent);  // Shows active event or null
```

---

## Contact & Questions

Refer to `EVENT_SYSTEM.md` for full technical documentation.

---

**Status:** ✅ Ready for Testing & Integration  
**Last Updated:** December 28, 2025
