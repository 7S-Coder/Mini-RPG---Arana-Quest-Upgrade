// @vitest-environment jsdom
import React, { useEffect } from 'react';
import { render, cleanup, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import useEvents from '../../../app/game/uses/useEvents';
import { GAME_EVENTS } from '../../../app/game/templates/events';

/**
 * Test that Swarm Surge event correctly increases enemy spawn count
 * 
 * Instead of waiting for random event trigger, we force the event
 * and verify that spawn_modifier is applied correctly.
 */

function TestHarness() {
  const {
    setActiveEvent,
    getActiveEventEffects,
  } = useEvents();

  useEffect(() => {
    // Expose functions for testing
    (globalThis as any).__testHarness = {
      setActiveEvent,
      getActiveEventEffects,
      getGameEvents: () => GAME_EVENTS,
    };
    
    return () => {
      try { delete (globalThis as any).__testHarness; } catch (e) {}
    };
  }, [setActiveEvent, getActiveEventEffects]);

  return null;
}

describe('TC-EVENT-01 — Swarm Surge spawn modifier', () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    try { delete (globalThis as any).__testHarness; } catch (e) {}
  });

  it('should increase enemy spawn count by 2 when Swarm Surge is active', async () => {
    render(<TestHarness />);

    const harness = (globalThis as any).__testHarness;
    expect(harness).toBeDefined();

    // Force Swarm Surge event
    const swarmSurge = GAME_EVENTS['swarm_surge'];
    expect(swarmSurge).toBeDefined();
    expect(swarmSurge.effects.find((e) => e.type === 'spawn_modifier')).toBeDefined();
    expect(swarmSurge.effects.find((e) => e.type === 'spawn_modifier')?.value).toBe(2);

    // Activate the event
    await act(async () => {
      harness.setActiveEvent({
        ...swarmSurge,
        activatedAt: Date.now(),
        durationRemaining: swarmSurge.duration,
      });
    });

    // Verify spawn modifier is applied
    const effects = harness.getActiveEventEffects();
    expect(effects.spawn_count_bonus).toBe(2);
  });

  it('Swarm Surge should also reduce enemy damage by 20%', () => {
    const swarmSurge = GAME_EVENTS['swarm_surge'];
    
    // Verify effects structure
    const spawnEffect = swarmSurge.effects.find((e) => e.type === 'spawn_modifier');
    const damageEffect = swarmSurge.effects.find((e) => e.type === 'enemy_bonus');

    expect(spawnEffect?.value).toBe(2);
    expect(damageEffect?.value).toBe(-20); // negative = reduced damage
  });

  it('Blood Moon should increase enemy damage by 20%', () => {
    const bloodMoon = GAME_EVENTS['blood_moon'];
    
    const damageEffect = bloodMoon.effects.find((e) => e.type === 'enemy_bonus');
    const rageEffect = bloodMoon.effects.find((e) => e.type === 'rage_modifier');

    expect(damageEffect?.value).toBe(20);
    expect(rageEffect?.value).toBe(30);
  });

  it('should apply event effects to enemy calculations', () => {
    // Verify that event effects are properly structured
    const testEvent = GAME_EVENTS['swarm_surge'];
    
    // Test spawn calculation with modifier
    const baseSpawn = 2;
    const modifier = testEvent.effects.find((e) => e.type === 'spawn_modifier')?.value || 0;
    const finalSpawn = Math.max(1, baseSpawn + modifier);

    expect(finalSpawn).toBe(4); // 2 + 2
  });

  it('should balance difficulty with compensating modifiers', () => {
    const swarmSurge = GAME_EVENTS['swarm_surge'];
    
    // Swarm Surge: +2 enemies but -20% damage = balanced
    const spawnBonus = swarmSurge.effects.find((e) => e.type === 'spawn_modifier')?.value || 0;
    const damageReduction = swarmSurge.effects.find((e) => e.type === 'enemy_bonus')?.value || 0;
    const lootBonus = swarmSurge.effects.find((e) => e.type === 'loot_bonus')?.value || 0;

    expect(spawnBonus).toBeGreaterThan(0); // More enemies
    expect(damageReduction).toBeLessThan(0); // But weaker
    expect(lootBonus).toBeGreaterThan(0); // And better loot as compensation
  });
});
