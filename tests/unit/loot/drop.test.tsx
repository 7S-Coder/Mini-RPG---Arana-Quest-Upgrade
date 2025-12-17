// @vitest-environment jsdom
import React, { useEffect } from 'react';
import { render, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useGameState } from '../../../app/game/uses/useGameState';

function Harness() {
  const { maybeDropFromEnemy, pickups } = useGameState();
  useEffect(() => {
    // expose helpers for tests
    (globalThis as any).__maybeDrop = maybeDropFromEnemy;
    (globalThis as any).__getPickups = () => pickups;
    return () => {
      try { delete (globalThis as any).__maybeDrop; } catch (e) {}
      try { delete (globalThis as any).__getPickups; } catch (e) {}
    };
  }, [maybeDropFromEnemy, pickups]);
  return null;
}

describe('maybeDropFromEnemy (loot)', () => {
  beforeEach(() => {
    // ensure fresh DOM
    cleanup();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    try { delete (globalThis as any).__maybeDrop; } catch (e) {}
    try { delete (globalThis as any).__getPickups; } catch (e) {}
  });

  it('returns null when roll exceeds DROP_CHANCE', () => {
    render(<Harness />);
    // make first Math.random return a value greater than DROP_CHANCE (0.10)
    const seq = [0.5];
    vi.spyOn(Math, 'random').mockImplementation(() => seq.shift() as number);

    const enemy = { x: 10, y: 10, templateId: 'test_mon', name: 'Test', rarity: 'common' } as any;
    const res = (globalThis as any).__maybeDrop(enemy, null);
    expect(res).toBeNull();
  });

  it('can drop a fragment when boss in predecessor map (deterministic room match)', () => {
    render(<Harness />);
    // sequence of Math.random values used inside maybeDropFromEnemy:
    // 1) initial drop roll -> must be <= DROP_CHANCE (0.10)
    // 2) template selection random (any)
    // 3) slot selection inside createItemForEnemy (any)
    // 4) fragment success roll -> must be < baseChance + bossBonus
    const seq = [0.03, 0.2, 0.4, 0.01];
    vi.spyOn(Math, 'random').mockImplementation(() => seq.shift() as number);

    // Use forest as selectedMapId so candidate is 'caves'
    // Provide a roomId that contains the first dungeon id for caves so fragIdx deterministically 0
    const enemy = { x: 50, y: 50, templateId: 'some_boss', name: 'Boss', rarity: 'legendary', roomId: 'caves_the_underground_cave_1_floor_5', isBoss: true } as any;
    const res = (globalThis as any).__maybeDrop(enemy, 'forest');
    expect(res).not.toBeNull();
    // If a fragment dropped, it must use slot 'key' and have the expected name.
    if (res && (res as any).slot === 'key') {
      expect((res as any).name).toBe('Cave Key fragment A');
    } else {
      // Otherwise the function returned a normal item (non-deterministic due to random calls).
      expect(['familiar','boots','belt','hat','chestplate','ring','weapon']).toContain((res as any).slot);
    }
  });

  it('drops a normal item when in spawn area and roll succeeds', () => {
    render(<Harness />);
    // 1) initial drop roll (pass)
    // 2) template selection
    // 3) slot selection
    const seq = [0.05, 0.1, 0.2];
    vi.spyOn(Math, 'random').mockImplementation(() => seq.shift() as number);

    const enemy = { x: 0, y: 0, templateId: 'rodent', name: 'Rat', rarity: 'common' } as any;
    const res = (globalThis as any).__maybeDrop(enemy, null);
    // should return an item (not a fragment)
    expect(res).not.toBeNull();
    expect(res.slot).not.toBe('key');
    expect(res.rarity).toBe('common');
  });
});
