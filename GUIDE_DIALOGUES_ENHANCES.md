================================================================================
GUIDE COMPLET - SYSTÈME DE DIALOGUES AMÉLIORÉ
================================================================================

🎯 QU'EST-CE QUI A CHANGÉ ?

✅ Poésie & Sous-texte: Les réponses de Lya sont plus nuancées et émotionnelles
✅ Variantes Punitives: Des conséquences si tu poses les mauvaises questions au mauvais moment
✅ Système de Pool: Quand le joueur pose une question, seul 3 dialogues sont disponibles (random)
✅ Arcs Émotionnels: Les dialogues évoluent selon trust/affection (froid → chaud)
✅ Choix Nuancés: Les réponses des choix du joueur ont des conséquences réelles

================================================================================
STRUCTURE NOUVELLE: VARIANTES PUNITIVES
================================================================================

Avant: Chaque dialogue avait juste des variantes basées sur Trust range

Maintenant: PLUS une section "punitiveVariants" qui s'active si conditions spéciales

Exemple:
```json
{
  "id": "tavern_ask_opinion",
  "variants": {
    "lukewarm": {
      "trust": "0-25",
      "text": "You have potential. Maybe."
    }
  },
  "punitiveVariants": {
    "fishing": {
      "condition": {
        "affection": "0-10",
        "trust": "0-20"
      },
      "text": "You're fishing for compliments. That's weakness.",
      "gains": {
        "respect": -2,
        "affection": -1
      }
    }
  }
}
```

QUAND ÇA S'ACTIVE ?
→ Si joueur a TRÈS PEU d'affection (0-10) ET TRÈS PEU de trust (0-20)
→ Lya le remet à sa place au lieu de répondre gentiment
→ Le joueur PERD du respect et affection (punition)

QUAND UTILISER PUNITIVE ?
- Joueur pose une question à confiance trop basse
- Joueur essaie de forcer l'intimité trop tôt
- Joueur ment ou manipule (vous voir le detector dans votre système?)
- Joueur est arrogant alors qu'il devrait être humble

================================================================================
STRUCTURE NOUVELLE: SYSTÈME DE POOL
================================================================================

Avant: Tous les 7 dialogues du joueur étaient visibles

Maintenant: Seul 3 sont disponibles à la fois (randomisés)

Le loader fait:
1. Récupère tous les dialogues où "pool": true
2. Les mélange (shuffle)
3. Prend les 3 premiers
4. Ajoute les dialogues où "pool": false ou non spécifié

DANS LE JSON, ajoute simplement:
```json
{
  "id": "tavern_ask_training",
  "pool": true,  ← C'EST ÇA !
  ...
}
```

RESULT: À chaque ouverture de la taverne, le joueur voit une COMBINAISON différente
→ Donne de la rejouabilité
→ Force le joueur à progresser pour débloquer les autres questions

================================================================================
STRUCTURE NOUVELLE: VARIANTES AVEC GAINS PERSONNALISÉS
================================================================================

Avant:
```json
"baseGains": {
  "trust": 2,
  "affection": 1
},
"variants": {
  "cold": {
    "trust": "0-30",
    "text": "..."
  }
}
```
→ Tous les variants ont les mêmes gains (baseGains)

Maintenant:
```json
"baseGains": {
  "trust": 2,
  "affection": 1
},
"variants": {
  "cold": {
    "trust": "0-30",
    "text": "...",
    "gains": {
      "trust": 2,
      "respect": 1
    }
  },
  "intimate": {
    "trust": "71-100",
    "text": "...",
    "gains": {
      "trust": 2,
      "affection": 5,
      "intimacy": 4
    }
  }
}
```
→ CHAQUE variant peut avoir ses propres gains
→ Plus le joueur a de confiance, plus la récompense augmente

COMMENT ENCODER CA:
- Bas Trust (0-30): Gains minimes ou négatifs
- Mid Trust (31-70): Gains modérés
- Haut Trust (71-100): Gains importants + intimité possible

================================================================================
TUTORIEL: CRÉER UN NOUVEAU DIALOGUE
================================================================================

ÉTAPE 1: Décider de la structure
Joueur demande ou Lya demande ?
→ "playerAsks" ou "npcAsks"

ÉTAPE 2: Remplir les infos basiques
```json
{
  "id": "tavern_ask_weapon",
  "category": "combat",
  "question": "What's the story behind your sword?",
  "pool": true,
  "baseGains": {
    "trust": 2,
    "respect": 1
  },
```

ÉTAPE 3: Créer les variantes (3 niveaux)
```json
"variants": {
  "cold": {
    "trust": "0-40",
    "text": "A tool. Nothing more.",
    "gains": { "trust": 2, "respect": 1 }
  },
  "warmth": {
    "trust": "41-80",
    "text": "It's seen many battles. Each mark tells a story.",
    "gains": { "trust": 2, "respect": 2, "affection": 1 }
  },
  "intimate": {
    "trust": "81-100",
    "affection": "60+",
    "text": "I'll pass it to you someday. You deserve it.",
    "gains": { "trust": 2, "respect": 2, "affection": 3, "intimacy": 2 }
  }
},
```

ÉTAPE 4 (OPTIONNEL): Ajouter une variante punitive
```json
"punitiveVariants": {
  "arrogant": {
    "condition": {
      "trust": "0-15",
      "affection": "0-10"
    },
    "text": "You're testing me. Stop.",
    "gains": { "respect": -2, "anger": 1 }
  }
}
```

