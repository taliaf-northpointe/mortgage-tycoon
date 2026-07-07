import { describe, expect, it } from 'vitest';
import { createStarterState } from '../../src/engine/content/starter';
import { thankYouNote } from '../../src/engine/content/memoryWall';
import { advanceLoanStage } from '../../src/engine/tick';

describe('the Wall of Homes (v11)', () => {
  it('a funded loan writes a scrapbook page with the family, home, and note', () => {
    const s = createStarterState();
    const loan = s.loans['LN-2026-0001'];
    if (!loan) throw new Error('starter loan missing');
    loan.stage = 'closing';
    advanceLoanStage(s, loan); // closing → completed

    expect(loan.stage).toBe('completed');
    expect(s.memoryWall).toHaveLength(1);
    const page = s.memoryWall[0];
    expect(page?.customerName).toBe('Sarah Chen');
    expect(page?.portraitId).toBe(1);
    expect(page?.houseName).toBe('Cozy Bungalow');
    expect(page?.neighborhoodId).toBe('oldTown');
    expect(page?.product).toBe('fha');
    expect(page?.purpose).toBe('purchase');
    expect(page?.closingDay).toBe(s.clock.day);
    expect(page?.season).toBe('spring');
    expect(page?.note).toContain('golden retriever'); // Sarah's own voice
  });

  it('notes are persona-keyed with a seeded fallback for portrait-less customers', () => {
    expect(thankYouNote({ portraitId: 11, portraitSeed: 'x' })).toContain('service'); // the veteran
    const fallbackA = thankYouNote({ portraitSeed: 'old-customer-1' });
    const fallbackB = thankYouNote({ portraitSeed: 'old-customer-1' });
    expect(fallbackA).toBe(fallbackB); // deterministic
    expect(fallbackA.length).toBeGreaterThan(20);
  });
});
