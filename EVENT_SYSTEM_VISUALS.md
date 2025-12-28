# Event System - Visual Reference

## Event Display Example

### Active Event Box (Top of Log Panel)

```
┌─────────────────────────────────────────────────┐
│ 🔴 Blood Moon                    3 battles left  │
│ Enemies are enraged                            │
└─────────────────────────────────────────────────┘
```

**Visual Properties:**
- **Background:** Dark red tint `rgba(139, 0, 0, 0.3)`
- **Border:** Left border + subtle glow
- **Animation:** Pulsing (opacity changes 0.85 → 1.0)
- **Font:** Monospace, uppercase header
- **Backdrop:** Blur effect for depth

---

## Console Log Message

When event triggers:

```
[Arena Log]
═══════════════════════════════════════════════════
│ 🔴 Blood Moon — Enemies are enraged
═══════════════════════════════════════════════════
│ Enemy spawned!
│ ...combat log...
```

**Visual Properties:**
- **Style:** Orange left border, semi-transparent background
- **Animation:** Slide-up fade-in (0.6s)
- **Position:** Inserted at top of log messages
- **Emoji:** Matches event icon

---

## Console Tint Overlays

### Blood Moon (Red)
```
Background: rgba(139, 0, 0, 0.3)
Appearance: Dark red overlay on log area
Effect: Ominous, aggressive feeling
```

### Essence Storm (Purple)
```
Background: rgba(75, 0, 130, 0.3)
Appearance: Indigo/violet hue
Effect: Magical, unpredictable feeling
```

### Whispering Shadows (Dark)
```
Background: rgba(30, 30, 40, 0.5)
Appearance: Almost black, barely visible
Effect: Ominous, hidden danger
```

### Swarm Surge (Orange)
```
Background: rgba(255, 140, 0, 0.3)
Appearance: Warm orange tint
Effect: Action-packed, energetic
```

### Frozen Peaks (Blue)
```
Background: rgba(173, 216, 230, 0.3)
Appearance: Light blue, cool tones
Effect: Peaceful but restrictive
```

### Plague Mist (Green)
```
Background: rgba(100, 150, 100, 0.3)
Appearance: Sickly green, dull
Effect: Toxic, weakening
```

---

## Full UI Layout Example

```
┌──────────────────────────────────────────────────────────┐
│                    ARENA QUEST                            │
├──────────────────────────────────────────────────────────┤
│  PLAYER: Lvl 12 | HP: 45/80                              │
├──────────────────────────────────────────────────────────┤
│                        ENEMIES                            │
│  [Goblin] HP: ▓▓▓▓▓░░░░                                  │
│  [Goblin] HP: ▓▓░░░░░░░░                                 │
│  [Troll]  HP: ▓▓▓▓▓▓▓░░░                                 │
├──────────────────────────────────────────────────────────┤
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ 🔴 Blood Moon                    3 battles left ┃  │
│  ┃ Enemies are enraged                           ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
├──────────────────────────────────────────────────────────┤
│  [LOG]                                                   │
│  > 🔴 Blood Moon — Enemies are enraged                  │
│  > Goblin strikes for 12 damage!                        │
│  > You dodge!                                            │
│  > Your attack: 24 damage (Critical!)                   │
│  > Troll's HP: 31/55                                    │
├──────────────────────────────────────────────────────────┤
│  [ACTIONS]                                               │
│  [⚡ Quick Attack] [🛡️ Safe Block] [⚔️ Risky Strike]    │
│  [💨 Run Away]                                           │
└──────────────────────────────────────────────────────────┘
```

---

## Animation Sequences

### Event Trigger Animation (0.6s)

```
Time: 0.0s
├─ Message opacity: 0
├─ Message position: -8px (above final position)
└─ No visibility

Time: 0.3s (halfway)
├─ Message opacity: 0.5
├─ Message position: -4px
└─ Sliding down

Time: 0.6s (complete)
├─ Message opacity: 1
├─ Message position: 0 (final)
└─ Fully visible & in place
```

### Event Pulse Animation (2.0s loop, Blood Moon)

```
Time: 0.0s
├─ Opacity: 1.0
├─ Glow: 0px shadow
└─ Brightest

Time: 1.0s (halfway)
├─ Opacity: 0.85
├─ Glow: 8px shadow
└─ Dimmer

Time: 2.0s (back to start)
├─ Opacity: 1.0
├─ Glow: 0px shadow
└─ Brightest again
```

### Icon Bounce Animation (1.5s loop)

```
Time: 0.0s
├─ Icon position: 0px
└─ Neutral

Time: 0.75s (halfway)
├─ Icon position: -4px
└─ Bounced up

Time: 1.5s (complete)
├─ Icon position: 0px
└─ Back to neutral
```

---

## Event State Progression

```
NO EVENT
    ↓
Win streak: 0-3 battles
    ↓
WARMUP (0% trigger chance)
    ↓
Win streak: 4-9 battles
    ↓
LEARNING (15% trigger chance per battle)
    ↓
    ├→ Random roll < 15% → EVENT TRIGGERED!
    │  ├─ Duration: 4-5 battles
    │  ├─ Display: Active event box shown
    │  └─ Log: Event narration message
    │
    └→ Random roll ≥ 15% → Continue farming
       ├─ Decrement event duration (if active)
       └─ On victory, try trigger again
```

---

## Event Duration Counter Examples

