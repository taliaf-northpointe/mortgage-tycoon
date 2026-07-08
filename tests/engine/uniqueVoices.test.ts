import { describe, expect, it } from 'vitest';
import { generateCandidates } from '../../src/engine/content/candidates';
import { buildMemoryEntry, thankYouNote } from '../../src/engine/content/memoryWall';
import { createStarterState } from '../../src/engine/content/starter';
import { parseSave } from '../../src/store/saveSystem';
import type { Customer, GameState, Loan } from '../../src/engine/types';

function familyFor(state: GameState, n: number, portraitId: number): { loan: Loan; customer: Customer } {
  const customer: Customer = {
    id: `cust-${n}`,
    name: `Family No. ${n}`,
    age: 30,
    buyerTypeLabel: 'First-time Homebuyers',
    traits: ['enthusiastic'],
    happiness: 90,
    happinessAtWeekStart: 90,
    trust: 3,
    portraitSeed: `cust-${n}`,
    portraitId,
    houseId: portraitId,
    dreamHome: {
      name: 'Redbrick Corner House',
      neighborhoodId: 'oldTown',
      beds: 3,
      baths: 2,
      categoryChip: 'Starter Home',
      price: 250_000,
      downPayment: 25_000,
      monthly: 1_400,
    },
  };
  const loan: Loan = {
    id: `LN-2026-9${String(n).padStart(3, '0')}`,
    customerId: customer.id,
    product: 'fha',
    purpose: 'purchase',
    amount: 225_000,
    stage: 'completed',
    daysInPipeline: 4,
    documents: {} as Loan['documents'],
    assignedEmployeeId: null,
    statusTag: 'Closed',
    rate: 6.4,
    termYears: 30,
    progressHours: 0,
    delayed: false,
  };
  state.customers[customer.id] = customer;
  state.loans[loan.id] = loan;
  return { loan, customer };
}

describe('wall notes never repeat (playtest 2026-07-07)', () => {
  it('the same portrait under different names leaves different notes', () => {
    const s = createStarterState();
    for (let n = 1; n <= 5; n++) {
      const { loan, customer } = familyFor(s, n, 17); // five bearded-dragon families
      s.memoryWall.push(buildMemoryEntry(s, loan, customer));
    }
    const notes = s.memoryWall.map((page) => page.note);
    expect(new Set(notes).size).toBe(notes.length); // all distinct
  });

  it('a truly full wall still never repeats, thanks to the named fallbacks', () => {
    const used = new Set<string>();
    for (let n = 1; n <= 80; n++) {
      const note = thankYouNote({ portraitId: 17, portraitSeed: `cust-${n}`, name: `Family No. ${n}` }, used);
      expect(used.has(note)).toBe(false);
      used.add(note);
    }
  });

  it("a solo buyer never signs a 'we' note; a couple never signs an 'I' note", () => {
    const used = new Set<string>();
    // portrait 23 (Dante, solo) — drain many notes and audit the pronouns
    for (let n = 1; n <= 30; n++) {
      const note = thankYouNote({ portraitId: 23, portraitSeed: `solo-${n}`, name: `Solo No. ${n}` }, used);
      expect(note).not.toMatch(/\b(we|our|us|ours)\b/i);
      used.add(note);
    }
    // portrait 17 (a couple) — their notes never speak as a single "I/my"
    const coupleUsed = new Set<string>();
    for (let n = 1; n <= 30; n++) {
      const note = thankYouNote({ portraitId: 17, portraitSeed: `duo-${n}`, name: `Duo No. ${n}` }, coupleUsed);
      expect(note).not.toMatch(/\bI\b|\bmy\b|\bMy\b/);
      coupleUsed.add(note);
    }
  });

  it('v12 → v13 rewrites the repetitive kettle-template notes', () => {
    const base = createStarterState() as unknown as Record<string, unknown>;
    const save = structuredClone(base);
    (save['meta'] as Record<string, unknown>)['saveVersion'] = 12;
    const kettle = (n: string) => `The keys are ours and the kettle is on — come by any time! — ${n}`;
    save['memoryWall'] = ['Ada Lane', 'Bo Reyes', 'Cy Marsh'].map((name, i) => ({
      loanId: `LN-${i}`, customerName: name, portraitId: 9, portraitSeed: `seed-${i}`, houseName: 'H',
      neighborhoodId: 'oldTown', product: 'fha', purpose: 'purchase', amount: 1, closingDay: i, season: 'spring',
      note: kettle(name),
    }));
    const migrated = parseSave(JSON.stringify(save));
    for (const page of migrated.memoryWall) {
      expect(page.note).not.toContain('the kettle is on — come by any time');
    }
    const notes = migrated.memoryWall.map((p) => p.note);
    expect(new Set(notes).size).toBe(notes.length);
  });

  it('v12 → v13 backfills upgrade tiers added after the save was created', () => {
    const base = createStarterState() as unknown as Record<string, unknown>;
    const save = structuredClone(base);
    (save['meta'] as Record<string, unknown>)['saveVersion'] = 12;
    // a pre-tier-6 save: full office track owned, new ids entirely absent
    const upgrades = save['upgrades'] as Record<string, string>;
    delete upgrades['gardenAtrium'];
    delete upgrades['skylineSuite'];
    for (const id of ['cozyChairs', 'betterLighting', 'coffeeMachine', 'cornerOffice', 'executiveSuite']) {
      upgrades[id] = 'purchased';
    }
    const migrated = parseSave(JSON.stringify(save));
    expect(migrated.upgrades['gardenAtrium']).toBe('available'); // tier 5 owned → 6 opens
    expect(migrated.upgrades['skylineSuite']).toBe('locked'); // still needs tier 6
  });

  it('v11 → v12 migration rewrites duplicated notes on existing walls', () => {
    const base = createStarterState() as unknown as Record<string, unknown>;
    const save = structuredClone(base);
    (save['meta'] as Record<string, unknown>)['saveVersion'] = 11;
    save['memoryWall'] = [
      { loanId: 'LN-1', customerName: 'Riley & Sage Donovan', portraitId: 17, portraitSeed: 'a', houseName: 'H', neighborhoodId: 'oldTown', product: 'fha', purpose: 'purchase', amount: 1, closingDay: 1, season: 'spring', note: 'Same words twice.' },
      { loanId: 'LN-2', customerName: 'Beck & Aria Foster', portraitId: 17, portraitSeed: 'b', houseName: 'H', neighborhoodId: 'oldTown', product: 'fha', purpose: 'purchase', amount: 1, closingDay: 2, season: 'spring', note: 'Same words twice.' },
    ];
    const migrated = parseSave(JSON.stringify(save));
    expect(migrated.meta.saveVersion).toBe(13);
    const notes = migrated.memoryWall.map((page) => page.note);
    expect(notes[0]).toBe('Same words twice.'); // the first keeps its words
    expect(notes[1]).not.toBe('Same words twice.'); // the copy finds its own voice
  });
});

describe('no two teammates share a name (playtest 2026-07-07)', () => {
  it('candidates never duplicate someone already on the team', () => {
    const taken = ['Avery Brooks', 'Jordan Patel', 'Casey Nguyen', 'Riley Thompson'];
    for (let seed = 1; seed <= 25; seed++) {
      for (const candidate of generateCandidates(seed, 'processor', taken)) {
        expect(taken).not.toContain(candidate.name);
      }
    }
  });

  it('stays deterministic per seed with the same exclusions', () => {
    const taken = ['Avery Brooks'];
    expect(generateCandidates(77, 'closer', taken)).toEqual(generateCandidates(77, 'closer', taken));
  });
});
