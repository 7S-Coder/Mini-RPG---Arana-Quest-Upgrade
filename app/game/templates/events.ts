import type { GameEvent } from "../types";
import type { NPCName } from "./narration";

/**
 * EVENTS CATALOG
 *
 * Events that trigger randomly during farming to add narrative
 * flavor, modify combat rules temporarily, and enhance player agency.
 *
 * Zone Events: persist across multiple battles until duration expires
 * Combat Events: single-encounter effects that trigger independently
 *
 * Effects are applied via modifiers in the combat system:
 * - enemy_bonus: % increase to enemy damage
 * - player_malus: % decrease to player damage
 * - spawn_modifier: +/- number of enemies spawned
 * - rage_modifier: % change to enemy rage gain per turn
 * - dodge_bonus: % increase to player dodge chance
 * - loot_bonus: % increase to loot rarity
 * - enemy_debuff: % decrease to enemy defense
 */

export const GAME_EVENTS: Record<string, GameEvent> = {
  // ===== ZONE EVENTS =====
  blood_moon: {
    id: "blood_moon",
    name: "Blood Moon",
    description: "Enemies are enraged",
    lore: "The moon turns crimson. Creatures howl with unnatural fury.",
    type: "zone",
    narrator: "messenger" as NPCName,
    icon: "",
    duration: 5, // lasts for ~5 battles
    consoleTint: "rgba(139, 0, 0, 0.3)", // dark red tint
    consolePulse: true,
    effects: [
      { type: "enemy_bonus", value: 20 }, // +20% enemy damage
      { type: "rage_modifier", value: 30 }, // +30% rage gain
      { type: "loot_bonus", value: 10 }, // +10% loot rarity
    ],
  },

  essence_storm: {
    id: "essence_storm",
    name: "Essence Storm",
    description: "Power flows wildly",
    lore: "Essence surges through the air. Reality feels unstable.",
    type: "zone",
    narrator: "eldran" as NPCName,
    icon: "",
    duration: 5,
    consoleTint: "rgba(75, 0, 130, 0.3)", // indigo tint
    consolePulse: false,
    effects: [
      { type: "loot_bonus", value: 15 }, // +15% essence drop chance
      { type: "enemy_debuff", value: 10 }, // -10% enemy defense (unstable)
      { type: "spawn_modifier", value: 0 }, // neutral for now (can be modified)
    ],
  },

  // ===== COMBAT EVENTS (single-encounter) =====
  whispering_shadows: {
    id: "whispering_shadows",
    name: "Whispering Shadows",
    description: "Unseen forces interfere",
    lore: "Shadows whisper forgotten names. You feel watched.",
    type: "combat",
    narrator: "messenger" as NPCName,
    icon: "",
    duration: 1, // single combat event
    consoleTint: "rgba(30, 30, 40, 0.5)", // dark tint with slight transparency
    consolePulse: false,
    effects: [
      { type: "rage_modifier", value: 50 }, // +50% enemy rage (enemies attack 2x more often)
      { type: "dodge_bonus", value: 10 }, // +10% player dodge
    ],
  },

  swarm_surge: {
    id: "swarm_surge",
    name: "Swarm Surge",
    description: "Enemy numbers increased",
    lore: "The ground trembles. More creatures join the fray!",
    type: "zone",
    narrator: "brak" as NPCName,
    icon: "",
    duration: 4,
    consoleTint: "rgba(255, 140, 0, 0.3)", // orange tint
    consolePulse: true,
    effects: [
      { type: "spawn_modifier", value: 2 }, // +2 enemies per encounter
      { type: "enemy_bonus", value: -20 }, // -20% enemy HP (balanced)
      { type: "loot_bonus", value: 5 }, // slight XP/loot boost
    ],
  },

  // ===== ADDITIONAL EVENTS (future expansion) =====
  plague_mist: {
    id: "plague_mist",
    name: "Plague Mist",
    description: "Poison clouds linger",
    lore: "Noxious vapor seeps from the earth. Every breath burns.",
    type: "zone",
    narrator: "eldran" as NPCName,
    icon: "",
    duration: 5,
    consoleTint: "rgba(100, 150, 100, 0.3)", // sickly green tint
    consolePulse: false,
    effects: [
      { type: "player_malus", value: 10 }, // -10% player damage (weakened)
      { type: "enemy_bonus", value: 10 }, // +10% enemy damage (emboldened)
      { type: "loot_bonus", value: 8 },
    ],
  },

  frozen_peaks: {
    id: "frozen_peaks",
    name: "Frozen Peaks",
    description: "Icy chill slows movement",
    lore: "Bitter cold settles across the land. Movement feels sluggish.",
    type: "zone",
    narrator: "lya" as NPCName,
    icon: "",
    duration: 4,
    consoleTint: "rgba(173, 216, 230, 0.3)", // light blue tint
    consolePulse: false,
    effects: [
      { type: "enemy_bonus", value: -15 }, // -15% enemy damage (slowed)
      { type: "dodge_bonus", value: -5 }, // -5% player dodge (sluggish)
      { type: "loot_bonus", value: 12 }, // good loot chance
    ],
  },
};

/**
 * Get event by ID
 */
export function getEventById(id: string): GameEvent | null {
  return GAME_EVENTS[id] || null;
}

/**
 * Get all zone events
 */
export function getZoneEvents(): GameEvent[] {
  return Object.values(GAME_EVENTS).filter((e) => e.type === "zone");
}

/**
 * Get all combat events
 */
export function getCombatEvents(): GameEvent[] {
  return Object.values(GAME_EVENTS).filter((e) => e.type === "combat");
}

/**
 * Pick a random event from available pool
 */
export function pickRandomEvent(eventType?: "zone" | "combat"): GameEvent | null {
  const pool = eventType ? (eventType === "zone" ? getZoneEvents() : getCombatEvents()) : Object.values(GAME_EVENTS);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