### Zone Event (5 battles)
```
Battle 1: 🔴 Blood Moon - 5 battles left
Battle 2: 🔴 Blood Moon - 4 battles left
Battle 3: 🔴 Blood Moon - 3 battles left  ← Active
Battle 4: 🔴 Blood Moon - 2 battles left
Battle 5: 🔴 Blood Moon - 1 battle left
Battle 6: Event ends, counter disappears
```

### Combat Event (1 battle)
```
Battle 1: 👁️ Whispering Shadows - 1 battle left  ← Single encounter
Battle 2: Event ends immediately after victory
```

---

## Color Palette

```css
/* Blood Moon */
background: rgba(139, 0, 0, 0.3);      /* Dark Red */
border-left: 4px solid rgba(139, 0, 0, 0.8);

/* Essence Storm */
background: rgba(75, 0, 130, 0.3);     /* Indigo */
border-left: 4px solid rgba(75, 0, 130, 0.8);

/* Whispering Shadows */
background: rgba(30, 30, 40, 0.5);     /* Almost Black */
border-left: 4px solid rgba(100, 100, 150, 0.8);

/* Swarm Surge */
background: rgba(255, 140, 0, 0.3);    /* Orange */
border-left: 4px solid rgba(255, 140, 0, 0.8);

/* Frozen Peaks */
background: rgba(173, 216, 230, 0.3);  /* Light Blue */
border-left: 4px solid rgba(100, 150, 200, 0.8);

/* Plague Mist */
background: rgba(100, 150, 100, 0.3);  /* Sickly Green */
border-left: 4px solid rgba(100, 150, 100, 0.8);
```

---

## Typography

```css
.event-header {
  font-family: var(--mono);    /* Geist Mono */
  font-size: 14px;
  font-weight: 700;           /* Bold */
  text-transform: uppercase;
  letter-spacing: 1px;        /* Wide spacing */
  color: rgba(255, 255, 255, 0.95);
}

.event-icon {
  font-size: 18px;
  display: inline-block;
  animation: eventIconBounce 1.5s ease-in-out infinite;
}

.event-duration {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  background: rgba(255, 255, 255, 0.1);
  padding: 3px 8px;
  border-radius: 4px;
}

.event-description {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.4;
  font-style: italic;         /* Italicized for flavor */
  opacity: 0.9;
}
```

---

## Responsive Behavior

### Desktop (> 1024px)
- Event box: Full width of log panel
- Font size: Full (14px header, 12px description)
- Animation: Full smooth animations
- Backdrop: Heavy blur (12px)

### Tablet (768px - 1024px)
- Event box: 95% width (small margins)
- Font size: Slightly reduced
- Animation: Same
- Backdrop: Medium blur (8px)

### Mobile (< 768px)
- Event box: Full width, padded
- Font size: Responsive (smaller)
- Animation: Reduced motion (prefers-reduced-motion)
- Backdrop: Lighter blur (6px)

---

## Accessibility Features

- **Color:** Not relied on alone (icon + name + text)
- **Animation:** Respects `prefers-reduced-motion` (future implementation)
- **Contrast:** WCAG AA compliant (white text on dark backgrounds)
- **Duration:** Visible counter so players know when event ends
- **Narration:** Text logged for screen readers

---

## Example Event Progression (Visual)

```
Story: Player reaches 10-win streak on Goblin Forest

Battle 9:  [Goblin Forest] Streak: 9
           [Log] Won against 2 Goblins!
           
Battle 10: [Goblin Forest] Streak: 10
           [Log] Won against 1 Goblin + 1 Troll!
           
Battle 11: [Goblin Forest] Streak: 11
           ┌───────────────────────────────┐
           │ ⚡ Essence Storm     5 L left │
           │ Power flows wildly             │
           └───────────────────────────────┘
           [Log] ⚡ Essence Storm — Power flows wildly
           
Battle 12: [Goblin Forest] Streak: 12
           ┌───────────────────────────────┐
           │ ⚡ Essence Storm     4 L left │
           │ Power flows wildly             │
           └───────────────────────────────┘
           
Battle 13: [Goblin Forest] Streak: 13
           ┌───────────────────────────────┐
           │ ⚡ Essence Storm     3 L left │ ← Player notices
           │ Power flows wildly             │    better loot!
           └───────────────────────────────┘
           [Log] Rare item dropped!
           
Battle 14: [Goblin Forest] Streak: 14
           ┌───────────────────────────────┐
           │ ⚡ Essence Storm     2 L left │
           │ Power flows wildly             │
           └───────────────────────────────┘

Battle 15: [Goblin Forest] Streak: 15
           ┌───────────────────────────────┐
           │ ⚡ Essence Storm     1 L left │
           │ Power flows wildly             │
           └───────────────────────────────┘

Battle 16: Event ends, counter disappears
           [Log] The essence storm fades away...
           [No event active]
```

---

## Theme Consistency

Events use the **dark arcade aesthetic** of Arena Quest:

```
Dark background:     #0f0f10
Panel color:         #121214
Text color:          #d8d8d8
Accent color:        #a85638 (orange)
Secondary accent:    #2fb3ff (cyan)

Event overlays: Semi-transparent (30% opacity on background)
               with backdrop blur for depth
```

---

**Visual Design Philosophy:** Events are **visually arresting** but **not obstructive**—they catch the eye without blocking gameplay or readability.

