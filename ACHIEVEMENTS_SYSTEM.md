# Système d'Achievements - Arena Quest

## 📋 Vue d'ensemble

Implémentation complète d'un système d'achievements (succès) robuste pour Arena Quest avec:
- ✅ Déblocage à sens unique (one-shot)
- ✅ Persistance complète (localStorage)
- ✅ Lore narratif unique par achievement
- ✅ Récompenses variées (or, essence, fragments, bonus passifs)
- ✅ Catégorisation et filtrage
- ✅ 20+ achievements prédéfinis
- ✅ Système extensible pour nouvelles catégories

---

## 📁 Fichiers créés/modifiés

### 1. **Types TypeScript** 
- **Fichier**: `app/game/types.ts`
- **Modifications**: 
  - Ajout de `Achievement` (structure principale)
  - Ajout de `AchievementReward` (récompenses variées)
  - Ajout de `AchievementTrackingStats` (statistiques persistantes)
- **Utilisation**: Tous les achievements doivent respecter ce type

```typescript
type Achievement = {
  id: string;
  title: string;
  description: string;          // Description gameplay
  lore: string;                  // Texte narratif (visible après déblocage)
  icon?: string;                 // Emoji ou icône
  reward: AchievementReward;    // Récompenses
  unlocked: boolean;
  unlockedAt?: number;           // Timestamp du déblocage
  hidden?: boolean;              // Caché jusqu'au déblocage
  category?: string;
};
```

---

### 2. **Template des Achievements**
- **Fichier**: `app/game/templates/achievements.ts`
- **Contenu**: 20 achievements prédéfinis organisés par catégories
- **Catégories**:
  - 🗡️ **Combat** (6): First Blood, Veteran Warrior, Arena Legend, etc.
  - 👹 **Ennemis** (4): Goblin Slayer, Troll Hunter, Dragon Slayer, Shadow Hunter
  - 👑 **Boss** (2): First Boss, Champion of Champions
  - 🗺️ **Exploration** (2): Explorer, Wanderer
  - 🕳️ **Donjon** (2): Dungeon Delver, Dungeon Master
  - ⭐ **Spécial** (3): Immortal, Essence Touched, Legendary/Mythic Luck
  - 🔥 **Narratif** (1): World Saver (Boss final caché)

**Exemple**:
```typescript
first_blood: {
  id: "first_blood",
  title: "First Blood",
  description: "Win your first battle",
  lore: "Your blade tasted blood for the first time...",
  icon: "⚔️",
  reward: { gold: 50 },
  unlocked: false,
  category: "combat",
}
```

---

### 3. **Hook useAchievements**
- **Fichier**: `app/game/uses/useAchievements.tsx`
- **Responsabilités**:
  - Gestion de l'état des achievements (déverrouillés/verrouillés)
  - Suivi des statistiques (combats, bosses, maps, etc.)
  - Logique de déblocage automatique
  - Notifications de nouveaux déverrouillages
  - Persistance (save/load)

**API publique**:
```typescript
// État
achievements.achievements          // Record<string, Achievement>
achievements.stats                 // AchievementTrackingStats

// Tracking (appelé après les événements)
achievements.recordBattleWin(enemies)
achievements.recordBattleLoss()
achievements.recordBossDefeat(bossId)
achievements.recordMapUnlock(mapId)
achievements.recordDungeonCompletion(dungeonId)
achievements.recordChapterCompletion(chapterId)
achievements.updateHighestWinStreak(streak)

// Vérification & déblocage
achievements.checkAchievements(context)  // Vérifie tous les achievements
achievements.unlockAchievement(id)       // Déblocage manuel (cas spéciaux)
achievements.getNewlyUnlocked()          // Récupère les achievements venant d'être débloqués

// Persistance
achievements.loadFromSave(saved, stats)
achievements.getSaveData()
```

---

### 4. **Intégration dans useGameState**
- **Fichier**: `app/game/uses/useGameState.tsx`
- **Modifications**:
  - Import du hook `useAchievements`
  - Sauvegarde des achievements + stats dans `buildCoreSave()`
  - Chargement des achievements dans `loadGame()`
  - Auto-save des achievements avec le reste de la sauvegarde
  - Export du hook d'achievements en tant que propriété retournée

**Flux sauvegarde**:
```
Game State Changes → useGameState.achievements.getSaveData()
                   → buildCoreSave() inclut achievements
                   → localStorage.setItem('arenaquest_core_v1', save)
```

**Flux chargement**:
```
localStorage.getItem('arenaquest_core_v1')
  → loadGame()
  → achievements.loadFromSave(save.achievements, save.stats)
  → État restauré
```

---

