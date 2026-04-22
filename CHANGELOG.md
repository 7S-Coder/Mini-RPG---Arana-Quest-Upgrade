# Changelog

## v0.62 — Weapon Type Badges in Inventory (22 avril 2026)

### Feedback visuel du type d'arme dans l'inventaire

Ajout d'un badge coloré affichant le type d'arme directement dans la liste de l'inventaire, à côté du nom de l'item.

- Chaque arme affiche désormais un badge `sword`, `axe`, `dagger`, `spear` ou `barehand`
- Couleur du badge unique par type (synchronisée avec `WEAPON_TYPE_COLOR` existant) :
  - `sword` → cyan `#4ecdc4`
  - `axe` → orange `#ffa500`
  - `dagger` → rouge `#ff6b6b`
  - `spear` → vert clair `#95e1d3`
  - `barehand` → gris `#999`
- Fond sombre avec bordure colorée pour une lisibilité maximale
- Non-armes (armure, bouclier, familier, etc.) : aucun badge affiché
- Aucun changement aux données stockées — `weaponType` était déjà présent sur les items

---

## v0.61 — Weapon Slot Rules (22 avril 2026)

### Système d'équipement des armes revu

Implémentation des règles d'équipement par type d'arme, avec logique automatique d'incompatibilité.

---

### Règles par type d'arme

| Arme équipée | Slot weapon | Slot weapon2 | Slot shield |
|-------------|-------------|--------------|-------------|
| Aucune | ✅ | ❌ masqué | ✅ |
| Épée | ✅ | ❌ masqué | ✅ |
| Lance | ✅ | ❌ masqué | ❌ bloqué |
| Hache | ✅ | ✅ (hache identique seulement) | ❌ bloqué |
| Dague | ✅ | ✅ (dague identique seulement) | ❌ bloqué |

---

### Fichiers modifiés

#### `app/game/uses/useGameState.tsx` — `equipItem`

- **Slot `weapon2`** : bloqué sauf si l'arme principale et l'arme secondaire sont du même type hache ou dague (dual-wield)
- **Slot `shield`** : bloqué si l'arme principale n'est pas une épée
- **Équiper une lance** → déséquipe automatiquement `weapon2` + `shield`
- **Équiper une hache ou dague** → déséquipe automatiquement `shield` ; déséquipe `weapon2` si le type ne correspond plus
- **Équiper une épée** → déséquipe automatiquement `weapon2`
- **Type inconnu / pas d'arme** → déséquipe `weapon2` et `shield` par sécurité

#### `app/components/modales/InventoryModal.tsx` — Affichage conditionnel

