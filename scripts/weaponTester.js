// Weapon tester helper - equip all weapon types for testing
// Run `node scripts/weaponTester.js` and paste the printed code into the browser console while the game is loaded.

const snippet = `(() => {
  try {
    const key = 'arenaquest_core_v1';
    const raw = localStorage.getItem(key);
    if (!raw) { console.warn('No save found under', key); return; }
    const save = JSON.parse(raw);
    const player = save.player || {};

    // Create test weapons for each type with proper Item structure
    const testWeapons = [
      {
        id: 'test_sword',
        name: 'Test Sword (Counter)',
        slot: 'weapon',
        category: 'weapon',
        rarity: 'epic',
        weaponType: 'sword',
        stats: { dmg: 30, crit: 5, dodge: 3, speed: 8 },
        description: '🛡️ Counter: Dodge → Riposte',
        cost: 500,
        weight: 5
      },
      {
        id: 'test_dagger',
        name: 'Test Dagger (Multi-Hit)',
        slot: 'weapon',
        category: 'weapon',
        rarity: 'epic',
        weaponType: 'dagger',
        stats: { dmg: 24, crit: 12, speed: 15 },
        description: '⚔️ Multi-Hit: 2x chance bonus',
        cost: 450,
        weight: 5
      },
      {
        id: 'test_axe',
        name: 'Test Axe (Boss Damage)',
        slot: 'weapon',
        category: 'weapon',
        rarity: 'epic',
        weaponType: 'axe',
        stats: { dmg: 40, crit: 5, def: 4 },
        description: '👑 Boss Damage: +50% vs Bosses',
        cost: 550,
        weight: 5
      },
      {
        id: 'test_spear',
        name: 'Test Spear (Anti-Rage)',
        slot: 'weapon',
        category: 'weapon',
        rarity: 'epic',
        weaponType: 'spear',
        stats: { dmg: 28, crit: 2, speed: 6, dodge: 3 },
        description: '🔥 Anti-Rage: Prevents +20% rage',
        cost: 480,
        weight: 5
      },
      {
        id: 'test_barehand',
        name: 'Test Barehand',
        slot: 'weapon',
        category: 'weapon',
        rarity: 'common',
        weaponType: 'barehand',
        stats: { dmg: 10, dodge: 2, speed: 5 },
        description: 'Basic barehand fighting',
        cost: 0,
        weight: 0
      }
    ];

    // Add all weapons to inventory, removing any duplicates first
    save.inventory = (save.inventory || []).filter(i => !testWeapons.map(w => w.id).includes(i?.id));
    save.inventory.push(...testWeapons);

    // Equip the sword by default to start with counter skill
    player.equippedWeapon = { type: 'sword', rarity: 'epic', skill: 'counter' };
    save.equipment = save.equipment || {};
    save.equipment.weapon = testWeapons[0]; // Set sword as equipped weapon

    save.player = player;
    localStorage.setItem(key, JSON.stringify(save));
    
    console.log('✅ Weapon Tester loaded!');
    console.log('Available test weapons:');
    console.log('- Test Sword (Counter skill) - equipped');
    console.log('- Test Dagger (Multi-Hit skill)');
    console.log('- Test Axe (Boss Damage skill)');
    console.log('- Test Spear (Anti-Rage skill)');
    console.log('- Test Barehand');
    console.log('Switch weapons in your inventory to test different skills!');
    
    location.reload();
  } catch (e) { console.error('weaponTester error', e); }
})();`;

console.log(snippet);

