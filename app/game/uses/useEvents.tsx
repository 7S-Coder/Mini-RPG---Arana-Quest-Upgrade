"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { GameEvent, ActiveGameEvent } from "../types";
import { pickRandomEvent, getEventById } from "../templates/events";

/**
 * useEvents Hook
 *
 * Manages active event state, triggering, and persistence.
 *
 * Flow:
 * 1. tryTriggerEvent() called after each combat win
 * 2. Checks win streak & event chance
 * 3. If triggered, activates event and broadcasts narration
 * 4. Event persists via durationRemaining
 * 5. On player death, chance resets temporarily
 */

export function useEvents() {
  const [activeEvent, setActiveEvent] = useState<ActiveGameEvent | null>(null);
  const activeEventRef = useRef<ActiveGameEvent | null>(null);
  useEffect(() => {
    activeEventRef.current = activeEvent;
  }, [activeEvent]);

  // Temporary penalty for triggering chance after death
  const [eventCooldown, setEventCooldown] = useState<number>(0);
  const eventCooldownRef = useRef<number>(eventCooldown);
  useEffect(() => {
    eventCooldownRef.current = eventCooldown;
  }, [eventCooldown]);

  /**
   * Calculate event trigger chance based on win streak
   * Streak 0-3: 0% (warmup)
   * Streak 4-9: 15% per battle
   * Streak 10-19: 25% per battle
   * Streak 20+: 40% per battle
   */
  const getEventChance = useCallback((winStreak: number): number => {
    if (winStreak < 4) return 0;
    if (winStreak < 10) return 15;
    if (winStreak < 20) return 25;
    return 40;
  }, []);

  /**
   * Try to trigger a new event (called after combat win)
   * Returns the triggered event or null
   */
  const tryTriggerEvent = useCallback(
    (winStreak: number, onNarration?: (text: React.ReactNode) => void): GameEvent | null => {
      // Don't trigger if already active
      if (activeEventRef.current) {
        return null;
      }

      // Don't trigger if in cooldown (after death)
      if (eventCooldownRef.current > 0) {
        setEventCooldown((c) => Math.max(0, c - 1));
        return null;
      }

      const chance = getEventChance(winStreak);
      const roll = Math.random() * 100;

      if (roll < chance) {
        const event = pickRandomEvent();
        if (event) {
          const active: ActiveGameEvent = {
            ...event,
            activatedAt: Date.now(),
            durationRemaining: event.duration,
          };
          setActiveEvent(active);

          // Broadcast narration
          if (onNarration) {
            onNarration(
              <div className="event-trigger-message">
                <strong>{event.icon} {event.name}</strong> — {event.description}
              </div>
            );
          }

          return event;
        }
      }

      return null;
    },
    [getEventChance]
  );

  /**
   * Decrement event duration (called after each battle)
   */
  const decrementEventDuration = useCallback(() => {
    if (activeEventRef.current) {
      const remaining = activeEventRef.current.durationRemaining - 1;
      if (remaining <= 0) {
        setActiveEvent(null);
      } else {
        setActiveEvent((prev) =>
          prev ? { ...prev, durationRemaining: remaining } : null
        );
      }
    }
  }, []);

  /**
   * End active event (e.g., on player death)
   * Also applies a cooldown to reduce event chance temporarily
   */
  const endActiveEvent = useCallback(() => {
    if (activeEventRef.current) {
      setActiveEvent(null);
      setEventCooldown(3); // 3 battles of reduced chance
    }
  }, []);

  /**
   * Load event from save data
   */
  const loadFromSave = useCallback((savedEvent: ActiveGameEvent | null) => {
    if (savedEvent) {
      setActiveEvent(savedEvent);
    }
  }, []);

  /**
   * Get save data
   */
  const getSaveData = useCallback(() => {
    return {
      activeEvent: activeEventRef.current || null,
      eventCooldown: eventCooldownRef.current,
    };
  }, []);

  /**
   * Get effects multipliers for current active event
   * Used in combat calculations
   */
  const getActiveEventEffects = useCallback(
    () => {
      if (!activeEventRef.current) return null;

      const effects: Record<string, number> = {
        enemy_damage_bonus: 0,
        player_damage_malus: 0,
        spawn_count_bonus: 0,
        enemy_rage_bonus: 0,
        player_dodge_bonus: 0,
        loot_rarity_bonus: 0,
        enemy_defense_debuff: 0,
      };

      for (const effect of activeEventRef.current.effects) {
        switch (effect.type) {
          case "enemy_bonus":
            effects.enemy_damage_bonus += effect.value;
            break;
          case "player_malus":
            effects.player_damage_malus += effect.value;
            break;
          case "spawn_modifier":
            effects.spawn_count_bonus += effect.value;
            break;
          case "rage_modifier":
            effects.enemy_rage_bonus += effect.value;
            break;
          case "dodge_bonus":
            effects.player_dodge_bonus += effect.value;
            break;
          case "loot_bonus":
            effects.loot_rarity_bonus += effect.value;
            break;
          case "enemy_debuff":
            effects.enemy_defense_debuff += effect.value;
            break;
        }
      }

      return effects;
    },
    []
  );

  return {
    activeEvent,
    setActiveEvent,
    getEventChance,
    tryTriggerEvent,
    decrementEventDuration,
    endActiveEvent,
    loadFromSave,
    getSaveData,
    getActiveEventEffects,
  };
}

export default useEvents;
