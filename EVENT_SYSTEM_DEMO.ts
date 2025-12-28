// EVENT_SYSTEM_DEMO.ts
// Demo/Test code for the Event System
// Copy & paste into browser console or use in tests

/**
 * DEMO 1: Check if event system is loaded
 */
function demoCheckEventSystem() {
  console.log('=== EVENT SYSTEM LOADED ===');
  
  // Check localStorage
  const save = JSON.parse(localStorage.getItem('arenaquest_core_v1') || '{}');
  console.log('Active Event:', save.activeEvent || 'None');
  console.log('Full Save:', save);
  
  return save.activeEvent;
}

/**
 * DEMO 2: Simulate event trigger
 * This would normally happen after 4+ consecutive wins
 */
function demoSimulateTrigger() {
  console.log('=== SIMULATING EVENT TRIGGER ===');
  
  // In real scenario:
  // 1. Win 4+ battles on same map
  // 2. Event triggers at ~15% chance
  // 3. Watch console for: "{icon} EventName — description"
  
  console.log('Steps:');
  console.log('1. Start Arena Quest');
  console.log('2. Pick any map (e.g., "Goblin Forest")');
  console.log('3. Win 4+ consecutive battles');
  console.log('4. At ~15% chance, event triggers');
  console.log('5. Check console log for event narration');
}

/**
 * DEMO 3: Check active event state
 * Returns current active event details
 */
function demoCheckActiveEvent() {
  console.log('=== CHECKING ACTIVE EVENT ===');
  
  const save = JSON.parse(localStorage.getItem('arenaquest_core_v1') || '{}');
  const event = save.activeEvent;
  
  if (!event) {
    console.log('❌ No active event');
    return null;
  }
  
  console.log('✅ Active Event Detected:');
  console.log(`  Name: ${event.name}`);
  console.log(`  Type: ${event.type}`);
  console.log(`  Icon: ${event.icon}`);
  console.log(`  Duration Remaining: ${event.durationRemaining} battles`);
  console.log(`  Effects: ${event.effects.map((e: any) => `${e.type}(${e.value})`).join(', ')}`);
  console.log(`  Lore: ${event.lore}`);
  console.log(`  Narrator: ${event.narrator}`);
  
  return event;
}

/**
 * DEMO 4: List all available events
 */
function demoListAllEvents() {
  console.log('=== ALL AVAILABLE EVENTS ===');
  
  const events = [
    {
      id: 'blood_moon',
      name: 'Blood Moon',
      icon: '🔴',
      type: 'zone',
      duration: 5,
      effects: '+20% enemy dmg, +30% rage, +10% loot'
    },
    {
      id: 'essence_storm',
      name: 'Essence Storm',
      icon: '⚡',
      type: 'zone',
      duration: 5,
      effects: '+15% essence drops, -10% enemy def'
    },
    {
      id: 'whispering_shadows',
      name: 'Whispering Shadows',
      icon: '👁️',
      type: 'combat',
      duration: 1,
      effects: '+50% enemy rage, +10% player dodge'
    },
    {
      id: 'swarm_surge',
      name: 'Swarm Surge',
      icon: '🌊',
      type: 'zone',
      duration: 4,
      effects: '+2 enemies, -20% enemy HP, +5% loot'
    },
    {
      id: 'frozen_peaks',
      name: 'Frozen Peaks',
      icon: '❄️',
      type: 'zone',
      duration: 4,
      effects: '-15% enemy dmg, -5% player dodge, +12% loot'
    },
    {
      id: 'plague_mist',
      name: 'Plague Mist',
      icon: '☠️',
      type: 'zone',
      duration: 5,
      effects: '-10% player dmg, +10% enemy dmg, +8% loot'
    }
  ];
  
  events.forEach((e, i) => {
    console.log(`${i + 1}. ${e.icon} ${e.name} (${e.type}) — ${e.effects}`);
  });
  
  return events;
}

/**
 * DEMO 5: Test event trigger probability
 */
function demoTestEventChance(winStreak: number): number {
  console.log(`=== EVENT CHANCE FOR STREAK ${winStreak} ===`);
  
  let chance = 0;
  if (winStreak < 4) chance = 0;
  else if (winStreak < 10) chance = 15;
  else if (winStreak < 20) chance = 25;
  else chance = 40;
  
  console.log(`Win Streak: ${winStreak}`);
  console.log(`Event Chance: ${chance}%`);
  
  if (chance === 0) {
    console.log('📊 Tips: Need 4+ consecutive wins to trigger events');
  } else if (chance === 15) {
    console.log('📊 Gaining momentum! Keep the streak alive.');
  } else if (chance === 25) {
    console.log('🔥 High chance of events! Expect frequent triggers.');
  } else {
    console.log('⚡ Veteran mode! Events very common.');
  }
  
  return chance;
}