### 5. **Intégration dans Game.tsx**
- **Fichier**: `app/game/Game.tsx`
- **Modifications**:
  - Import du composant `AchievementsModal`
  - Déstructuration de `achievements` depuis `useGameState()`
  - Appel à `checkAchievements()` dans `endEncounter()` après combats
  - Gestion des toasts de notification
  - Raccourci clavier Ctrl+A pour ouvrir le modal
  - Dépendance ajoutée à `useCallback`

**Logique de déblocage** (dans `endEncounter`):
```typescript
const isBattleWon = opts?.type !== 'death' && opts?.type !== 'flee';
const isBattleLost = opts?.type === 'death';

if (isBattleWon) {
  achievements.recordBattleWin(enemies);
  if (opts?.isBoss && opts?.bossName) {
    achievements.recordBossDefeat(bossTemplateName);
  }
}
if (isBattleLost) {
  achievements.recordBattleLoss();
}

// Vérifier tous les achievements qualifiés
const newlyUnlocked = achievements.checkAchievements({ 
  player, 
  currentWinStreak: consecWins 
});

// Afficher les notifications
for (const ach of achievements.getNewlyUnlocked()) {
  addToast(`🏆 Achievement Unlocked: ${ach.title}!`, 'ok', 4000);
  pushLog(`🏆 Achievement: ${ach.title} — ${ach.lore}`);
}
```

---

