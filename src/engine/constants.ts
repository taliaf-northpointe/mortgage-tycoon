/**
 * ALL tunable numbers and shared literals live here, nowhere else (TDD §3).
 * Every constant references the GDD/TDD section it comes from.
 */
import type { DocumentKey, LoanProduct, LoanPurpose, LoanStage, Role, Season } from './types';

/** GDD §1 */
export const GAME_TITLE = 'Mortgage Empire';
export const TAGLINE = 'Build your neighborhood. Own the block.';

/** TDD §5 — localStorage save key */
export const SAVE_KEY = 'mortgage-empire:save:v1';

/** TDD §6.1 — localStorage key for the glossary text-size preference */
export const GLOSSARY_SIZE_KEY = 'mortgage-empire:ui:glossary-size';

/** TDD §4 — the working day runs 9 AM → 6 PM, 10 ticks/day */
export const DAY_START_HOUR = 9;
export const DAY_END_HOUR = 18;
export const TICKS_PER_DAY = 10;

/** GDD §2 — day-based time with seasons; length per season is a tunable (not specified in GDD) */
export const DAYS_PER_SEASON = 28;
export const SEASONS: readonly Season[] = ['spring', 'summer', 'fall', 'winter'];
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/** GDD §3 v2 — the nine pipeline stages, in order */
export const STAGE_ORDER: readonly LoanStage[] = [
  'lead',
  'preQualification',
  'application',
  'documentCollection',
  'processing',
  'underwriting',
  'clearToClose',
  'closing',
  'completed',
];

/** GDD §3 v2 — fixed progress % per stage */
export const STAGE_PROGRESS_PCT: Record<LoanStage, number> = {
  lead: 6,
  preQualification: 14,
  application: 24,
  documentCollection: 36,
  processing: 50,
  underwriting: 64,
  clearToClose: 76,
  closing: 88,
  completed: 100,
};

/** GDD §3 v2 — stage names as shown on the Pipeline board */
export const STAGE_DISPLAY_NAME: Record<LoanStage, string> = {
  lead: 'Lead',
  preQualification: 'Pre-Qualification',
  application: 'Application',
  documentCollection: 'Document Collection',
  processing: 'Processing',
  underwriting: 'Underwriting',
  clearToClose: 'Clear to Close',
  closing: 'Closing',
  completed: 'Complete',
};

/** GDD §5 v2 — which role owns which stage */
export const ROLE_BY_STAGE: Record<LoanStage, Role> = {
  lead: 'loanOfficer',
  preQualification: 'loanOfficer',
  application: 'loanOfficer',
  documentCollection: 'processor',
  processing: 'processor',
  underwriting: 'underwriter',
  clearToClose: 'closer',
  closing: 'closer',
  completed: 'closer',
};

/** GDD §5 v2 — role display names */
export const ROLE_DISPLAY_NAME: Record<Role, string> = {
  loanOfficer: 'Loan Officer',
  processor: 'Processor',
  underwriter: 'Underwriter',
  closer: 'Closer',
};

/**
 * TDD §4c — work-hours a loan must accumulate to clear each stage (base values;
 * skill and upgrades will reduce these in later milestones).
 */
export const STAGE_HOURS_REQUIRED: Record<LoanStage, number> = {
  lead: 2,
  preQualification: 3,
  application: 3,
  documentCollection: 2, // plus one hour per document the customer still owes (see tick.ts)
  processing: 6, // includes the Appraisal (first half) and Title Review (second half) sub-steps
  underwriting: 4,
  clearToClose: 3,
  closing: 4,
  completed: 0,
};

/** GDD §3 v2 — Processing sub-steps: hours into the stage when each completes */
export const PROCESSING_APPRAISAL_HOURS = 3; // appraisal comes back
export const PROCESSING_TITLE_HOURS = 6; // title review wraps (== stage total)

/** GDD §3 v2 — loan products & purposes (restricted set) */
export const LOAN_PRODUCTS: readonly LoanProduct[] = ['conventional', 'fha', 'va'];
export const LOAN_PRODUCT_LABEL: Record<LoanProduct, string> = {
  conventional: 'Conventional',
  fha: 'FHA',
  va: 'VA',
};
export const LOAN_PURPOSE_LABEL: Record<LoanPurpose, string> = {
  purchase: 'Purchase',
  refinance: 'Refinance',
};

