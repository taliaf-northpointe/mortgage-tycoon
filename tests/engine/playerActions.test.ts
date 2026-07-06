import { describe, expect, it } from 'vitest';
import {
  CLOSING_FEE_RATE,
  CONTACT_HAPPINESS_BOOST,
  REQUIRED_DOCS_BY_LOAN_TYPE,
  STARTING_COINS,
} from '../../src/engine/constants';
import { createStarterState, STARTER_CUSTOMER_ID, STARTER_LOAN_ID } from '../../src/engine/content/starter';
import { contactCustomer, moveLoanForward, requestDocument } from '../../src/engine/playerActions';
import { advanceHour } from '../../src/engine/tick';
import type { GameState } from '../../src/engine/types';

function loanOf(state: GameState) {
  const loan = state.loans[STARTER_LOAN_ID];
  if (!loan) throw new Error('starter loan missing');
  return loan;
}

describe('requestDocument', () => {
  it('marks a missing paper as requested and logs an event', () => {
    const s = requestDocument(createStarterState(), STARTER_LOAN_ID, 'taxPapers');
    expect(loanOf(s).documents.taxPapers).toBe('requested');
    expect(s.eventLog.some((e) => e.category === 'customers')).toBe(true);
  });

  it('returns the same state when the paper is not requestable', () => {
    const base = createStarterState();
    const collected = structuredClone(base);
    const loan = collected.loans[STARTER_LOAN_ID];
    if (!loan) throw new Error('missing loan');
    loan.documents.taxPapers = 'collected';
    expect(requestDocument(collected, STARTER_LOAN_ID, 'taxPapers')).toBe(collected);
    expect(requestDocument(base, 'LN-nope', 'taxPapers')).toBe(base);
  });

  it('requested papers arrive before unrequested ones', () => {
    let s = createStarterState();
    while (loanOf(s).stage !== 'documents') s = advanceHour(s);
    s = requestDocument(s, STARTER_LOAN_ID, 'homeInspection');
    s = advanceHour(s);
    expect(loanOf(s).documents.homeInspection).toBe('collected');
  });
});

describe('contactCustomer', () => {
  it('bumps happiness and logs an event', () => {
    const base = createStarterState();
    const before = base.customers[STARTER_CUSTOMER_ID]?.happiness ?? 0;
    const s = contactCustomer(base, STARTER_LOAN_ID);
    expect(s.customers[STARTER_CUSTOMER_ID]?.happiness).toBe(before + CONTACT_HAPPINESS_BOOST);
    expect(s.eventLog).toHaveLength(1);
  });

  it('caps happiness at 100', () => {
    const base = createStarterState();
    const customer = base.customers[STARTER_CUSTOMER_ID];
    if (!customer) throw new Error('missing customer');
    customer.happiness = 99;
    const s = contactCustomer(base, STARTER_LOAN_ID);
    expect(s.customers[STARTER_CUSTOMER_ID]?.happiness).toBe(100);
  });
});

describe('moveLoanForward', () => {
  it('advances a stage when requirements are met', () => {
    const s = moveLoanForward(createStarterState(), STARTER_LOAN_ID);
    expect(loanOf(s).stage).toBe('application');
  });

  it('is blocked in Documents until every paper is in', () => {
    let s = createStarterState();
    while (loanOf(s).stage !== 'documents') s = advanceHour(s);

    const blocked = moveLoanForward(s, STARTER_LOAN_ID);
    expect(blocked).toBe(s); // unchanged reference — action refused

    const ready = structuredClone(s);
    const loan = ready.loans[STARTER_LOAN_ID];
    if (!loan) throw new Error('missing loan');
    for (const key of REQUIRED_DOCS_BY_LOAN_TYPE.firstHome) loan.documents[key] = 'collected';
    expect(loanOf(moveLoanForward(ready, STARTER_LOAN_ID)).stage).toBe('review');
  });

  it('drives a loan all the way to Completed and pays the fee', () => {
    let s = createStarterState();
    const loan = loanOf(s);
    for (const key of REQUIRED_DOCS_BY_LOAN_TYPE.firstHome) loan.documents[key] = 'collected';

    for (let i = 0; i < 6; i++) s = moveLoanForward(s, STARTER_LOAN_ID);

    expect(loanOf(s).stage).toBe('completed');
    expect(loanOf(s).statusTag).toBe('Closed');
    expect(s.currencies.coins).toBe(STARTING_COINS + Math.round(loanOf(s).amount * CLOSING_FEE_RATE));

    // and it stops there
    expect(moveLoanForward(s, STARTER_LOAN_ID)).toBe(s);
  });
});