### 6. **Composant AchievementsModal**
- **Fichier**: `app/components/modales/AchievementsModal.tsx`
- **Fonctionnalités**:
  - Affichage de statistiques (Débloqués / Total / Pourcentage)
  - Filtrage par catégorie
  - Tri (débloqués d'abord, puis par titre)
  - Affichage du lore uniquement après déblocage
  - Affichage des récompenses
  - Date de déblocage visible
  - Icônes visuelles (emoji)

**Structure**:
```
[En-tête avec stats]
[Boutons de filtre par catégorie]
[Liste des achievements]
  - Icône
  - Titre + Date de déblocage
  - Description
  - Lore (si débloqué)
  - Récompenses (icônes colorées)
```

---

### 7. **Styles CSS**
- **Fichier**: `app/components/styles/achievementsModal.css`
- **Styling complet**:
  - Design responsif
  - Dégradés et couleurs (or pour achievements)
  - Animations smooth
  - Différenciation locked/unlocked
  - Récompenses avec code couleur:
    - 🟡 Or
    - 🔵 Essence
    - 🟣 Fragment
    - 🟢 Bonus passif

---

### 8. **UI - Bouton dans RightSidebar**
- **Fichier**: `app/components/RightSidebar.tsx`
- **Modification**: Ajout du bouton "🏆 Achievements"

---

## 🎮 Conditions de déblocage

| ID | Titre | Condition | Récompense |
|---|---|---|---|
| **first_blood** | First Blood | 1 victoire | 50g |
| **battle_10** | Veteran Warrior | 10 victoires | 200g + 10⚡ |
| **battle_50** | Arena Legend | 50 victoires | 500g + 50⚡ + 1 Fragment |
| **battle_100** | Unstoppable Force | 100 victoires | 1000g + 100⚡ |
| **win_streak_10** | Momentum | 10 victoires consécutives | 150g + 15⚡ |
| **win_streak_25** | Unstoppable Streak | 25 victoires consécutives | 350g + 35⚡ |
| **goblin_slayer** | Goblin Slayer | 1 Goblin vaincu | 25g |
| **troll_hunter** | Troll Hunter | 1 Troll vaincu | 75g + 15⚡ |
| **dragon_slayer** | Dragon Slayer | 1 Dragon vaincu | 300g + 50⚡ + 1 Fragment |
| **shadow_hunter** | Shadow Hunter | 1 Shadow Beast vaincu | 100g + 20⚡ |
| **first_boss** | Boss Slayer | 1 Boss vaincu | 200g + 25⚡ + 1 Fragment |
| **five_bosses** | Champion of Champions | 5 Bosses vaincus | 500g + 75⚡ + 2 Fragments |
| **map_unlock_5** | Explorer | 5 Maps débloquées | 150g + 20⚡ |
| **map_unlock_10** | Wanderer | 10 Maps débloquées | 400g + 50⚡ + 1 Fragment |
| **first_dungeon** | Dungeon Delver | 1 Donjon complété | 250g + 30⚡ + 1 Fragment |
| **three_dungeons** | Dungeon Master | 3 Donjons complétés | 600g + 80⚡ + 2 Fragments |
| **never_die** | Immortal | 10 combats sans mort | 300g + 40⚡ |
| **first_essence** | Essence Touched | 1 essence obtenue | 10⚡ |
| **legendary_find** | Legendary Luck | 1 objet légendaire | 200g + 30⚡ |
| **mythic_find** | Divine Blessing | 1 objet mythique | 500g + 100⚡ + 1 Fragment (CACHÉ) |
| **final_boss** | World Saver | Fire Overlord vaincu | 1000g + 200⚡ + 5 Fragments (CACHÉ) |

---

## 🔄 Flux d'événements

### 1. **Combat gagné** (dans `endEncounter` avec `opts.type !== 'death' && opts.type !== 'flee'`)
```
Combat Victory
  ↓
recordBattleWin(enemies)              // +1 totalBattlesWon, track enemy types
  ↓
recordBossDefeat(bossId)               // Si isBoss = true
  ↓
checkAchievements({player, streak})   // Vérifie conditions
  ↓
getNewlyUnlocked()                     // Récupère nouveaux
  ↓
addToast() + pushLog()                 // Affiche notifications
  ↓
saveCoreGame()                         // Sauvegarde
```

### 2. **Combat perdu** (dans `endEncounter` avec `opts.type === 'death'`)
```
Combat Defeat
  ↓
recordBattleLoss()                     // +1 totalBattlesLost
  ↓
checkAchievements()                    // Peut affecter "never_die"
```

### 3. **Chargement du jeu** (au lancement)
```
localStorage.getItem('arenaquest_core_v1')
  ↓
loadGame()
  ↓
achievements.loadFromSave(saved.achievements, saved.stats)
  ↓
État restauré, pas de re-gain de récompenses
```

---

## 💾 Structure de sauvegarde

```json
{
  "version": 1,
  "player": { /* ... */ },
  "inventory": [ /* ... */ ],
  "equipment": { /* ... */ },
  "achievements": {
    "first_blood": {
      "id": "first_blood",
      "title": "First Blood",
      "unlocked": true,
      "unlockedAt": 1703123456789,
      /* ... other fields ... */
    },
    /* ... other achievements ... */
  },
  "stats": {
    "totalBattlesWon": 42,
    "totalBattlesLost": 3,
    "dungeonCompleted": { "dungeon_1": 1, "dungeon_2": 2 },
    "bossesDefeated": { "fire_overlord": 1, "ice_king": 0 },
    "mapsUnlocked": { "spawn": true, "forest": true, "desert": true },
    "enemyTypesDefeated": { "goblin": 5, "troll": 2, "dragon": 1 },
    "highestWinStreak": 12,
    "chaptersCompleted": { "chapter_1": true }
  },
  "timestamp": 1703123456789
}
```

---

## 🚀 Utilisation future

### Ajouter un nouvel achievement

1. **Ajouter dans `achievements.ts`**:
```typescript
new_achievement: {
  id: "new_achievement",
  title: "Achievement Title",
  description: "What player must do",
  lore: "Narrative text...",
  icon: "📌",
  reward: { gold: 100, essence: 20 },
  unlocked: false,
  category: "special",
}
```

2. **Ajouter la condition dans `useAchievements.checkAchievements()`**:
```typescript
else if (id === "new_achievement" && someCondition) {
  shouldUnlock = true;
}
```

3. **Ajouter le tracking si nécessaire**:
```typescript
// Dans useGameState ou Game.tsx
achievements.recordCustomEvent(data);  // Si besoin d'une méthode spéciale
```

### Achievements cachés/spéciaux

Pour des achievements révélés seulement après déblocage:
```typescript
hidden: true,  // Ne s'affiche pas tant qu'il n'est pas débloqué
```

### Extensions futures

- 🌙 **Saisons** (achievements saisonniers)
- 📊 **Défis** (achievements de difficulté variable)
- 🎯 **Quêtes** (achievements narratifs liés aux chapitres)
- 🏅 **Badges** (système de progression visible)
- 🎁 **Récompenses cumulatives** (déblocage d'items spéciaux)

---

## ⚙️ Raccourcis clavier

- **Ctrl+A** (ou Cmd+A sur Mac): Ouvrir le modal Achievements

---

## 📝 Notes de développement

1. **Persistance garantie**: Chaque achievement est sauvegardé dans localStorage immédiatement après déblocage
2. **No re-gain**: Les récompenses ne sont données qu'une fois (flagged par `unlocked: true`)
3. **Scalabilité**: Facile d'ajouter 100+ achievements sans impact performance
4. **Flexibilité**: Système de récompenses extensible (gold, essence, items, bonus)
5. **UI responsif**: Modal adapté à tous les écrans (mobile, tablet, desktop)
6. **Narratif riche**: Chaque achievement contient du lore unique pour l'immersion

---

## 🐛 Debug

Pour tester manuellement:
```typescript
// En console
localStorage.setItem('arenaquest_core_v1', JSON.stringify({
  // ... game state ...
  achievements: {},
  stats: { totalBattlesWon: 50, ... }
}));
// Recharger la page
```

---

Implémentation complétée ✅