/** GDD §4 action 3 — Contact Customer happiness boost (full math lands in M5) */
export const CONTACT_HAPPINESS_BOOST = 2;

/**
 * GDD §4 v2 — which loan documents each purpose needs. Refinance skips several.
 */
export const REQUIRED_DOCS_BY_PURPOSE: Record<LoanPurpose, readonly DocumentKey[]> = {
  purchase: [
    'employmentVerification',
    'bankStatements',
    'governmentId',
    'residenceHistory',
    'creditAuthorization',
    'taxReturns',
    'homeInspectionReport',
  ],
  refinance: ['employmentVerification', 'bankStatements', 'governmentId', 'creditAuthorization', 'taxReturns'],
};

/** GDD §4 v2 — authentic document names (each glossary-linked in the UI) */
export const DOC_DISPLAY_NAME: Record<DocumentKey, string> = {
  employmentVerification: 'Employment Verification',
  bankStatements: 'Bank Statements',
  governmentId: 'Government-Issued ID',
  residenceHistory: 'Residence History',
  creditAuthorization: 'Credit Report Authorization',
  taxReturns: 'Tax Returns',
  homeInspectionReport: 'Home Inspection Report',
};

/** GDD §4 v2 — friendly sub-labels shown under document names */
export const DOC_FRIENDLY_SUBLABEL: Record<DocumentKey, string> = {
  employmentVerification: 'Recent paychecks from their job',
  bankStatements: 'Savings and checking history',
  governmentId: 'Driver license or passport',
  residenceHistory: 'Where they have lived',
  creditAuthorization: 'Permission to check their credit',
  taxReturns: "Last year's taxes",
  homeInspectionReport: "The inspector's write-up",
};

/** GDD §8 — closing fee as a share of loan amount (target 1.5–2%) */
export const CLOSING_FEE_RATE = 0.0175;

/** GDD §10 — XP per completed loan (End-of-Day shows "+300 XP" for a good day) */
export const XP_PER_COMPLETED_LOAN = 100;

/** M6 will derive workload from this; declared now so no magic numbers later */
export const MAX_LOANS_PER_EMPLOYEE = 4;

/** New-game starting values (GDD §8 HUD examples; coins are a tunable) */
export const STARTING_COINS = 12_000;
export const STARTING_REPUTATION = 50;
export const STARTING_INTEREST_RATE = 6.4;

/** GDD §10 — day star rating; placeholder formula until M7: base + completions, clamped 1–5 */
export const STAR_RATING_BASE = 2;

/** TDD §4 — real-time pacing: one in-game hour every ~6 seconds at 1× speed */
export const REAL_MS_PER_HOUR = 6_000;

/** GDD §10 — player level = career title */
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Loan Officer',
  2: 'Senior Loan Officer',
  3: 'Branch Manager',
  4: 'CEO',
  5: 'Regional Director',
  6: 'Mortgage Mogul',
};

export function titleForLevel(level: number): string {
  return LEVEL_TITLES[Math.min(level, 6)] ?? 'Loan Officer';
}

/**
 * GDD §3 v2 — the full journey as shown in glossary "Where you are" trackers
 * and the Customer screen. Sub-steps map onto their containing board stage.
 */
export const JOURNEY_DISPLAY: readonly { label: string; stage: LoanStage }[] = [
  { label: 'Lead', stage: 'lead' },
  { label: 'Pre-Qualification', stage: 'preQualification' },
  { label: 'Application', stage: 'application' },
  { label: 'Document Collection', stage: 'documentCollection' },
  { label: 'Processing', stage: 'processing' },
  { label: 'Appraisal', stage: 'processing' },
  { label: 'Title Review', stage: 'processing' },
  { label: 'Underwriting', stage: 'underwriting' },
  { label: 'Conditional Approval', stage: 'underwriting' },
  { label: 'Clear to Close', stage: 'clearToClose' },
  { label: 'Closing', stage: 'closing' },
  { label: 'Funding', stage: 'closing' },
  { label: 'Loan Complete', stage: 'completed' },
];
