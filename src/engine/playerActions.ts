/**
 * Player actions on a loan (GDD §3 loan detail popover, GDD §4 customer
 * actions). Pure: each returns a new state, or the ORIGINAL state unchanged
 * when the action isn't allowed — the UI can rely on referential equality.
 */
import { CONTACT_HAPPINESS_BOOST, DOC_FRIENDLY_NAME } from './constants';
import { missingDocs, requirementsMet } from './loans';
import { advanceLoanStage, missingDocsTag } from './tick';
import type { DocumentKey, GameEvent, GameState } from './types';

const MAX_HAPPINESS = 100;

function pushEvent(state: GameState, category: GameEvent['category'], title: string, detail: string): void {
  const { day, hour } = state.clock;
  const n = state.eventLog.length;
  state.eventLog.push({ id: `evt-${day}-${hour}-${n}`, day, hour, category, title, detail });
}

/** Ask the customer for a specific missing paper. */
export function requestDocument(state: GameState, loanId: string, key: DocumentKey): GameState {
  const loan = state.loans[loanId];
  if (!loan || loan.documents[key] !== 'missing') return state;

  const s = structuredClone(state);
  const l = s.loans[loanId];
  if (!l) return state;
  l.documents[key] = 'requested';
  l.statusTag = l.stage === 'documents' ? missingDocsTag(l) : l.statusTag;

  const customer = s.customers[l.customerId];
  pushEvent(
    s,
    'customers',
    `You asked ${customer ? customer.name : 'the customer'} for a paper`,
    `${DOC_FRIENDLY_NAME[key]} — it'll come in first.`,
  );
  return s;
}

/** Send a friendly message (GDD §4 action 3): +happiness, capped. */
export function contactCustomer(state: GameState, loanId: string): GameState {
  const loan = state.loans[loanId];
  if (!loan) return state;
  const customer = state.customers[loan.customerId];
  if (!customer) return state;

  const s = structuredClone(state);
  const c = s.customers[loan.customerId];
  if (!c) return state;
  c.happiness = Math.min(MAX_HAPPINESS, c.happiness + CONTACT_HAPPINESS_BOOST);

  pushEvent(
    s,
    'customers',
    `You checked in with ${c.name}`,
    `A friendly hello goes a long way. Happiness is at ${c.happiness}%.`,
  );
  return s;
}

/**
 * "Move to [next stage]" / "Continue Processing" (GDD §4 action 2):
 * only when the stage's requirements are met.
 */
export function moveLoanForward(state: GameState, loanId: string): GameState {
  const loan = state.loans[loanId];
  if (!loan || loan.stage === 'completed' || !requirementsMet(loan)) return state;

  const s = structuredClone(state);
  const l = s.loans[loanId];
  if (!l) return state;
  advanceLoanStage(s, l);
  return s;
}

/** Papers the player can still request for this loan. */
export function requestableDocs(state: GameState, loanId: string): DocumentKey[] {
  const loan = state.loans[loanId];
  if (!loan) return [];
  return missingDocs(loan).filter((key) => loan.documents[key] === 'missing');
}
