# Guide Rapide - Système d'Achievements

## 🎯 Pour le joueur

### Accéder aux Achievements
- Cliquez sur le bouton **🏆 Achievements** dans le panneau droit
- Ou pressez **Ctrl+A** (Cmd+A sur Mac)

### Comment fonctionne le système
1. **Déblocage automatique**: Les achievements se déverrouillent automatiquement quand vous remplissez les conditions
2. **Notifications**: Une notification toast apparaît quand vous débloquez un achievement
3. **Récompenses**: Vous recevez immédiatement les récompenses (or, essence, fragments, etc.)
4. **Persistance**: Vos achievements sont sauvegardés automatiquement et persisteront même après un refresh

### Affichage du Modal
- **En-tête**: Affiche vos statistiques (Débloqués / Total / Pourcentage)
- **Filtres**: Cliquez sur une catégorie pour filtrer
- **Liste**: 
  - 🟢 Achievements débloqués en haut
  - 🔴 Achievements verrouillés en bas
  - Cliquez sur un achievement débloqué pour voir le lore complet

### Types d'Achievements
- **🗡️ Combat**: Combats gagnés, streaks, victoires
- **👹 Ennemis**: Défaire des types d'ennemis spécifiques
- **👑 Boss**: Vaincre des boss différents
- **🗺️ Exploration**: Débloquer de nouvelles maps
- **🕳️ Donjon**: Compléter des donjons
- **⭐ Spécial**: Objets rares, essence, etc.
- **🔥 Narratif**: Achievements cachés (apparaissent après déblocage)

---

## 🛠️ Pour le développeur

### Vérifier l'intégration

1. **Dans le jeu**, gagnez un combat → vous devriez voir une notification pour "First Blood"
2. **Ouvrez le modal** 🏆 → vous devriez voir "First Blood" débloqué
3. **Rafraîchissez la page** → l'achievement reste débloqué (vérifier localStorage)

### Ajouter un nouvel Achievement

#### Étape 1: Ajouter dans `app/game/templates/achievements.ts`
```typescript
export const ACHIEVEMENTS: Record<string, Achievement> = {
  // ... autres achievements ...
  
  my_achievement: {
    id: "my_achievement",
    title: "My Achievement",
    description: "Do something cool",
    lore: "You did something cool...",
    icon: "🎯",
    reward: { gold: 100, essence: 20 },
    unlocked: false,
    category: "special",
  },
};
```

#### Étape 2: Ajouter la condition dans `app/game/uses/useAchievements.tsx`
Cherchez la fonction `checkAchievements()` et ajoutez:
```typescript
else if (id === "my_achievement" && stats.someCondition >= value) {
  shouldUnlock = true;
}
```

#### Étape 3: (Optionnel) Ajouter le tracking
Si vous avez besoin de tracker une nouvelle statistique, ajoutez dans `AchievementTrackingStats` dans `types.ts`:
```typescript
myCustomStat?: number;
```

Puis appelez dans `useAchievements`:
```typescript
const recordMyEvent = useCallback((amount: number) => {
  setStats((prev: any) => ({
    ...prev,
    myCustomStat: (prev.myCustomStat ?? 0) + amount,
  }));
}, []);
```

### Appeler le système depuis le jeu

Pour déclencher un événement d'achievement:

```typescript
// Dans Game.tsx après un événement
achievements.recordBattleWin(enemies);       // Victoire au combat
achievements.recordBossDefeat(bossId);       // Victoire contre un boss
achievements.recordMapUnlock("map_id");      // Map débloquée
achievements.recordDungeonCompletion(id);    // Donjon complété
achievements.recordChapterCompletion(id);    // Chapitre complété

// Vérifier les achievements
const newlyUnlocked = achievements.checkAchievements({
  player,
  currentWinStreak: myWinStreak,
});

// Afficher les notifications
for (const ach of achievements.getNewlyUnlocked()) {
  addToast(`🏆 ${ach.title}!`, 'ok');
}
```

### Tester les achievements

#### Via la console navigateur
```javascript
// Obtenir l'état actuel
localStorage.getItem('arenaquest_core_v1')

// Débloquer un achievement manuellement
const save = JSON.parse(localStorage.getItem('arenaquest_core_v1'));
save.achievements.first_blood.unlocked = true;
save.achievements.first_blood.unlockedAt = Date.now();
localStorage.setItem('arenaquest_core_v1', JSON.stringify(save));
// Recharger la page
```

#### Raccourcis de test
```javascript
// Augmenter les combats gagnés
const save = JSON.parse(localStorage.getItem('arenaquest_core_v1'));
save.stats.totalBattlesWon = 100;
localStorage.setItem('arenaquest_core_v1', JSON.stringify(save));

// Ajouter un boss vaincu
save.stats.bossesDefeated = { "fire_overlord": 1 };
localStorage.setItem('arenaquest_core_v1', JSON.stringify(save));
```

### Structure des récompenses

Chaque achievement peut avoir plusieurs types de récompenses:
```typescript
reward: {
  gold?: number;              // Monnaie d'or
  essence?: number;           // Essence (devise endgame)
  item?: Item;                // Item spécial
  fragmentCount?: number;     // Fragments de clé
  passiveBonus?: {
    dmg?: number;
    def?: number;
    dodge?: number;
    crit?: number;
    hp?: number;
  }
}
```

### Persistence et Save

Les achievements sont automatiquement:
- ✅ Sauvegardés dans localStorage lors du déblocage
- ✅ Chargés au démarrage du jeu
- ✅ Persistants après refresh
- ✅ Synchro avec le reste de la save

Aucune action manuelle n'est nécessaire!

---

## 📚 Fichiers modifiés

- ✏️ `app/game/types.ts` - Types Achievement
- ✏️ `app/game/templates/achievements.ts` - Définitions
- ✏️ `app/game/uses/useAchievements.tsx` - Hook principal
- ✏️ `app/game/uses/useGameState.tsx` - Intégration + Save/Load
- ✏️ `app/game/Game.tsx` - Appels lors des événements
- ✏️ `app/components/modales/AchievementsModal.tsx` - UI
- ✏️ `app/components/styles/achievementsModal.css` - Styling
- ✏️ `app/components/RightSidebar.tsx` - Bouton

---

## 🎮 Raccourcis

| Raccourci | Action |
|-----------|--------|
| Ctrl+A | Ouvrir/Fermer Achievements |
| Click filtre | Filter par catégorie |

---

## ❓ FAQ

**Q: Mes achievements disparus après refresh?**
A: Non, ils sont sauvegardés dans localStorage. Vérifiez que localStorage n'est pas désactivé ou vidé.

**Q: Comment voir le lore avant déblocage?**
A: Le lore n'est visible que après déblocage - c'est normal! C'est pour la surprise narrative.

**Q: Puis-je perdre les achievements?**
A: Non, une fois débloqués, ils restent débloqués. Même après clear de localStorage, si vous recarguez une save, ils restent.

**Q: Comment créer un achievement caché?**
A: Ajoutez `hidden: true` dans la définition. Il n'apparaîtra pas tant qu'il n'est pas débloqué.

**Q: Comment donner les récompenses?**
A: Les récompenses sont définies dans l'achievement. Vous devez les implémenter selon le type (appliquer le gold, essence, etc.) dans la logique de déblocage si nécessaire.

---

Système complet et prêt! 🚀
