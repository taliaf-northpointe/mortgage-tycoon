import { describe, expect, it } from 'vitest';
import {
  MARKET_COOLDOWN_DAYS,
  MARKET_MOOD_DAYS,
  PRODUCT_TIME_FACTOR,
  PRODUCT_UNLOCK_LEVEL,
  RATE_SPIKE_RATE,
  REFI_BOOM_RATE,
  STAGE_HOURS_REQUIRED,
} from '../../src/engine/constants';
import { maybeSpawnLead } from '../../src/engine/content/leads';
import { createStarterState, STARTER_LOAN_ID } from '../../src/engine/content/starter';
import { stageHoursRequired } from '../../src/engine/loans';
import { moveBlockedReason } from '../../src/engine/playerActions';
import { advanceDay } from '../../src/engine/tick';
import type { GameState, LoanProduct } from '../../src/engine/types';

/** Spawn many mornings' worth of leads and collect the products that arrived. */
function productsSpawned(level: number, seeds: number[], days = 20): Set<LoanProduct> {
  const seen = new Set<LoanProduct>();
  for (const seed of seeds) {
    const base = createStarterState(seed);
    base.stats.level = level;
    for (let day = 1; day <= days; day++) {
      const s = structuredClone(base);
      s.clock.day = day;
      // plenty of room under the loan cap so the spawn gate never blocks
      s.loans = {};
      s.customers = {};
      maybeSpawnLead(s);
      for (const loan of Object.values(s.loans)) seen.add(loan.product);
    }
  }
  return seen;
}

describe('specialty loan products (playtest 2026-07-07 — the late game opens up)', () => {
  const seeds = [1, 2, 3, 4, 5];

  it('below level 16 only the classic three products walk in', () => {
    const seen = productsSpawned(15, seeds);
    expect(seen.has('jumbo')).toBe(false);
    expect(seen.has('construction')).toBe(false);
    expect(seen.has('usda')).toBe(false);
    expect(seen.size).toBeGreaterThan(0); // leads did spawn
  });

  it('jumbo shoppers arrive from level 16, construction from 22, usda from 26', () => {
    const at16 = productsSpawned(16, seeds);
    expect(at16.has('jumbo')).toBe(true);
    expect(at16.has('construction')).toBe(false); // still locked
    expect(at16.has('usda')).toBe(false);

    const at30 = productsSpawned(30, seeds);
    expect(at30.has('jumbo')).toBe(true);
    expect(at30.has('construction')).toBe(true);
    expect(at30.has('usda')).toBe(true);
  });

  it('jumbo loans are genuinely bigger than their archetype', () => {
    // scan for a jumbo spawn and check the money is jumbo-sized
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const s = createStarterState(seed);
      s.stats.level = 20;
      s.loans = {};
      s.customers = {};
      for (let day = 1; day <= 30; day++) {
        s.clock.day = day;
        maybeSpawnLead(s);
      }
      const jumbo = Object.values(s.loans).find((l) => l.product === 'jumbo');
      if (jumbo) {
        expect(jumbo.amount).toBeGreaterThan(450_000); // smallest range × 2.6
        return;
      }
    }
    throw new Error('no jumbo lead spawned across the scan — twist chance broken?');
  });

  it('construction loans take longer at every stage', () => {
    const s = createStarterState();
    const loan = s.loans[STARTER_LOAN_ID];
    if (!loan) throw new Error('starter loan missing');
    loan.stage = 'processing';

    const normalHours = stageHoursRequired(loan);
    loan.product = 'construction';
    const buildHours = stageHoursRequired(loan);
    expect(buildHours).toBe(normalHours * (PRODUCT_TIME_FACTOR.construction ?? 1));
    expect(buildHours).toBeGreaterThan(STAGE_HOURS_REQUIRED.processing);

    // the manual move respects the longer wait, too
    loan.progressHours = STAGE_HOURS_REQUIRED.processing; // enough for normal, not for a build
    expect(moveBlockedReason(s, STARTER_LOAN_ID)).toContain('Still in the works');
  });

  it('unlock levels are spread across the late game', () => {
    expect(PRODUCT_UNLOCK_LEVEL.jumbo).toBe(16);
    expect(PRODUCT_UNLOCK_LEVEL.construction).toBe(22);
    expect(PRODUCT_UNLOCK_LEVEL.usda).toBe(26);
  });
});

describe('market moods (playtest 2026-07-07 — the rate makes headlines)', () => {
  function atRate(rate: number): GameState {
    const s = createStarterState();
    s.stats.interestRate = rate;
    return s;
  }

  it('a rate low sparks a refi boom with a morning headline', () => {
    // pin the drift so the rate stays low through the rollover
    let s = atRate(REFI_BOOM_RATE - 1);
    s = advanceDay(s);
    // drift moves ±0.15 max, so the rate is still at or under the threshold
    expect(s.market?.mood).toBe('refiBoom');
    expect(s.market?.daysLeft).toBe(MARKET_MOOD_DAYS);
    expect(s.eventLog.some((e) => e.title.includes('refi boom'))).toBe(true);
  });

  it('a rate spike spooks the shoppers', () => {
    let s = atRate(RATE_SPIKE_RATE + 1);
    s = advanceDay(s);
    expect(s.market?.mood).toBe('rateSpike');
    expect(s.eventLog.some((e) => e.title.includes('spiked'))).toBe(true);
  });

  it('moods expire into a quiet cooldown — no headline spam', () => {
    let s = atRate(REFI_BOOM_RATE - 1);
    s = advanceDay(s); // boom begins
    for (let i = 0; i < MARKET_MOOD_DAYS; i++) s = advanceDay(s);
    expect(s.market?.mood).toBe('calm'); // settled, cooling down
    expect(s.market?.daysLeft).toBe(MARKET_COOLDOWN_DAYS);

    // during the cooldown no new boom starts, however low the rate sits
    s.stats.interestRate = REFI_BOOM_RATE - 1;
    const next = advanceDay(s);
    expect(next.market?.mood).toBe('calm');
  });

  it('ordinary rates make no headlines at all', () => {
    const s = advanceDay(atRate(6.4));
    expect(s.market ?? null).toBeNull();
  });
});
