import { describe, it, expect } from 'vitest';
import { GAME_EVENTS, getEventById } from '../../app/game/templates/events';

describe('Complete Event Catalog Testing', () => {
  const allEventIds = [
    'blood_moon',
    'essence_storm',
    'whispering_shadows',
    'swarm_surge',
    'plague_mist',
    'frozen_peaks',
  ];

  describe('All Events Structure Validation', () => {
    it('should have all expected events defined', () => {
      allEventIds.forEach((id) => {
        const event = getEventById(id);
        expect(event).toBeDefined();
        expect(event?.id).toBe(id);
      });
    });

    it('each event should have required properties', () => {
      allEventIds.forEach((id) => {
        const event = getEventById(id);
        expect(event?.id).toBeDefined();
        expect(event?.name).toBeDefined();
        expect(event?.description).toBeDefined();
        expect(event?.lore).toBeDefined();
        expect(event?.type).toBeDefined();
        expect(['zone', 'combat']).toContain(event?.type);
        expect(event?.narrator).toBeDefined();
        expect(event?.duration).toBeGreaterThan(0);
        expect(event?.effects).toBeDefined();
        expect(Array.isArray(event?.effects)).toBe(true);
      });
    });
  });

  describe('Blood Moon Event', () => {
    const eventId = 'blood_moon';

    it('should be a zone event', () => {
      const event = getEventById(eventId);
      expect(event?.type).toBe('zone');
    });

    it('should have 5 battle duration', () => {
      const event = getEventById(eventId);
      expect(event?.duration).toBe(5);
    });

    it('should have enemy_bonus effect of +20%', () => {
      const event = getEventById(eventId);
      const effect = event?.effects.find((e) => e.type === 'enemy_bonus');
      expect(effect?.value).toBe(20);
    });

    it('should have rage_modifier effect of +30%', () => {
      const event = getEventById(eventId);
      const effect = event?.effects.find((e) => e.type === 'rage_modifier');
      expect(effect?.value).toBe(30);
    });

    it('should have loot_bonus effect of +10%', () => {
      const event = getEventById(eventId);
      const effect = event?.effects.find((e) => e.type === 'loot_bonus');
      expect(effect?.value).toBe(10);
    });

    it('should have dark red console tint', () => {
      const event = getEventById(eventId);
      expect(event?.consoleTint).toContain('rgb');
      expect(event?.consolePulse).toBe(true);
    });
  });

  describe('Essence Storm Event', () => {
    const eventId = 'essence_storm';

    it('should be a zone event', () => {
      const event = getEventById(eventId);
      expect(event?.type).toBe('zone');
    });

    it('should have 5 battle duration', () => {
      const event = getEventById(eventId);
      expect(event?.duration).toBe(5);
    });

    it('should have loot_bonus effect of +15%', () => {
      const event = getEventById(eventId);
      const effect = event?.effects.find((e) => e.type === 'loot_bonus');
      expect(effect?.value).toBe(15);
    });

    it('should have enemy_debuff effect of -10%', () => {
      const event = getEventById(eventId);
      const effect = event?.effects.find((e) => e.type === 'enemy_debuff');
      expect(effect?.value).toBe(10);
    });

    it('should have spawn_modifier effect of 0 (neutral)', () => {
      const event = getEventById(eventId);
      const effect = event?.effects.find((e) => e.type === 'spawn_modifier');
      expect(effect?.value).toBe(0);
    });

    it('should NOT have pulse effect', () => {
      const event = getEventById(eventId);
      expect(event?.consolePulse).toBe(false);
    });
  });

  describe('Whispering Shadows Event', () => {
    const eventId = 'whispering_shadows';

    it('should be a combat event (single encounter)', () => {
      const event = getEventById(eventId);
      expect(event?.type).toBe('combat');
    });

    it('should have duration of 1', () => {
      const event = getEventById(eventId);
      expect(event?.duration).toBe(1);
    });

    it('should have high rage_modifier of +50%', () => {
      const event = getEventById(eventId);
      const effect = event?.effects.find((e) => e.type === 'rage_modifier');
      expect(effect?.value).toBe(50);
    });

    it('should give dodge_bonus of +10%', () => {
      const event = getEventById(eventId);
      const effect = event?.effects.find((e) => e.type === 'dodge_bonus');
      expect(effect?.value).toBe(10);
    });

    it('should make enemies attack more often but player can dodge', () => {
      const event = getEventById(eventId);
      const rage = event?.effects.find((e) => e.type === 'rage_modifier');
      const dodge = event?.effects.find((e) => e.type === 'dodge_bonus');
      expect(rage?.value).toBeGreaterThan(0);
      expect(dodge?.value).toBeGreaterThan(0);
    });
  });

  describe('Swarm Surge Event', () => {
    const eventId = 'swarm_surge';

    it('should be a zone event', () => {
      const event = getEventById(eventId);
      expect(event?.type).toBe('zone');
    });

    it('should have 4 battle duration', () => {
      const event = getEventById(eventId);
      expect(event?.duration).toBe(4);
    });

    it('should increase spawn count by +2 enemies', () => {
      const event = getEventById(eventId);
      const effect = event?.effects.find((e) => e.type === 'spawn_modifier');
      expect(effect?.value).toBe(2);
    });

    it('should reduce enemy HP by -20%', () => {
      const event = getEventById(eventId);
      const effect = event?.effects.find((e) => e.type === 'enemy_bonus');
      expect(effect?.value).toBe(-20);
    });

    it('should give slight loot bonus of +5%', () => {
      const event = getEventById(eventId);
      const effect = event?.effects.find((e) => e.type === 'loot_bonus');
      expect(effect?.value).toBe(5);
    });

    it('should be balanced: more enemies but weaker', () => {
      const event = getEventById(eventId);
      const spawn = event?.effects.find((e) => e.type === 'spawn_modifier')?.value;
      const hp = event?.effects.find((e) => e.type === 'enemy_bonus')?.value;
      expect(spawn).toBeGreaterThan(0);
      expect(hp).toBeLessThan(0); // negative HP modifier
    });

    it('should have orange console tint with pulse', () => {
      const event = getEventById(eventId);
      expect(event?.consoleTint).toContain('255');
      expect(event?.consolePulse).toBe(true);
    });
  });

  describe('Plague Mist Event', () => {
    const eventId = 'plague_mist';

    it('should be a zone event', () => {
      const event = getEventById(eventId);
      expect(event?.type).toBe('zone');
    });

    it('should have 5 battle duration', () => {
      const event = getEventById(eventId);
      expect(event?.duration).toBe(5);
    });

    it('should reduce player damage by -10%', () => {
      const event = getEventById(eventId);
      const effect = event?.effects.find((e) => e.type === 'player_malus');
      expect(effect?.value).toBe(10);
    });

    it('should increase enemy damage by +10%', () => {
      const event = getEventById(eventId);
      const effect = event?.effects.find((e) => e.type === 'enemy_bonus');
      expect(effect?.value).toBe(10);
    });

    it('should give loot bonus of +8%', () => {
      const event = getEventById(eventId);
      const effect = event?.effects.find((e) => e.type === 'loot_bonus');
      expect(effect?.value).toBe(8);
    });

    it('should have sickly green tint', () => {
      const event = getEventById(eventId);
      expect(event?.consoleTint).toContain('100');
      expect(event?.consoleTint).toContain('150');
    });

    it('should weaken player while strengthening enemies', () => {
      const event = getEventById(eventId);
      const playerMalus = event?.effects.find((e) => e.type === 'player_malus');
      const enemyBonus = event?.effects.find((e) => e.type === 'enemy_bonus');
      expect(playerMalus?.value).toBeGreaterThan(0);
      expect(enemyBonus?.value).toBeGreaterThan(0);
    });
  });

  describe('Frozen Peaks Event', () => {
    const eventId = 'frozen_peaks';

    it('should be a zone event', () => {
      const event = getEventById(eventId);
      expect(event?.type).toBe('zone');
    });

    it('should have 4 battle duration', () => {
      const event = getEventById(eventId);
      expect(event?.duration).toBe(4);
    });

    it('should reduce enemy damage by -15%', () => {
      const event = getEventById(eventId);
      const effect = event?.effects.find((e) => e.type === 'enemy_bonus');
      expect(effect?.value).toBe(-15);
    });

    it('should reduce player dodge by -5%', () => {
      const event = getEventById(eventId);
      const effect = event?.effects.find((e) => e.type === 'dodge_bonus');
      expect(effect?.value).toBe(-5);
    });

    it('should give good loot bonus of +12%', () => {
      const event = getEventById(eventId);
      const effect = event?.effects.find((e) => e.type === 'loot_bonus');
      expect(effect?.value).toBe(12);
    });

    it('should have light blue console tint', () => {
      const event = getEventById(eventId);
      expect(event?.consoleTint).toContain('173');
      expect(event?.consoleTint).toContain('216');
      expect(event?.consoleTint).toContain('230');
    });

    it('should slow enemies more than player (risky but rewarding)', () => {
      const event = getEventById(eventId);
      const enemyDmg = event?.effects.find((e) => e.type === 'enemy_bonus')?.value;
      const dodge = event?.effects.find((e) => e.type === 'dodge_bonus')?.value;
      const loot = event?.effects.find((e) => e.type === 'loot_bonus')?.value;

      expect(enemyDmg).toBeLessThan(0); // Enemies hit less
      expect(dodge).toBeLessThan(0); // Player dodge less
      expect(loot).toBeGreaterThan(0); // But rewards are good
    });
  });

  describe('Event Type Distribution', () => {
    it('should have more zone events than combat events', () => {
      const zoneCount = allEventIds.filter((id) => getEventById(id)?.type === 'zone').length;
      const combatCount = allEventIds.filter((id) => getEventById(id)?.type === 'combat').length;
      expect(zoneCount).toBeGreaterThan(combatCount);
    });

    it('all zone events should have duration > 1', () => {
      allEventIds.forEach((id) => {
        const event = getEventById(id);
        if (event?.type === 'zone') {
          expect(event.duration).toBeGreaterThan(1);
        }
      });
    });

    it('all combat events should have duration = 1', () => {
      allEventIds.forEach((id) => {
        const event = getEventById(id);
        if (event?.type === 'combat') {
          expect(event.duration).toBe(1);
        }
      });
    });
  });

  describe('Effect Type Coverage', () => {
    it('should have spawn_modifier in at least one event', () => {
      const hasSpawn = allEventIds.some(
        (id) => getEventById(id)?.effects.some((e) => e.type === 'spawn_modifier')
      );
      expect(hasSpawn).toBe(true);
    });

    it('should have enemy_bonus in multiple events', () => {
      const count = allEventIds.filter((id) =>
        getEventById(id)?.effects.some((e) => e.type === 'enemy_bonus')
      ).length;
      expect(count).toBeGreaterThan(2);
    });

    it('should have loot_bonus in multiple events', () => {
      const count = allEventIds.filter((id) =>
        getEventById(id)?.effects.some((e) => e.type === 'loot_bonus')
      ).length;
      expect(count).toBeGreaterThan(2);
    });

    it('should have dodge_bonus in at least one event', () => {
      const hasRage = allEventIds.some((id) =>
        getEventById(id)?.effects.some((e) => e.type === 'dodge_bonus')
      );
      expect(hasRage).toBe(true);
    });

    it('should have rage_modifier in at least one event', () => {
      const hasRage = allEventIds.some((id) =>
        getEventById(id)?.effects.some((e) => e.type === 'rage_modifier')
      );
      expect(hasRage).toBe(true);
    });

    it('should have player_malus in at least one event', () => {
      const hasMalus = allEventIds.some((id) =>
        getEventById(id)?.effects.some((e) => e.type === 'player_malus')
      );
      expect(hasMalus).toBe(true);
    });
  });

  describe('Narrator Assignment', () => {
    it('all events should have an assigned narrator', () => {
      allEventIds.forEach((id) => {
        const event = getEventById(id);
        expect(event?.narrator).toBeDefined();
        expect(event?.narrator?.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Console Display Properties', () => {
    it('all events should have console tint color', () => {
      allEventIds.forEach((id) => {
        const event = getEventById(id);
        expect(event?.consoleTint).toBeDefined();
        expect(event?.consoleTint).toContain('rgba');
      });
    });

    it('all events should specify pulse behavior', () => {
      allEventIds.forEach((id) => {
        const event = getEventById(id);
        expect(typeof event?.consolePulse).toBe('boolean');
      });
    });
  });

  describe('Event Balance', () => {
    it('events should have variety in difficulty', () => {
      const effects = allEventIds.flatMap((id) =>
        getEventById(id)?.effects.map((e) => ({ eventId: id, ...e })) || []
      );

      const positiveEffects = effects.filter((e) => e.value > 0).length;
      const negativeEffects = effects.filter((e) => e.value < 0).length;

      expect(positiveEffects).toBeGreaterThan(0);
      expect(negativeEffects).toBeGreaterThan(0);
    });

    it('high difficulty events should have compensating rewards', () => {
      // swarm_surge: hard (+2 enemies) but lower enemy HP + loot bonus
      const swarm = getEventById('swarm_surge');
      const hasSpawnModifier = swarm?.effects.some((e) => e.type === 'spawn_modifier' && e.value > 0);
      const hasLootBonus = swarm?.effects.some((e) => e.type === 'loot_bonus' && e.value > 0);
      expect(hasSpawnModifier).toBe(true);
      expect(hasLootBonus).toBe(true);
    });
  });

  describe('Event Completeness', () => {
    it('should have no undefined values in effect properties', () => {
      allEventIds.forEach((id) => {
        const event = getEventById(id);
        event?.effects.forEach((effect) => {
          expect(effect.type).toBeDefined();
          expect(effect.value).toBeDefined();
          expect(typeof effect.value).toBe('number');
        });
      });
    });

    it('event descriptions should be meaningful', () => {
      allEventIds.forEach((id) => {
        const event = getEventById(id);
        expect(event?.description).toBeDefined();
        expect(event?.description?.length).toBeGreaterThan(5);
      });
    });

    it('event lore should be meaningful', () => {
      allEventIds.forEach((id) => {
        const event = getEventById(id);
        expect(event?.lore).toBeDefined();
        expect(event?.lore?.length).toBeGreaterThan(10);
      });
    });
  });
});
