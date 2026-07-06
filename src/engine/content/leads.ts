/**
 * Lead generation content + spawn logic (GDD §2 "more customers arrive",
 * GDD §4 archetypes; simple seeded daily spawn per GDD §13 decision 8).
 * Deterministic: all randomness flows through the seeded RNG.
 */
import {
  BRANCH_LEAD_BONUS,
  BRANCH_LOAN_CAP_BONUS,
  LEAD_CHANCE_MAX,
  LEAD_CHANCE_MIN,
  LEAD_SPAWN_CHANCE,
  LOAN_PRODUCT_LABEL,
  MARKETING_LEAD_BONUS_PER_TIER,
  MAX_ACTIVE_LOANS,
  RATE_LEAD_SENSITIVITY,
  STARTING_INTEREST_RATE,
} from '../constants';
import { awardAchievement } from '../economy';
import { branchCount } from '../map';
import { initialDocuments } from '../loans';
import { mulberry32 } from '../rng';
import { tiersOwned } from '../upgrades';
import type { GameEvent, GameState, LoanProduct, LoanPurpose, TraitKey } from '../types';

interface Archetype {
  name: string;
  age: number;
  buyerTypeLabel: string;
  traits: TraitKey[];
  product: LoanProduct;
  purpose: LoanPurpose;
  amountRange: [number, number];
  home: { name: string; beds: number; baths: number; categoryChip: string };
}

/** ~12 archetype seeds (GDD §4). Names cycle with a numbered suffix after one pass. */
const ARCHETYPES: Archetype[] = [
  { name: 'Marcus Johnson', age: 29, buyerTypeLabel: 'First-time Homebuyer', traits: ['enthusiastic', 'prompt'], product: 'fha', purpose: 'purchase', amountRange: [195_000, 240_000], home: { name: 'Sunny Starter Cottage', beds: 2, baths: 1, categoryChip: 'Starter Home' } },
  { name: 'Elena Rodriguez', age: 41, buyerTypeLabel: 'Growing Family', traits: ['detailOriented', 'cautious'], product: 'conventional', purpose: 'purchase', amountRange: [275_000, 355_000], home: { name: 'Maple Street Colonial', beds: 4, baths: 2, categoryChip: 'Family Home' } },
  { name: 'Ravi Sethi', age: 38, buyerTypeLabel: 'Repeat Buyer', traits: ['impatient', 'prompt'], product: 'conventional', purpose: 'purchase', amountRange: [320_000, 420_000], home: { name: 'Hilltop Modern', beds: 3, baths: 2, categoryChip: 'Move-up Home' } },
  { name: 'Dorothy Wells', age: 67, buyerTypeLabel: 'Downsizing Retiree', traits: ['cautious', 'chatty'], product: 'conventional', purpose: 'purchase', amountRange: [210_000, 280_000], home: { name: 'Garden View Bungalow', beds: 2, baths: 1, categoryChip: 'Cozy Retreat' } },
  { name: 'James Whitfield', age: 45, buyerTypeLabel: 'Veteran Homebuyer', traits: ['prompt', 'detailOriented'], product: 'va', purpose: 'purchase', amountRange: [250_000, 340_000], home: { name: 'Oakwood Craftsman', beds: 3, baths: 2, categoryChip: 'Family Home' } },
  { name: 'The Martinez Family', age: 35, buyerTypeLabel: 'Growing Family', traits: ['enthusiastic', 'chatty'], product: 'fha', purpose: 'purchase', amountRange: [230_000, 300_000], home: { name: 'Willow Lane Two-Story', beds: 4, baths: 2, categoryChip: 'Family Home' } },
  { name: 'Priyanka Desai', age: 33, buyerTypeLabel: 'First-time Homebuyer', traits: ['detailOriented', 'prompt'], product: 'conventional', purpose: 'purchase', amountRange: [260_000, 330_000], home: { name: 'Brick Row Townhome', beds: 3, baths: 2, categoryChip: 'Townhome' } },
  { name: 'Bill & Nancy Turner', age: 58, buyerTypeLabel: 'Refinancing Homeowners', traits: ['cautious', 'prompt'], product: 'conventional', purpose: 'refinance', amountRange: [210_000, 320_000], home: { name: 'Their Longtime Home', beds: 3, baths: 2, categoryChip: 'Refinance' } },
  { name: 'Aisha Karim', age: 27, buyerTypeLabel: 'First-time Homebuyer', traits: ['enthusiastic', 'detailOriented'], product: 'fha', purpose: 'purchase', amountRange: [195_000, 235_000], home: { name: 'Cedar Court Condo', beds: 2, baths: 1, categoryChip: 'Condo' } },
  { name: 'Tom Okafor', age: 52, buyerTypeLabel: 'Veteran Refinancer', traits: ['prompt'], product: 'va', purpose: 'refinance', amountRange: [240_000, 380_000], home: { name: 'The Family Homestead', beds: 4, baths: 2, categoryChip: 'Refinance' } },
  { name: 'Grace Liu', age: 31, buyerTypeLabel: 'Relocating Professional', traits: ['impatient', 'detailOriented'], product: 'conventional', purpose: 'purchase', amountRange: [290_000, 380_000], home: { name: 'Lakeside Loft', beds: 2, baths: 2, categoryChip: 'City Home' } },
  { name: 'Sam & Jordan Reyes', age: 36, buyerTypeLabel: 'Growing Family', traits: ['chatty', 'enthusiastic'], product: 'conventional', purpose: 'purchase', amountRange: [300_000, 360_000], home: { name: 'Meadow Edge Ranch', beds: 4, baths: 3, categoryChip: 'Family Home' } },
];

