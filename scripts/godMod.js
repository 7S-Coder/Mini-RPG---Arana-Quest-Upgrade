// God mode helper for Arena Quest
// Run `node scripts/godMod.js` and paste the printed code into the browser console while the game is loaded.

const snippet = `(() => {
  try {
    const key = 'arenaquest_core_v1';
    const raw = localStorage.getItem(key);
    if (!raw) { console.warn('No save found under', key); return; }
    const save = JSON.parse(raw);
    const player = save.player || {};
    // keep level unchanged but ensure runtime recomputation yields huge stats by
    // injecting powerful equipment items (each slot contributes to acc values)
    const huge = 9990;
    const makeItem = (id, name, slot, stats) => ({ id, name, slot, rarity: 'mythic', category: 'armor', stats });

    const equipment = {
      weapon: makeItem('god_weapon', 'Godblade', 'weapon', { dmg: huge }),
      chestplate: makeItem('god_chest', 'Godplate', 'chestplate', { hp: huge }),
      hat: makeItem('god_hat', 'Godhelm', 'hat', { crit: huge }),
      boots: makeItem('god_boots', 'Godboots', 'boots', { dmg: Math.floor(huge * 0.25), crit: Math.floor(huge * 0.1) }),
      belt: makeItem('god_belt', 'Godbelt', 'belt', { def: huge }),
      ring: makeItem('god_ring', 'Godring', 'ring', { hp: Math.floor(huge * 0.2), crit: Math.floor(huge * 0.2) }),
      familiar: makeItem('god_fam', 'Godling', 'familiar', { dmg: Math.floor(huge * 0.2) }),
      key: null,
    };

    // set visible player stats (not strictly necessary but useful)
    player.hp = 9999;
    player.maxHp = 9999;
    player.dmg = 9999;
    player.def = 9999;
    player.crit = 9999;
    player.dodge = 9999;
    player.gold = 99999;
    // set level to max for testing
    player.level = 105;
    player.xp = 0;

    save.player = player;
    save.equipment = { ...(save.equipment || {}), ...equipment };
    // ensure inventory doesn't duplicate equipped IDs
    save.inventory = (save.inventory || []).filter(i => !['god_weapon','god_chest','god_hat','god_boots','god_belt','god_ring','god_fam'].includes(i && i.id));

    localStorage.setItem(key, JSON.stringify(save));
    console.log('God mode (equipment injection) applied to save:', save);
    // reload so the app picks up the new save and recomputes derived stats
    location.reload();
  } catch (e) { console.error('godMod error', e); }
})();`;

console.log('Paste the following JavaScript into the browser console while the game is open:');
console.log('--- SNIPPET START ---');
console.log(snippet);
console.log('--- SNIPPET END ---');
console.log('Tip: run the snippet, then refresh the page to pick up changes.');