- Le slot `weapon2` n'est **affiché** que si l'arme principale est une hache ou une dague
- Le slot `shield` n'est **affiché** que si aucune arme ou une épée est équipée
- `canEquipWeapon2()` corrigé : vérifie hache+hache ou dague+dague (la lance n'était pas autorisée, ancienne logique incorrecte)
- `getWeapon2Warning()` mis à jour : message "Dual-wield only with matching axes or daggers"
- `shouldDisplaySlot()` étendu pour gérer le slot `shield` en plus de `weapon2`

---

## v0.60 — Tavern Hub System (22 avril 2026)

### Nouveau système : La Taverne comme carrefour narratif

Refonte complète de la Taverne. Elle n'est plus une fenêtre à dialogue aléatoire mais un **hub de connaissances structuré** où chaque PNJ joue un rôle précis.

---

### Nouveaux fichiers

#### `app/game/templates/dialogues/tavernTopics.ts`
Fichier de données central du nouveau système. Contient :
- Types TypeScript : `TavernTopic`, `TavernTopicDialogue`, `TopicUnlockCondition`, `ProgressionStats`
- Constantes : `MAX_TOPICS_PER_VISIT = 2`, `MESSENGER_APPEARANCE_CHANCE = 0.45`
- Données : `TAVERN_TOPICS` — 4 PNJ × plusieurs sujets × 3–4 répliques chacun
- Fonctions utilitaires : `isTopicUnlocked()`, `pickDialogueForTopic()`

**Structure des sujets par PNJ :**

| PNJ | Sujets | Condition de déblocage |
|-----|--------|------------------------|
| **Lya** | Votre histoire, Les ennemis, Les boss, Survivre | Toujours / Toujours / 1 boss tué / Niveau 5 |
| **Brak** | Votre histoire, Haches, Épées, Lances, Dagues, La forge | Toujours / Toujours / Toujours / Niv. 3 / Niv. 3 / Niv. 5 |
| **Eldran** | Votre histoire, Ce monde, Mélethor, Les zones | Toujours / Niv. 2 / Niv. 5 / Niv. 3 |
| **Le Messager** | Ce que tu sais, Un secret | Toujours / Niveau 5 |

Chaque sujet possède 3–4 répliques qui tournent : le joueur voit en priorité celles qu'il n'a pas encore lues, puis le système choisit aléatoirement parmi les vues.

---

### Fichiers modifiés

#### `app/components/modales/TavernModal.tsx` — Réécriture complète

**Avant :** Un dialogue aléatoire était sélectionné à l'ouverture via `DialogueViewSimple`. Un seul écran par PNJ avec une image et un bouton "Talk".

**Après :** Navigation en 3 vues distinctes.

**Vue 1 — Grille des PNJ**
- 4 cartes PNJ avec portrait plein cadre et dégradé texte
- Le Messager a une probabilité de 45% d'être présent à chaque visite
- Quand absent : carte grisée, curseur désactivé, mention "Not here tonight"
- Bannière d'information si le Messager est présent

**Vue 2 — Liste des sujets**
- Portrait circulaire du PNJ + nom, titre, description
- Badge indiquant le nombre de sujets restants pour cette visite (max 2)
- Message "n'a plus rien à ajouter" quand la limite est atteinte
- Sujets verrouillés visibles mais désactivés, avec hint précis ("Requires level 5", "Defeat 1 boss first")

**Vue 3 — Dialogue**
- Encadré "You ask" avec la formulation de la question du joueur
- Encadré "NPC responds" avec la réplique complète
- Boutons Retour (sans consommer de slot) et Compris (consomme le slot + enregistre comme vu)

**Logique de visite :**
- `visitInteractions` compte les sujets consommés par PNJ et se réinitialise à chaque ouverture de la modale
- `messengerPresentRef` est tiré une seule fois à l'ouverture via `useRef` (stable pendant toute la visite)
- `unlockDialogue(npcId, dialogueId)` appelé à la confirmation pour mémoriser les répliques vues entre les sessions

**Props ajoutée :**
```typescript
progressionStats?: ProgressionStats // { bossesDefeated, totalBattlesWon }
```

---

#### `app/game/Game.tsx` — Ajout d'une prop

Passage de `progressionStats` au composant `TavernModal` depuis `achievements.stats` :

```tsx
progressionStats={{
  bossesDefeated: achievements.stats.bossesDefeated,
  totalBattlesWon: achievements.stats.totalBattlesWon,
}}
```

---

### Suppressions

- Import de `DialogueViewSimple` retiré de `TavernModal.tsx` (remplacé par le système de vues intégré)
- Import de `tavernDialogueLoaderSimple` retiré de `TavernModal.tsx`
- La prop `lyaStats` est conservée dans l'interface pour compatibilité mais n'est plus utilisée activement dans ce composant

---

### Notes de design

- La Taverne devient un **carrefour de savoirs** : Lya = terrain/ennemis, Brak = mécanique des armes, Eldran = lore du monde, Le Messager = secrets rares
- La limite de 2 sujets par PNJ par visite encourage le joueur à revenir régulièrement
- Les sujets verrouillés restent visibles pour orienter la progression ("tu sais ce qu'il faudra accomplir")
- Le Messager crée un événement rare : sa présence doit être saisie immédiatement

---

### Connexion Dialogues ↔ Achievements

#### `app/game/templates/achievements.ts` — 4 nouveaux achievements

| ID | Narrateur | Condition | Récompense |
|----|-----------|-----------|------------|
| `first_dialogue` | Lya | 1 dialogue lu | +10 or |
| `tavern_regular` | Brak | 5 dialogues lus | +25 or |
| `lore_seeker` | Eldran | 15 dialogues lus | +50 or, +2 essence |
| `messenger_found` | Messager | 1 dialogue avec le Messager | +30 or, +1 essence |

`messenger_found` est marqué `hidden: true` — il n'apparaît pas dans la liste des achievements avant d'être débloqué.

---

#### `app/game/uses/useAchievements.tsx` — Vérification des dialogues

Ajout d'un helper `countDialogues` qui compte le nombre total de topics consultés :

```typescript
const countDialogues = (unlockedDialogues?: Record<string, Record<string, string[]>>): number => {
  if (!unlockedDialogues) return 0;
  return Object.values(unlockedDialogues).reduce((acc, npc) => acc + Object.keys(npc).length, 0);
};
```

4 nouvelles conditions de déblocage ajoutées dans la boucle `checkAchievements` :

```typescript
else if (id === "first_dialogue")   { if (countDialogues(player?.unlockedDialogues) >= 1) shouldUnlock = true; }
else if (id === "tavern_regular")   { if (countDialogues(player?.unlockedDialogues) >= 5) shouldUnlock = true; }
else if (id === "lore_seeker")      { if (countDialogues(player?.unlockedDialogues) >= 15) shouldUnlock = true; }
else if (id === "messenger_found")  { if (player?.unlockedDialogues?.["messenger"] && Object.keys(player.unlockedDialogues["messenger"]).length >= 1) shouldUnlock = true; }
```

---

#### `app/game/Game.tsx` — Déclenchement immédiat

Le `unlockDialogue` passé à `TavernModal` est wrappé pour construire un état optimiste (sans attendre le re-render de `setPlayer`) et appeler `checkAchievements` synchroniquement :

```tsx
unlockDialogue={(npcId, dialogueId, choiceId) => {
  unlockDialogue(npcId, dialogueId, choiceId);
  const prevNpc = player.unlockedDialogues?.[npcId] ?? {};
  const updatedDialogues = {
    ...(player.unlockedDialogues ?? {}),
    [npcId]: {
      ...prevNpc,
      [dialogueId]: choiceId ? [...(prevNpc[dialogueId] ?? []), choiceId] : (prevNpc[dialogueId] ?? []),
    },
  };
  achievements.checkAchievements({ player: { ...player, unlockedDialogues: updatedDialogues } });
}}
```

La prop `achievements={achievements.achievements}` est également passée à `TavernModal`.

---

#### `app/components/modales/TavernModal.tsx` — Section "Memories"

**Nouvelles props :**
```typescript
achievements?: Record<string, Achievement>
```

**Nouvelle interface interne :**
```typescript
interface MemoryEntry {
  achievementId: string;
  title: string;
  context?: string;
  lore: string;
}
```

**Helper `getMemories(npcId)`** — filtre les achievements débloqués dont le `narrator` correspond au PNJ affiché.

**Vue 2 enrichie** — une section "Memories" apparaît sous la liste des topics quand le PNJ a des achievements débloqués en tant que narrateur. Ces entrées :
- Ne consomment pas de slot de visite
- Affichent contexte + citation complète du lore de l'achievement
- Sont distinguées visuellement (teinte ambrée, ✦ en préfixe, badge "Achievement")

**Vue Memory** — vue dédiée quand le joueur clique sur une Memory :
- Badge titre + contexte narratif optionnel
- Citation complète en encadré NPC
- Bouton "← Back" pour revenir à la liste des sujets

---

#### `app/components/modales/NarrationsModal.tsx` — Correction du type

Le type de prop `unlockedDialogues` corrigé de `Record<string, string[]>` à `Record<string, Record<string, string[]>>` pour correspondre au format réel de `player.unlockedDialogues`.

---

#### `app/game/templates/dialogues/allDialoguesLoader.ts` — Refactoring

**Avant :** chargement depuis un fichier JSON legacy (`lyaDialoguesSimple.json`), Eldran/Brak/Messager retournaient des tableaux vides.

**Après :** source unique via `TAVERN_TOPICS`. Tous les PNJ sont couverts. Chaque `TavernTopicDialogue` (`playerPrompt` / `npcText`) est converti en `SimpleDialogue` (`question` / `response`) à la volée.

```typescript
export function loadAllDialoguesByNPC(): Record<string, SimpleDialogue[]> {
  const result: Record<string, SimpleDialogue[]> = {};
  for (const [npcId, topics] of Object.entries(TAVERN_TOPICS)) {
    const dialogues: SimpleDialogue[] = [];
    for (const topic of topics) {
      for (const d of topic.dialogues) {
        dialogues.push({ id: d.id, question: d.playerPrompt, response: d.npcText, type: 'player' });
      }
    }
    result[npcId] = dialogues;
  }
  return result;
}
```

Les dialogues lus en taverne sont désormais visibles dans l'onglet **"Dialogues"** de la modal Narrations pour tous les PNJ.