/** Leads dream of homes where you have a presence (GDD §9 expansion loop). */
function neighborhoodPool(state: { neighborhoods: Record<string, { status: string }> }): string[] {
  const withPresence = Object.entries(state.neighborhoods)
    .filter(([, n]) => n.status === 'mainOffice' || n.status === 'branch')
    .map(([id]) => id);
  return withPresence.length > 0 ? withPresence : ['oldTown'];
}

/**
 * Maybe spawn one new lead for the morning (GDD §13 decision 8).
 * Mutates the (already cloned) state. Deterministic per (rngSeed, day).
 */
export function maybeSpawnLead(state: GameState): void {
  const branches = branchCount(state);
  const activeLoans = Object.values(state.loans).filter((l) => l.stage !== 'completed').length;
  if (activeLoans >= MAX_ACTIVE_LOANS + branches * BRANCH_LOAN_CAP_BONUS) return;

  // Marketing upgrades, open branches, and low interest rates bring more
  // shoppers (GDD §7/§8/§9).
  const chance = Math.min(
    LEAD_CHANCE_MAX,
    Math.max(
      LEAD_CHANCE_MIN,
      LEAD_SPAWN_CHANCE +
        MARKETING_LEAD_BONUS_PER_TIER * tiersOwned(state, 'marketing') +
        branches * BRANCH_LEAD_BONUS +
        (STARTING_INTEREST_RATE - state.stats.interestRate) * RATE_LEAD_SENSITIVITY,
    ),
  );

  const rng = mulberry32((state.rngSeed ^ (state.clock.day * 2_654_435_761)) >>> 0);
  if (rng.next() >= chance) return;

  const archetype = ARCHETYPES[rng.int(0, ARCHETYPES.length - 1)];
  if (!archetype) return;

  const serial = Object.keys(state.loans).length + 1;
  const suffix = Math.floor((serial - 1) / ARCHETYPES.length);
  const name = suffix > 0 ? `${archetype.name} ${suffix + 1}` : archetype.name;
  const customerId = `cust-${serial}-${name.toLowerCase().replace(/[^a-z]/g, '')}`;
  const loanId = `LN-2026-${String(serial).padStart(4, '0')}`;

  const amount = Math.round(rng.int(archetype.amountRange[0], archetype.amountRange[1]) / 5_000) * 5_000;
  const price = Math.round((amount * 1.1) / 5_000) * 5_000;
  const downPayment = price - amount;
  const monthly = Math.round((amount * (state.stats.interestRate / 100 / 12)) / (1 - Math.pow(1 + state.stats.interestRate / 100 / 12, -360)));

  state.customers[customerId] = {
    id: customerId,
    name,
    age: archetype.age,
    buyerTypeLabel: archetype.buyerTypeLabel,
    traits: archetype.traits,
    happiness: rng.int(70, 90),
    happinessAtWeekStart: 0,
    trust: rng.int(1, 3),
    portraitSeed: customerId,
    dreamHome: {
      name: archetype.home.name,
      neighborhoodId: (() => {
        const pool = neighborhoodPool(state);
        return pool[rng.int(0, pool.length - 1)] ?? 'oldTown';
      })(),
      beds: archetype.home.beds,
      baths: archetype.home.baths,
      categoryChip: archetype.home.categoryChip,
      price,
      downPayment,
      monthly,
    },
  };
  const customer = state.customers[customerId];
  if (customer) customer.happinessAtWeekStart = customer.happiness;

  state.loans[loanId] = {
    id: loanId,
    customerId,
    product: archetype.product,
    purpose: archetype.purpose,
    amount,
    stage: 'lead',
    daysInPipeline: 0,
    documents: initialDocuments(archetype.purpose),
    assignedEmployeeId: null,
    statusTag: null,
    rate: state.stats.interestRate || STARTING_INTEREST_RATE,
    termYears: 30,
    progressHours: 0,
    delayed: false,
  };

  pushLeadEvent(state, name, archetype.product);
  awardAchievement(state, 'scout'); // GDD §10 — first fresh lead
}

function pushLeadEvent(state: GameState, name: string, product: LoanProduct): void {
  const { day, hour } = state.clock;
  const n = state.eventLog.length;
  const event: GameEvent = {
    id: `evt-${day}-${hour}-${n}`,
    day,
    hour,
    category: 'customers',
    title: `New lead: ${name}!`,
    detail: `They're dreaming of a home and asking about a ${LOAN_PRODUCT_LABEL[product]} loan. Say hello!`,
  };
  state.eventLog.push(event);
}
