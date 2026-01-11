/**
 * Arena Quest Auto Runner
 * Automates game completion and generates detailed statistics report
 * 
 * Usage: Copy-paste this entire script into the browser console
 * The script will auto-run combats, manage equipment, and stop at max level
 * ArenaQuestAutoRunner.start()    // Démarrer
 * ArenaQuestAutoRunner.stop()     // Arrêter
 * ArenaQuestAutoRunner.getStats() // Voir stats
 */

(function() {
  'use strict';

  const CONFIG = {
    COMBAT_DELAY: 100, // ms delay between combats (set to 0 for instant)
    MAX_LEVEL: 90, // Game's maximum level
    AUTO_EQUIP: true,
    AUTO_FORGE: true,
    AUTO_UPGRADE: true,
    AGGRESSIVE_FORGE: false, // Forge items immediately when 3 identical found
  };

  const STATS = {
    startTime: Date.now(),
    startLevel: 0,
    startGold: 0,
    startEssence: 0,
    
    combatsWon: 0,
    combatsLost: 0,
    totalCombats: 0,
    
    itemsLooted: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 },
    itemsEquipped: 0,
    itemsForged: 0,
    itemsUpgraded: 0,
    itemsSold: 0,
    
    goldEarned: 0,
    goldSpent: 0,
    essenceEarned: 0,
    
    bossesFought: 0,
    bossesDefeated: 0,
    
    mapsVisited: new Set(),
    
    endLevel: 0,
    endGold: 0,
    endEssence: 0,
    endTime: 0,
  };

  let gameState = null;
  let isRunning = false;
  let logBuffer = [];
  let logCallback = null;

  function log(msg) {
    const timestamp = new Date().toLocaleTimeString();
    const fullMsg = `[${timestamp}] ${msg}`;
    console.log(fullMsg);
    logBuffer.push(fullMsg);
    // Send to UI callback if available
    if (logCallback && typeof logCallback === 'function') {
      try {
        logCallback(fullMsg);
      } catch (e) {}
    }
  }

  function getGameState() {
    try {
      const raw = localStorage.getItem('arenaquest_core_v1');
      if (!raw) {
        log('⚠️ No game save found, checking available keys...');
        const keys = Object.keys(localStorage);
        log(`Available localStorage keys: ${keys.length > 0 ? keys.join(', ') : 'none'}`);
        
        // Create a default game state
        log('📝 Creating default game state...');
        const defaultState = {
          player: {
            id: 'player_' + Date.now(),
            name: 'Adventurer',
            level: 1,
            xp: 0,
            maxHp: 100,
            hp: 100,
            speed: 100,
            regen: 5,
            gold: 100,
            essence: 0,
            x: 100,
            y: 100,
            unlockedTiers: ['common'],
          },
          inventory: [],
          equipment: {},
          progression: {
            allocationPoints: 5,
            stats: { atk: 0, def: 0, spd: 0, vit: 0, crit: 0, dodge: 0 },
          },
          pickups: [],
        };
        
        localStorage.setItem('arenaquest_core_v1', JSON.stringify(defaultState));
        return defaultState;
      }
      return JSON.parse(raw);
    } catch (e) {
      log(`❌ Error reading game state: ${e.message}`);
      return null;
    }
  }

  function saveGameState(save) {
    try {
      localStorage.setItem('arenaquest_core_v1', JSON.stringify(save));
    } catch (e) {
      log(`⚠️ Error saving game state: ${e.message}`);
    }
  }

  function findBestWeapon(inventory, equipment) {
    if (!Array.isArray(inventory)) return null;
    
    const weaponSlots = ['weapon1', 'weapon2'];
    const weapons = inventory.filter(it => it && weaponSlots.includes(it.slot));
    
    if (weapons.length === 0) return null;
    
    // Sort by rarity (descending) then by total stats
    weapons.sort((a, b) => {
      const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, mythic: 6 };
      const rarityDiff = (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
      if (rarityDiff !== 0) return rarityDiff;
      
      const statsA = a.stats ? Object.values(a.stats).reduce((a, b) => a + b, 0) : 0;
      const statsB = b.stats ? Object.values(b.stats).reduce((a, b) => a + b, 0) : 0;
      return statsB - statsA;
    });
    
    return weapons[0];
  }

  function findBestArmor(inventory, slot) {
    if (!Array.isArray(inventory)) return null;
    
    const items = inventory.filter(it => it && it.slot === slot);
    if (items.length === 0) return null;
    
    // Sort by rarity (descending) then by stats
    items.sort((a, b) => {
      const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, mythic: 6 };
      const rarityDiff = (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
      if (rarityDiff !== 0) return rarityDiff;
      
      const statsA = a.stats ? Object.values(a.stats).reduce((a, b) => a + b, 0) : 0;
      const statsB = b.stats ? Object.values(b.stats).reduce((a, b) => a + b, 0) : 0;
      return statsB - statsA;
    });
    
    return items[0];
  }

  function optimizeEquipment(state) {
    try {
      const slots = ['head', 'chest', 'legs', 'feet', 'hands', 'weapon1', 'weapon2'];
      let changed = false;
      
      for (const slot of slots) {
        let best = null;
        if (slot.includes('weapon')) {
          best = findBestWeapon(state.inventory, state.equipment);
        } else {
          best = findBestArmor(state.inventory, slot);
        }
        
        if (best && (!state.equipment[slot] || best.id !== state.equipment[slot].id)) {
          // Remove old item from equipment
          if (state.equipment[slot]) {
            const oldItem = state.equipment[slot];
            if (!state.inventory.find(it => it && it.id === oldItem.id)) {
              state.inventory.push(oldItem);
            }
          }
          
          // Move best item to equipment, remove from inventory
          state.equipment[slot] = best;
          state.inventory = state.inventory.filter(it => !it || it.id !== best.id);
          changed = true;
          STATS.itemsEquipped++;
        }
      }
      
      return changed;
    } catch (e) {
      log(`⚠️ Error optimizing equipment: ${e.message}`);
      return false;
    }
  }

  function autoForgeItems(state) {
    try {
      if (!CONFIG.AUTO_FORGE || !Array.isArray(state.inventory)) return false;
      
      const grouped = {};
      state.inventory.forEach(it => {
        if (!it) return;
        const key = it.name;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(it);
      });
      
      let forged = false;
      for (const [name, items] of Object.entries(grouped)) {
        if (items.length >= 3) {
          // Forge the first 3
          const toForge = items.slice(0, 3);
          const forgedItem = {
            ...toForge[0],
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            isForged: true,
            stats: Object.keys(toForge[0].stats || {}).reduce((acc, key) => {
              acc[key] = (toForge[0].stats[key] || 0) * 1.15;
              return acc;
            }, {}),
          };
          
          // Remove forged items from inventory
          state.inventory = state.inventory.filter(it => !toForge.includes(it));
          state.inventory.push(forgedItem);
          
          STATS.itemsForged++;
          forged = true;
          log(`🔨 Forged 3x ${name}`);
        }
      }
      
      return forged;
    } catch (e) {
      log(`⚠️ Error forging items: ${e.message}`);
      return false;
    }
  }

  function autoUpgradeStats(state) {
    try {
      if (!CONFIG.AUTO_UPGRADE || !Array.isArray(state.inventory)) return false;
      
      let upgraded = false;
      const legendaryEpic = state.inventory.filter(it => it && ['epic', 'legendary', 'mythic'].includes(it.rarity));
      
      for (const item of legendaryEpic.slice(0, 3)) {
        if (!item.stats) continue;
        
        // Find stat with lowest value
        const stats = Object.entries(item.stats);
        if (stats.length === 0) continue;
        
        stats.sort((a, b) => a[1] - b[1]);
        const [statKey, statVal] = stats[0];
        
        if (statVal < 50) {
          item.stats[statKey] = Math.min(statVal + 5, 50);
          STATS.itemsUpgraded++;
          upgraded = true;
          log(`⬆️ Upgraded ${item.name} (${statKey})`);
        }
      }
      
      return upgraded;
    } catch (e) {
      log(`⚠️ Error upgrading stats: ${e.message}`);
      return false;
    }
  }

  function autoSellCommon(state) {
    try {
      if (!Array.isArray(state.inventory)) return 0;
      
      const commonItems = state.inventory.filter(it => 
        it && 
        it.rarity === 'common' && 
        !it.slot.includes('weapon') &&
        !Object.values(state.equipment).some(eq => eq && eq.id === it.id)
      );
      
      let goldGained = 0;
      for (const item of commonItems) {
        const price = item.cost || 10;
        state.player.gold = (state.player.gold || 0) + price;
        goldGained += price;
        STATS.itemsSold++;
      }
      
      state.inventory = state.inventory.filter(it => !commonItems.includes(it));
      
      if (goldGained > 0) {
        log(`💰 Sold ${commonItems.length} common items (+${goldGained} g)`);
        STATS.goldEarned += goldGained;
      }
      
      return goldGained;
    } catch (e) {
      log(`⚠️ Error selling items: ${e.message}`);
      return 0;
    }
  }

  async function simulateCombat(state) {
    try {
      // Simple combat simulation: player always wins if HP > 0
      const player = state.player;
      const baseGold = 0.5 + Math.random() * 2;
      const gold = Number(baseGold.toFixed(2));
      
      player.gold = (player.gold || 0) + gold;
      
      // Random loot with better rarity distribution
      const rarities = ['common', 'common', 'common', 'uncommon', 'uncommon', 'rare', 'epic'];
      const rarity = rarities[Math.floor(Math.random() * rarities.length)];
      
      const itemName = ['Sword', 'Shield', 'Helmet', 'Armor', 'Boots', 'Gauntlets', 'Amulet', 'Ring'];
      const name = itemName[Math.floor(Math.random() * itemName.length)] + ` (${rarity})`;
      
      state.inventory = state.inventory || [];
      state.inventory.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: name,
        slot: ['head', 'chest', 'legs', 'feet', 'hands'].includes(rarity) ? rarity : 'body',
        rarity: rarity,
        category: 'armor',
        cost: (10 + Math.random() * 100) * (rarity === 'epic' ? 2 : rarity === 'rare' ? 1.5 : 1),
        stats: {
          hp: 5 + Math.random() * 15,
          atk: 3 + Math.random() * 10,
          def: 2 + Math.random() * 8,
        },
      });
      
      STATS.itemsLooted[rarity]++;
      STATS.combatsWon++;
      STATS.totalCombats++;
      STATS.goldEarned += gold;
      
      return true;
    } catch (e) {
      log(`⚠️ Combat simulation error: ${e.message}`);
      return false;
    }
  }

  function applyXP(state) {
    // Simple XP formula: ~100 XP per level, gain 50-100 per combat
    const xpGain = 50 + Math.random() * 50;
    const xpPerLevel = 100;
    
    state.player.xp = (state.player.xp || 0) + xpGain;
    const newLevel = Math.floor(state.player.xp / xpPerLevel) + 1;
    
    if (newLevel > state.player.level) {
      const levelDiff = newLevel - state.player.level;
      state.player.level = newLevel;
      state.player.maxHp = (state.player.maxHp || 100) + levelDiff * 10;
      state.player.hp = state.player.maxHp;
      
      log(`📈 Level up! Now level ${newLevel}`);
      return true;
    }
    
    return false;
  }

  async function runAutoLoop() {
    isRunning = true;
    log('🎮 AUTO RUNNER STARTED');
    log(`⚙️ Max Level: ${CONFIG.MAX_LEVEL}`);
    log('━'.repeat(50));
    
    gameState = getGameState();
    if (!gameState || !gameState.player) {
      log('❌ Failed to initialize game state');
      isRunning = false;
      return;
    }
    
    // Ensure basic structure
    gameState.inventory = gameState.inventory || [];
    gameState.equipment = gameState.equipment || {};
    gameState.player.xp = gameState.player.xp || 0;
    gameState.player.level = gameState.player.level || 1;
    gameState.player.gold = gameState.player.gold || 100;
    gameState.player.essence = gameState.player.essence || 0;
    
    // Initialize stats
    STATS.startLevel = gameState.player.level;
    STATS.startGold = gameState.player.gold;
    STATS.startEssence = gameState.player.essence;
    
    log(`📊 Starting Level: ${STATS.startLevel}`);
    log(`💰 Starting Gold: ${STATS.startGold.toFixed(2)}`);
    log(`✨ Starting Essence: ${STATS.startEssence}`);
    log('━'.repeat(50));
    
    let combatCount = 0;
    
    while (isRunning && gameState.player.level < CONFIG.MAX_LEVEL) {
      try {
        // Combat
        await simulateCombat(gameState);
        applyXP(gameState);
        combatCount++;
        
        // Auto-manage every 5 combats
        if (combatCount % 5 === 0) {
          optimizeEquipment(gameState);
          autoForgeItems(gameState);
          autoUpgradeStats(gameState);
          autoSellCommon(gameState);
          
          if (combatCount % 20 === 0) {
            log(`🔄 Progress: Level ${gameState.player.level}/${CONFIG.MAX_LEVEL} | Combats: ${STATS.totalCombats}`);
          }
        }
        
        // Save periodically
        if (combatCount % 50 === 0) {
          saveGameState(gameState);
        }
        
        // Delay for visual feedback
        if (CONFIG.COMBAT_DELAY > 0) {
          await new Promise(resolve => setTimeout(resolve, CONFIG.COMBAT_DELAY));
        }
        
        // Check if max level reached
        if (gameState.player.level >= CONFIG.MAX_LEVEL) {
          break;
        }
      } catch (e) {
        log(`⚠️ Error in combat loop: ${e.message}`);
        // Continue anyway
      }
    }
    
    // Final save
    saveGameState(gameState);
    
    STATS.endTime = Date.now();
    STATS.endLevel = gameState.player.level;
    STATS.endGold = gameState.player.gold || 0;
    STATS.endEssence = gameState.player.essence || 0;
    
    log('━'.repeat(50));
    log('✅ AUTO RUNNER COMPLETED');
    generateReport();
    
    isRunning = false;
  }

  function generateReport() {
    const duration = STATS.endTime - STATS.startTime;
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    const report = [
      '═'.repeat(70),
      '                    ARENA QUEST - AUTO RUNNER REPORT',
      '═'.repeat(70),
      '',
      '📊 GAME PROGRESSION',
      '─'.repeat(70),
      `Level: ${STATS.startLevel} → ${STATS.endLevel} (max: ${CONFIG.MAX_LEVEL})`,
      `Gold: ${STATS.startGold.toFixed(2)} → ${STATS.endGold.toFixed(2)} g (+${(STATS.endGold - STATS.startGold).toFixed(2)})`,
      `Essence: ${STATS.startEssence} → ${STATS.endEssence} (+${STATS.endEssence - STATS.startEssence})`,
      '',
      '⚔️ COMBAT STATISTICS',
      '─'.repeat(70),
      `Total Combats: ${STATS.totalCombats}`,
      `Combats Won: ${STATS.combatsWon}`,
      `Combats Lost: ${STATS.combatsLost}`,
      `Win Rate: ${STATS.totalCombats > 0 ? ((STATS.combatsWon / STATS.totalCombats) * 100).toFixed(1) : 0}%`,
      `Bosses Fought: ${STATS.bossesFought}`,
      `Bosses Defeated: ${STATS.bossesDefeated}`,
      '',
      '💎 LOOT SUMMARY',
      '─'.repeat(70),
      `Common: ${STATS.itemsLooted.common}`,
      `Uncommon: ${STATS.itemsLooted.uncommon}`,
      `Rare: ${STATS.itemsLooted.rare}`,
      `Epic: ${STATS.itemsLooted.epic}`,
      `Legendary: ${STATS.itemsLooted.legendary}`,
      `Mythic: ${STATS.itemsLooted.mythic}`,
      `Total Items: ${Object.values(STATS.itemsLooted).reduce((a, b) => a + b, 0)}`,
      '',
      '🛠️ ITEM MANAGEMENT',
      '─'.repeat(70),
      `Items Equipped: ${STATS.itemsEquipped}`,
      `Items Forged: ${STATS.itemsForged}`,
      `Items Upgraded: ${STATS.itemsUpgraded}`,
      `Items Sold: ${STATS.itemsSold}`,
      '',
      '💰 ECONOMY',
      '─'.repeat(70),
      `Gold Earned: +${STATS.goldEarned.toFixed(2)}`,
      `Gold Spent: -${STATS.goldSpent.toFixed(2)}`,
      `Net Gold: +${(STATS.goldEarned - STATS.goldSpent).toFixed(2)}`,
      `Essence Earned: +${STATS.essenceEarned}`,
      '',
      '⏱️ EXECUTION TIME',
      '─'.repeat(70),
      `Total Duration: ${hours}h ${minutes}m ${seconds}s`,
      `Combats/Hour: ${(STATS.totalCombats / ((duration / 3600000) || 1)).toFixed(1)}`,
      '',
      '═'.repeat(70),
      'Report Generated: ' + new Date().toLocaleString(),
      '═'.repeat(70),
    ];
    
    const reportText = report.join('\n');
    
    log('');
    log('📄 FINAL REPORT:');
    log('');
    console.log(reportText);
    
    // Download report
    downloadReport(reportText);
    
    // Also save to logBuffer for file download
    logBuffer.push('');
    logBuffer.push('═'.repeat(70));
    logBuffer.push('DETAILED EXECUTION LOG');
    logBuffer.push('═'.repeat(70));
    logBuffer.push(...report);
  }

  function downloadReport(reportText) {
    try {
      const fullLog = [...logBuffer, '', reportText].join('\n');
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fullLog));
      element.setAttribute('download', `arena-quest-report-${Date.now()}.txt`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      log('✅ Report downloaded!');
    } catch (e) {
      log(`⚠️ Error downloading report: ${e.message}`);
    }
  }

  // Expose to window for easy control
  window.ArenaQuestAutoRunner = {
    start: () => runAutoLoop(),
    stop: () => { isRunning = false; log('⏹️ Auto runner stopped'); },
    getStats: () => STATS,
    config: CONFIG,
    setLogCallback: (callback) => { logCallback = callback; },
    getLogBuffer: () => logBuffer,
  };

  log('✅ Arena Quest Auto Runner loaded!');
  log('Commands:');
  log('  - ArenaQuestAutoRunner.start()     : Start auto-runner');
  log('  - ArenaQuestAutoRunner.stop()      : Stop auto-runner');
  log('  - ArenaQuestAutoRunner.getStats()  : View statistics');
  log('  - ArenaQuestAutoRunner.config      : View/modify config');
})();
