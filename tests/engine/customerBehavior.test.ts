import { describe, expect, it } from 'vitest';
import {
  CONTACT_HAPPINESS_BOOST,
  CONTACT_TRUST_BOOST,
  DELAYED_HAPPINESS_DECAY_PER_DAY,
  REQUEST_NAG_HAPPINESS_COST,
  STAGE_ADVANCE_HAPPINESS_BOOST,
} from '../../src/engine/constants';
import { createStarterState, STARTER_CUSTOMER_ID, STARTER_LOAN_ID } from '../../src/engine/content/starter';
import {
  contactCustomer,
  moveLoanForward,
  requestAllDocuments,
  toggleDelay,
} from '../../src/engine/playerActions';
import { advanceDay, advanceHour } from '../../src/engine/tick';
import type { GameState } from '../../src/engine/types';

function loanOf(state: GameState) {
  const loan = state.loans[STARTER_LOAN_ID];
  if (!loan) throw new Error('starter loan missing');
  return loan;
}

function customerOf(state: GameState) {
  const customer = state.customers[STARTER_CUSTOMER_ID];
  if (!customer) throw new Error('starter customer missing');
  return customer;
}

function toDocumentCollection(state: GameState): GameState {
  let s = state;
  while (loanOf(s).stage !== 'documentCollection') s = advanceHour(s);
  return s;
}

describe('trait-driven document cadence (GDD §4, M5)', () => {
  it('a prompt customer answers requests every hour, unprompted every 2 hours', () => {
    // Sarah is prompt + enthusiastic.
    let s = toDocumentCollection(createStarterState());

    // Unprompted: nothing after 1 hour, one document after 2.
    const collected = (state: GameState) =>
      Object.values(loanOf(state).documents).filter((d) => d === 'collected').length;
    const base = collected(s);
    s = advanceHour(s);
    expect(collected(s)).toBe(base);
    s = advanceHour(s);
    expect(collected(s)).toBe(base + 1);

    // Requested: arrives on the very next hour.
    s = requestAllDocuments(s, STARTER_LOAN_ID);
    const afterRequest = collected(s);
    s = advanceHour(s);
    expect(collected(s)).toBe(afterRequest + 1);
  });

  it('a customer without eager traits sends unprompted documents every 3 hours', () => {
    const base = createStarterState();
    const customer = base.customers[STARTER_CUSTOMER_ID];
    if (!customer) throw new Error('missing customer');
    customer.traits = ['cautious'];
    let s = toDocumentCollection(base);

    const collected = (state: GameState) =>
      Object.values(loanOf(state).documents).filter((d) => d === 'collected').length;
    const start = collected(s);
    s = advanceHour(s);
    s = advanceHour(s);
    expect(collected(s)).toBe(start);
    s = advanceHour(s);
    expect(collected(s)).toBe(start + 1);
  });
});

describe('Request Documents (GDD §4 action 1)', () => {
  it('requests every missing document at once', () => {
    const s = requestAllDocuments(createStarterState(), STARTER_LOAN_ID);
    const statuses = Object.values(loanOf(s).documents).filter((d) => d !== 'notRequired');
    expect(statuses.every((d) => d === 'requested')).toBe(true);
  });

  it('asking again while requests are out costs happiness', () => {
    let s = requestAllDocuments(createStarterState(), STARTER_LOAN_ID);
    const before = customerOf(s).happiness;
    s = requestAllDocuments(s, STARTER_LOAN_ID);
    expect(customerOf(s).happiness).toBe(before - REQUEST_NAG_HAPPINESS_COST);
  });
});

describe('Contact Customer (GDD §4 action 3)', () => {
  it('boosts happiness and trust, and costs a little progress time', () => {
    const base = createStarterState();
    const loan = base.loans[STARTER_LOAN_ID];
    if (!loan) throw new Error('missing loan');
    loan.progressHours = 2;

    const s = contactCustomer(base, STARTER_LOAN_ID);
    expect(customerOf(s).happiness).toBe(80 + CONTACT_HAPPINESS_BOOST);
    expect(customerOf(s).trust).toBe(2 + CONTACT_TRUST_BOOST);
    expect(loanOf(s).progressHours).toBe(1);
  });
});

describe('Delay (GDD §4 action 4)', () => {
  it('freezes the loan and decays happiness daily until resumed', () => {
    let s = toggleDelay(createStarterState(), STARTER_LOAN_ID);
    expect(loanOf(s).delayed).toBe(true);
    expect(loanOf(s).statusTag).toBe('Delayed');

    const happinessBefore = customerOf(s).happiness;
    const stageBefore = loanOf(s).stage;
    s = advanceDay(s);
    expect(loanOf(s).stage).toBe(stageBefore); // nothing moved
    expect(customerOf(s).happiness).toBe(happinessBefore - DELAYED_HAPPINESS_DECAY_PER_DAY);

    s = toggleDelay(s, STARTER_LOAN_ID);
    expect(loanOf(s).delayed).toBe(false);
    s = advanceHour(s);
    s = advanceHour(s);
    expect(loanOf(s).stage).not.toBe(stageBefore); // moving again
  });
});

describe('happiness dynamics', () => {
  it('rises when a stage completes', () => {
    const before = customerOf(createStarterState()).happiness;
    const s = moveLoanForward(createStarterState(), STARTER_LOAN_ID);
    expect(customerOf(s).happiness).toBe(before + STAGE_ADVANCE_HAPPINESS_BOOST);
  });

  it('resets the weekly trend baseline when a new week starts', () => {
    let s = createStarterState();
    s = contactCustomer(s, STARTER_LOAN_ID); // happiness 82, baseline 80
    expect(customerOf(s).happiness).not.toBe(customerOf(s).happinessAtWeekStart);

    for (let day = 1; day <= 7; day++) s = advanceDay(s); // day becomes 8 → new week
    expect(customerOf(s).happinessAtWeekStart).toBe(customerOf(s).happiness);
  });
});
