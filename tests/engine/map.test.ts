import { describe, expect, it } from 'vitest';
import { SCOUTING_COST, TUTORIAL_RESEARCH, TUTORIAL_XP } from '../../src/engine/constants';
import { createStarterState } from '../../src/engine/content/starter';
import {
  branchBlockedReason,
  branchCount,
  openBranch,
  refreshNeighborhoodAvailability,
  scoutNeighborhood,
} from '../../src/engine/map';
import { completeTutorial } from '../../src/engine/playerActions';
import type { GameState } from '../../src/engine/types';

function ceoState(): GameState {
  const s = createStarterState();
  s.stats.level = 4;
  s.stats.reputation = 65;
  s.currencies.coins = 60_000;
  return s;
}

describe('scouting (GDD §9)', () => {
  it('reveals a neighborhood for a small fee', () => {
    const s = scoutNeighborhood(ceoState(), 'riversideVillage');
    expect(s.neighborhoods['riversideVillage']?.scouted).toBe(true);
    expect(s.currencies.coins).toBe(60_000 - SCOUTING_COST);
    expect(s.eventLog.some((e) => e.title.includes('Scouts are back'))).toBe(true);
  });

  it('refuses double-scouting and empty pockets', () => {
    const scouted = scoutNeighborhood(ceoState(), 'riversideVillage');
    expect(scoutNeighborhood(scouted, 'riversideVillage')).toBe(scouted);
    const broke = ceoState();
    broke.currencies.coins = 100;
    expect(scoutNeighborhood(broke, 'riversideVillage')).toBe(broke);
  });
});

describe('branch expansion (GDD §9) — the M8 acceptance target', () => {
  it('opens Riverside Village for $45,000 at Level 4', () => {
    const s = openBranch(ceoState(), 'riversideVillage');
    expect(s.neighborhoods['riversideVillage']?.status).toBe('branch');
    expect(s.currencies.coins).toBe(60_000 - 45_000);
    expect(branchCount(s)).toBe(1);
    expect(s.eventLog.some((e) => e.title.includes('New branch open in Riverside Village'))).toBe(true);
  });

  it('is gated by level, reputation, and coins with friendly reasons', () => {
    const low = createStarterState();
    expect(branchBlockedReason(low, 'riversideVillage')).toContain('Level 4');

    const poorRep = ceoState();
    poorRep.stats.reputation = 50;
    expect(branchBlockedReason(poorRep, 'riversideVillage')).toContain('reputation');

    const broke = ceoState();
    broke.currencies.coins = 1_000;
    expect(branchBlockedReason(broke, 'riversideVillage')).toContain('coins');

    expect(branchBlockedReason(ceoState(), 'riversideVillage')).toBeNull();
  });

  it('locked neighborhoods open up as reputation grows', () => {
    const s = ceoState();
    s.stats.reputation = 75;
    refreshNeighborhoodAvailability(s);
    expect(s.neighborhoods['greenValley']?.status).toBe('available');
    expect(s.neighborhoods['uptownHills']?.status).toBe('available');
  });
});

describe('tutorial completion (GDD §13 decision 11)', () => {
  it('completing pays XP + research and never repeats', () => {
    const s = completeTutorial(createStarterState(), false);
    expect(s.meta.tutorialDone).toBe(true);
    expect(s.stats.xp).toBe(TUTORIAL_XP);
    expect(s.currencies.research).toBe(TUTORIAL_RESEARCH);
    expect(completeTutorial(s, false)).toBe(s);
  });

  it('skipping closes it without rewards', () => {
    const s = completeTutorial(createStarterState(), true);
    expect(s.meta.tutorialDone).toBe(true);
    expect(s.stats.xp).toBe(0);
    expect(s.currencies.research).toBe(0);
  });
});