/**
 * DEMO 6: Understand effect modifiers
 */
function demoUnderstandEffects() {
  console.log('=== UNDERSTANDING EVENT EFFECTS ===');
  
  const effects = {
    enemy_bonus: 'Increase enemy damage by %',
    player_malus: 'Decrease player damage by %',
    spawn_modifier: 'Add/remove enemies (+/-N)',
    rage_modifier: 'Increase enemy rage gain by %',
    dodge_bonus: 'Increase player dodge by %',
    loot_bonus: 'Increase item rarity by %',
    enemy_debuff: 'Decrease enemy defense by %'
  };
  
  Object.entries(effects).forEach(([key, desc]) => {
    console.log(`• ${key}: ${desc}`);
  });
  
  console.log('\nExample: Blood Moon');
  console.log('  - enemy_bonus: 20 → Enemies +20% damage');
  console.log('  - rage_modifier: 30 → Enemies gain rage 30% faster');
  console.log('  - loot_bonus: 10 → Better items drop 10% more often');
}

/**
 * DEMO 7: Event UI visual test
 */
function demoTestVisuals() {
  console.log('=== VISUAL FEEDBACK TEST ===');
  
  console.log('Expected visuals when event is active:');
  console.log('');
  console.log('1. EVENT DISPLAY BOX (top of log)');
  console.log('   └─ Icon + Name + Duration counter');
  console.log('   └─ Color tint (Blood Moon = dark red)');
  console.log('   └─ Optional pulsing animation');
  console.log('');
  console.log('2. LOG MESSAGE');
  console.log('   └─ "🔴 Blood Moon — Enemies are enraged"');
  console.log('   └─ Orange-ish border + slide-up animation');
  console.log('');
  console.log('3. CONSOLE TINT');
  console.log('   └─ Background color adjusted to event theme');
  console.log('');
  
  console.log('How to test:');
  console.log('1. Trigger an event (win 4+ battles)');
  console.log('2. Look at top of log for colored box');
  console.log('3. Check console for narration message');
  console.log('4. Observe background tint change');
}

/**
 * DEMO 8: Persistence test
 */
function demoTestPersistence() {
  console.log('=== PERSISTENCE TEST ===');
  
  console.log('Steps:');
  console.log('1. Get an active event (win 4+ battles)');
  console.log('2. Remember the event type and duration');
  console.log('3. RELOAD PAGE (Ctrl+R)');
  console.log('4. Event should still be active');
  console.log('5. Duration should be unchanged or -1');
  console.log('');
  console.log('If event persists: ✅ Save/Load working');
  console.log('If event disappears: ❌ Debug persistence code');
}

/**
 * DEMO 9: Death scenario test
 */
function demoDeathandCooldown() {
  console.log('=== DEATH & COOLDOWN TEST ===');
  
  console.log('Scenario 1: Event active, then die');
  console.log('  1. Get Blood Moon active (5 battles remaining)');
  console.log('  2. DIE in next battle');
  console.log('  3. Event should end immediately');
  console.log('  4. Event chance should be 0% for 3 battles');
  console.log('');
  console.log('Scenario 2: After cooldown, event can trigger again');
  console.log('  1. After death + 3 battles cooldown');
  console.log('  2. Win 4+ battles again');
  console.log('  3. Events resume normal trigger chance');
}

/**
 * DEMO 10: Run all demos
 */
function runAllDemos() {
  console.clear();
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   ARENA QUEST - EVENT SYSTEM DEMO         ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  
  console.log('📋 Running all demos...\n');
  
  demoCheckEventSystem();
  console.log('');
  
  demoListAllEvents();
  console.log('');
  
  demoTestEventChance(5);
  console.log('');
  demoTestEventChance(15);
  console.log('');
  demoTestEventChance(25);
  console.log('');
  
  demoUnderstandEffects();
  console.log('');
  
  demoTestVisuals();
  console.log('');
  
  demoTestPersistence();
  console.log('');
  
  demoDeathandCooldown();
  console.log('');
  
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   DEMO COMPLETE                           ║');
  console.log('╚════════════════════════════════════════════╝');
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    demoCheckEventSystem,
    demoCheckActiveEvent,
    demoListAllEvents,
    demoTestEventChance,
    demoUnderstandEffects,
    demoTestVisuals,
    demoTestPersistence,
    demoDeathandCooldown,
    runAllDemos
  };
}

// Usage in browser console:
// Copy & paste 'runAllDemos()' to see full demo
// Or call individual functions:
//   - demoCheckActiveEvent()
//   - demoTestEventChance(10)
//   - etc.