RÉSULTAT:
```json
{
  "id": "tavern_ask_weapon",
  "category": "combat",
  "question": "What's the story behind your sword?",
  "pool": true,
  "baseGains": { "trust": 2, "respect": 1 },
  "variants": {
    "cold": { ... },
    "warmth": { ... },
    "intimate": { ... }
  },
  "punitiveVariants": {
    "arrogant": { ... }
  }
}
```

STATS DISPONIBLES:
- trust (confiance)
- affection (affection)
- respect (respect)
- intimacy (intimité)
- anger (colère - typiquement négatif)

================================================================================
FORMULE POÉTIQUE: OBSERVATION → JUGEMENT → SOUS-TEXTE
================================================================================

C'EST QUOI LA DIFFÉRENCE ?

MAUVAIS (banal):
"You're strong."
→ Compliment plat, oubliable

BON (poétique):
"You hit like someone who's forgotten what living costs. That's either courage or stupidity."
→ Observation (elle note comment tu combats)
→ Jugement (c'est bizarre, pas normal)
→ Sous-texte (elle se demande si c'est bon ou mauvais signe)

FORMULE GÉNÉRIQUE:
1. Observation: "You [action]..."
2. Jugement/constat: "That [consequence/quality]..."
3. Sous-texte/implication: "Which means... / That tells me... / I'm not sure if..."

EXEMPLE POUR CHAQUE STAT:

RESPECT (observation + admiration):
"Your technique is sloppy, but you learn faster than most. That's worth respecting."

AFFECTION (observation + vulnérabilité):
"When you smile like that, I remember why I'm still fighting. That scares me."

INTIMITÉ (observation + désir):
"Your breath on my neck. Your eyes. The way you trust me. It's becoming everything."

COLÈRE (observation + déception):
"You lied. Small thing, but lies build walls, and I'm tired of walls between us."

================================================================================
SYSTÈME DE CONDITIONS - CRÉER DES DIALOGUES VERROUILLÉS
================================================================================

PAS ASSEZ DE TRUST ? DIALOGUE VERROUILLÉ

Ajout dans "requirements":
```json
{
  "id": "tavern_ask_fears",
  "requirements": {
    "minTrust": 30
  },
  ...
}
```
→ Ce dialogue n'apparaît QUE si trust ≥ 30

AUTRES CONDITIONS POSSIBLES:
- "minTrust": 40
- "maxTrust": 50 (pour des dialogues "early game only")
- "minAffection": 50
- "maxAffection": 70 (rare)

QUAND UTILISER ?
- Dialogues intimes: minAffection 60+
- Dialogues profonds: minTrust 40+
- Dialogues vulnérables: minTrust 50+ ET minAffection 50+

================================================================================
INTÉGRATION DANS TAVERNMODAL.tsx
================================================================================

ANCIENNE VERSION:
```typescript
import { loadAllLyaTavernDialogues } from './tavernDialogueLoader';

const dialogueNodes = loadAllLyaTavernDialogues();
```

NOUVELLE VERSION:
```typescript
import { loadAllLyaTavernDialogues } from './tavernDialogueLoaderEnhanced';

const playerStats = {
  trust: relationshipData.trust,
  affection: relationshipData.affection
};

const dialogueNodes = loadAllLyaTavernDialogues(
  playerStats,
  usePool = true,  // Activer le pool
  poolSize = 3    // 3 questions visibles par session
);
```

ÇA VA FAIRE:
1. Charger les stats du joueur
2. Vérifier quels dialogues sont disponibles (requirements)
3. Appliquer les variantes punitives si nécessaire
4. Sélectionner 3 questions aléatoires du pool
5. Retourner une liste de dialogues à afficher

================================================================================
PROCHAINES ÉTAPES
================================================================================

OPTION 1: UTILISER lyaDialoguesEnhanced.json DIRECTEMENT
- Remplace lyaDialogues.json
- Utilise tavernDialogueLoaderEnhanced au lieu de l'ancien loader
- Les dialogues auront immédiatement plus de profondeur

OPTION 2: FUSIONNER PROGRESSIVEMENT
- Garde les deux fichiers pendant une phase de transition
- Ajoute les variantes punitives une par une
- Teste l'impacte du pool sur la rejouabilité

OPTION 3: ÉTENDRE AVEC TA PROPRE VOIX
- Le guide au-dessus t'explique comment créer des dialogues
- La structure JSON est extensible indéfiniment
- Ajoute autant de questions que tu veux
- Chaque dialogue peut avoir 2-5 variantes selon ton envie

================================================================================
QUESTIONS FRÉQUENTES
================================================================================

Q: Comment enlever une dialogue du pool ?
A: Ajoute "pool": false ou retire la ligne. Elle sera toujours disponible.

Q: Comment faire une question IMPOSSIBILITÉ au début ?
A: Ajoute "requirements": { "minTrust": 60 } au dialogue.

Q: Peut-on avoir plus de 3 questions visibles ?
A: Oui, change poolSize = 5 dans loadAllLyaTavernDialogues().

Q: Comment savoir quelle variante s'affiche ?
A: Le loader cherche la PREMIÈRE variante dont les conditions match.
   L'ordre dans le JSON = ordre de vérification.

Q: Peut-on faire des questions qui diminuent les stats ?
A: OUI. C'est exactement ce que les punitiveVariants font.
   "gains": { "respect": -2, "anger": +1 }

================================================================================
