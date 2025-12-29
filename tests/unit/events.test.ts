import { describe, it, expect } from 'vitest';
import { GAME_EVENTS, getEventById, getZoneEvents, getCombatEvents, pickRandomEvent } from '../../app/game/templates/events';

describe('Event System', () => {
  describe('Event Structure', () => {
    it('should have blood_moon event defined', () => {
      const event = getEventById('blood_moon');
      expect(event).toBeDefined();
      expect(event?.name).toBe('Blood Moon');
      expect(event?.type).toBe('zone');
    });

    it('should have swarm_surge event with spawn_modifier', () => {
      const event = getEventById('swarm_surge');
      expect(event).toBeDefined();
      expect(event?.effects).toBeDefined();
      const spawnEffect = event?.effects.find((e) => e.type === 'spawn_modifier');
      expect(spawnEffect).toBeDefined();
      expect(spawnEffect?.value).toBe(2);
    });
  });

  describe('Event Effects', () => {
    it('blood_moon should have enemy_bonus and rage_modifier', () => {
      const event = getEventById('blood_moon');
      const damageBonus = event?.effects.find((e) => e.type === 'enemy_bonus');
      const rageBonus = event?.effects.find((e) => e.type === 'rage_modifier');

      expect(damageBonus?.value).toBe(20);
      expect(rageBonus?.value).toBe(30);
    });

    it('plague_mist should have player_malus', () => {
      const event = getEventById('plague_mist');
      const playerMalus = event?.effects.find((e) => e.type === 'player_malus');
      expect(playerMalus?.value).toBe(10);
    });

    it('swarm_surge should reduce enemy HP but increase spawn', () => {
      const event = getEventById('swarm_surge');
      const spawnBonus = event?.effects.find((e) => e.type === 'spawn_modifier');
      const hpMalus = event?.effects.find((e) => e.type === 'enemy_bonus');

      expect(spawnBonus?.value).toBe(2);
      expect(hpMalus?.value).toBe(-20); // negative = reduced damage
    });

    it('frozen_peaks should have dodge_bonus (negative)', () => {
      const event = getEventById('frozen_peaks');
      const dodgeBonus = event?.effects.find((e) => e.type === 'dodge_bonus');
      expect(dodgeBonus?.value).toBe(-5);
    });
  });

  describe('Event Filtering', () => {
    it('should get only zone events', () => {
      const zoneEvents = getZoneEvents();
      expect(zoneEvents.length).toBeGreaterThan(0);
      zoneEvents.forEach((event) => {
        expect(event.type).toBe('zone');
      });
    });

    it('should get only combat events', () => {
      const combatEvents = getCombatEvents();
      expect(combatEvents.length).toBeGreaterThan(0);
      combatEvents.forEach((event) => {
        expect(event.type).toBe('combat');
      });
    });
  });

  describe('Event Selection', () => {
    it('pickRandomEvent should return a valid event', () => {
      const event = pickRandomEvent();
      expect(event).toBeDefined();
      expect(event?.id).toBeDefined();
      expect(event?.effects).toBeDefined();
    });

    it('pickRandomEvent with zone filter should return zone event', () => {
      const event = pickRandomEvent('zone');
      expect(event?.type).toBe('zone');
    });

    it('pickRandomEvent with combat filter should return combat event', () => {
      const event = pickRandomEvent('combat');
      expect(event?.type).toBe('combat');
    });
  });

  describe('Event Durations', () => {
    it('zone events should have duration > 1', () => {
      const zoneEvents = getZoneEvents();
      zoneEvents.forEach((event) => {
        expect(event.duration).toBeGreaterThan(1);
      });
    });

    it('combat events should have duration = 1', () => {
      const combatEvents = getCombatEvents();
      combatEvents.forEach((event) => {
        expect(event.duration).toBe(1);
      });
    });
  });
});
