/**
 * The MortgageGlossary service (GDD §4.1, TDD §6.1) — the SINGLE source of
 * truth for every mortgage term in the game. No definition text may live
 * anywhere else. Centralizing all strings here keeps the app ready for
 * future localization and makes the term set easy to extend.
 *
 * Voice rules apply: beginner-friendly, warm, never a lecture.
 */
import type { LoanStage } from '../types';

export type GlossaryCategory = 'gettingStarted' | 'documents' | 'loanProcess' | 'financialConcepts';

export interface GlossaryEntry {
  key: string;
  term: string;
  category: GlossaryCategory;
  definition: string;
  whyItMatters: string;
  /** Which pipeline stage this term lives in — drives the "Where you are" tracker. */
  whereInProcess?: LoanStage;
  funFact?: string;
  related: string[];
}

export const CATEGORY_LABEL: Record<GlossaryCategory, string> = {
  gettingStarted: 'Getting Started',
  documents: 'Documents',
  loanProcess: 'Loan Process',
  financialConcepts: 'Financial Concepts',
};

const ENTRIES: GlossaryEntry[] = [
  // ── Getting Started ────────────────────────────────────────────────
  {
    key: 'buyingAHome',
    term: 'Buying a Home',
    category: 'gettingStarted',
    definition:
      'The journey from "I want a home" to holding the keys: finding a home, getting a mortgage, and closing the deal.',
    whyItMatters:
      'Almost nobody buys a home with cash — the mortgage journey is how most people get there.',
    related: ['mortgageBasics', 'downPayment', 'loanTypes'],
  },
  {
    key: 'mortgageBasics',
    term: 'Mortgage Basics',
    category: 'gettingStarted',
    definition:
      'A mortgage is a loan for buying a home. The buyer pays it back monthly — part principal, part interest — usually over 15 or 30 years. The home itself is the collateral.',
    whyItMatters: 'Every loan in your pipeline is one of these. The whole game is mortgages, gently.',
    funFact: 'The word "mortgage" comes from old French — literally "death pledge." Cozier than it sounds!',
    related: ['principal', 'interestRate', 'buyingAHome'],
  },
  {
    key: 'loanTypes',
    term: 'Common Loan Types',
    category: 'gettingStarted',
    definition:
      'Conventional loans are the standard kind. FHA loans allow smaller down payments — great for first-time buyers. VA loans serve veterans and service members, often with no down payment at all.',
    whyItMatters: 'Matching the right loan type to the right customer is a big part of good service.',
    related: ['downPayment', 'pmi', 'mortgageBasics'],
  },

  // ── Documents ──────────────────────────────────────────────────────
  {
    key: 'loanApplication',
    term: 'Loan Application',
    category: 'documents',
    definition:
      "The form that starts it all: the borrower's income, assets, debts, and details about the home they want.",
    whyItMatters: 'Everything downstream — the Loan Estimate, Underwriting — builds on what this form says.',
    whereInProcess: 'application',
    funFact: 'In the U.S. this form is standardized and known in the industry by its number: the 1003.',
    related: ['loanEstimate', 'preQualification'],
  },
  {
    key: 'payStubs',
    term: 'Pay Stubs',
    category: 'documents',
    definition: "Recent proof of the borrower's paychecks, usually covering the last 30 days.",
    whyItMatters: 'They show steady income — the simplest evidence the borrower can afford the monthly payment.',
    whereInProcess: 'documentCollection',
    related: ['employmentVerification', 'w2Forms'],
  },
  {
    key: 'w2Forms',
    term: 'W-2 Forms',
    category: 'documents',
    definition: 'The yearly tax form an employer sends that sums up wages and taxes withheld.',
    whyItMatters: 'W-2s confirm income history over full years, not just recent weeks.',
    whereInProcess: 'documentCollection',
    related: ['taxReturns', 'payStubs'],
  },
  {
    key: 'taxReturns',
    term: 'Tax Returns',
    category: 'documents',
    definition: "The borrower's filed income taxes, usually for the last year or two.",
    whyItMatters: 'They give the fullest picture of income — especially for self-employed borrowers.',
    whereInProcess: 'documentCollection',
    related: ['w2Forms', 'employmentVerification'],
  },
  {
    key: 'bankStatements',
    term: 'Bank Statements',
    category: 'documents',
    definition: "A few months of the borrower's checking and savings activity.",
    whyItMatters:
      'They prove the down payment money is real, seasoned, and actually theirs — and can cover a few payments in a pinch.',
    whereInProcess: 'documentCollection',
    related: ['downPayment', 'taxReturns'],
  },
  {
    key: 'employmentVerification',
    term: 'Employment Verification',
    category: 'documents',
    definition: "Confirmation from the borrower's employer that they really work there and earn what they say.",
    whyItMatters: 'Steady employment is the backbone of a safe loan.',
    whereInProcess: 'documentCollection',
    related: ['payStubs', 'taxReturns'],
  },
  {
    key: 'governmentId',
    term: 'Government-Issued ID',
    category: 'documents',
    definition: 'A driver license, passport, or similar official photo ID.',
    whyItMatters: 'Lenders must confirm the borrower is who they say they are — it protects everyone.',
    whereInProcess: 'documentCollection',
    related: ['creditAuthorization'],
  },
  {
    key: 'residenceHistory',
    term: 'Residence History',
    category: 'documents',
    definition: 'Where the borrower has lived for the past couple of years.',
    whyItMatters: 'It fills in the picture of stability and helps verify identity and rental history.',
    whereInProcess: 'documentCollection',
    related: ['governmentId'],
  },
  {
    key: 'creditAuthorization',
    term: 'Credit Report Authorization',
    category: 'documents',
    definition: "The borrower's written permission for the lender to pull their credit report.",
    whyItMatters: "Credit history predicts how reliably someone pays — lenders can't peek without permission.",
    whereInProcess: 'documentCollection',
    funFact: 'Mortgage credit pulls use special scoring models — the score can differ from a free credit app.',
    related: ['dti', 'underwriting'],
  },
  {
    key: 'homeInspectionReport',
    term: 'Home Inspection Report',
    category: 'documents',
    definition: "An inspector's write-up of the home's condition — roof, plumbing, wiring, and all.",
    whyItMatters: 'It protects the buyer from expensive surprises hiding behind fresh paint.',
    whereInProcess: 'documentCollection',
    funFact: 'An inspection is for the buyer; an Appraisal is for the lender. Different jobs, often confused!',
    related: ['appraisal'],
  },
  {
    key: 'loanEstimate',
    term: 'Loan Estimate',
    category: 'documents',
    definition:
      'A standardized three-page summary the lender sends after application: the rate, monthly payment, and closing costs.',
    whyItMatters: 'It lets borrowers compare offers apples-to-apples before committing.',
    whereInProcess: 'application',
    funFact: 'Lenders must send it within three business days of the application.',
    related: ['closingDisclosure', 'closingCosts', 'interestRate'],
  },
  {
    key: 'closingDisclosure',
    term: 'Closing Disclosure',
    category: 'documents',
    definition: 'The final version of the loan terms and costs, delivered before closing day.',
    whyItMatters: 'Borrowers get three days to review it — no surprises at the signing table.',
    whereInProcess: 'clearToClose',
    related: ['loanEstimate', 'closing', 'closingCosts'],
  },

  // ── Loan Process ───────────────────────────────────────────────────
  {
    key: 'preQualification',
    term: 'Pre-Qualification',
    category: 'loanProcess',
    definition:
      "A quick, informal estimate of how much a buyer could borrow, based on what they tell us about income and debts.",
    whyItMatters: 'It gives buyers a realistic price range before they fall in love with a home.',
    whereInProcess: 'preQualification',
    related: ['loanApplication', 'dti'],
  },
  {
    key: 'processing',
    term: 'Processing',
    category: 'loanProcess',
    definition:
      'The behind-the-scenes stage where a Processor organizes the file, orders the Appraisal and Title Review, and verifies everything.',
    whyItMatters: 'A tidy, complete file sails through Underwriting; a messy one bounces back.',
    whereInProcess: 'processing',
    related: ['appraisal', 'titleReview', 'underwriting'],
  },
  {
    key: 'appraisal',
    term: 'Appraisal',
    category: 'loanProcess',
    definition: "A licensed appraiser's independent opinion of what the home is actually worth.",
    whyItMatters: "The lender won't lend more than the home is worth — the appraisal sets that ceiling.",
    whereInProcess: 'processing',
    funFact: 'The appraiser works for the lender, not the buyer — even though the buyer usually pays for it.',
    related: ['ltv', 'homeInspectionReport', 'processing'],
  },
  {
    key: 'titleReview',
    term: 'Title Review',
    category: 'loanProcess',
    definition:
      'A search of public records to confirm the seller truly owns the home and nobody else has a claim on it.',
    whyItMatters: 'It prevents the nightmare of buying a home someone else can claim later.',
    whereInProcess: 'processing',
    related: ['closing', 'processing'],
  },
  {
    key: 'underwriting',
    term: 'Underwriting',
    category: 'loanProcess',
    definition:
      "The stage where the lender reviews the borrower's finances, credit, income, assets, and the property to decide whether the loan can be approved.",
    whyItMatters: 'This step makes sure the borrower can afford the loan and the home meets lending requirements.',
    whereInProcess: 'underwriting',
    funFact:
      'Most borrowers never speak directly with an underwriter, even though this is one of the most important steps in the process.',
    related: ['conditionalApproval', 'dti', 'creditAuthorization'],
  },
  {
    key: 'conditionalApproval',
    term: 'Conditional Approval',
    category: 'loanProcess',
    definition: 'A "yes, if…" from Underwriting: the loan is approved once a short list of conditions is cleared.',
    whyItMatters: "It's great news — the finish line is in sight, with just a little homework left.",
    whereInProcess: 'underwriting',
    related: ['underwriting', 'clearToClose'],
  },
  {
    key: 'clearToClose',
    term: 'Clear to Close',
    category: 'loanProcess',
    definition: 'Every condition is met and the lender gives the green light to schedule the closing.',
    whyItMatters: 'This is the moment a maybe becomes a definitely. Time to book the signing table.',
    whereInProcess: 'clearToClose',
    related: ['closingDisclosure', 'closing'],
  },
  {
    key: 'closing',
    term: 'Closing',
    category: 'loanProcess',
    definition: 'The signing meeting where the borrower inks the final paperwork and pays closing costs.',
    whyItMatters: "It's the last step the buyer takes — after this, the home changes hands.",
    whereInProcess: 'closing',
    funFact: 'The stack of closing paperwork often tops 100 pages. Bring a good pen.',
    related: ['funding', 'closingCosts', 'closingDisclosure'],
  },
  {
    key: 'funding',
    term: 'Funding',
    category: 'loanProcess',
    definition: 'The lender actually sends the money, and ownership officially transfers.',
    whyItMatters: 'Signing feels final, but the keys change hands when the money moves.',
    whereInProcess: 'closing',
    related: ['closing', 'loanServicing'],
  },
  {
    key: 'loanServicing',
    term: 'Loan Servicing',
    category: 'loanProcess',
    definition:
      'Everything after the keys: collecting monthly payments, managing the Escrow account, and helping the homeowner for years to come.',
    whyItMatters: 'A mortgage is a long relationship — servicing is where trust (and steady income) lives.',
    whereInProcess: 'completed',
    related: ['escrow', 'funding'],
  },

  // ── Financial Concepts ─────────────────────────────────────────────
  {
    key: 'downPayment',
    term: 'Down Payment',
    category: 'financialConcepts',
    definition: 'The part of the price the buyer pays up front from their own savings.',
    whyItMatters: 'A bigger down payment means a smaller loan, a lower payment, and often a better rate.',
    funFact: "The classic advice is 20% down — but the median first-time buyer puts down far less.",
    related: ['ltv', 'pmi', 'bankStatements'],
  },
  {
    key: 'interestRate',
    term: 'Interest Rate',
    category: 'financialConcepts',
    definition: 'The price of borrowing money, as a yearly percentage of the loan balance.',
    whyItMatters: 'Even half a percent changes the monthly payment — and the total paid — by a lot.',
    whereInProcess: 'application',
    related: ['principal', 'loanEstimate'],
  },
  {
    key: 'principal',
    term: 'Principal',
    category: 'financialConcepts',
    definition: 'The amount actually borrowed — the loan balance itself, before interest.',
    whyItMatters: 'Every payment splits between principal (owning more of your home) and interest (the cost).',
    related: ['interestRate', 'mortgageBasics'],
  },
  {
    key: 'escrow',
    term: 'Escrow',
    category: 'financialConcepts',
    definition:
      'A holding account managed by the servicer that collects a bit each month to pay property taxes and insurance when they come due.',
    whyItMatters: 'It smooths big yearly bills into the monthly payment so nobody gets surprised.',
    whereInProcess: 'completed',
    related: ['loanServicing', 'closingCosts'],
  },
  {
    key: 'dti',
    term: 'Debt-to-Income Ratio (DTI)',
    category: 'financialConcepts',
    definition: "The share of a borrower's monthly income that goes to debt payments.",
    whyItMatters: "It's one of the biggest factors in Underwriting — it answers \"can they afford this?\"",
    whereInProcess: 'underwriting',
    related: ['underwriting', 'preQualification'],
  },
  {
    key: 'ltv',
    term: 'Loan-to-Value Ratio (LTV)',
    category: 'financialConcepts',
    definition: "The loan amount compared to the home's appraised value, as a percentage.",
    whyItMatters: 'Lower LTV = less risk for the lender = better terms for the borrower.',
    whereInProcess: 'processing',
    related: ['appraisal', 'downPayment', 'pmi'],
  },
  {
    key: 'closingCosts',
    term: 'Closing Costs',
    category: 'financialConcepts',
    definition:
      'The fees due at closing — lender fees, title work, appraisal, taxes — usually 2–5% of the loan amount.',
    whyItMatters: 'Buyers need cash for these on top of the down payment; the Loan Estimate previews them.',
    whereInProcess: 'closing',
    related: ['loanEstimate', 'closingDisclosure', 'closing'],
  },
  {
    key: 'pmi',
    term: 'Private Mortgage Insurance (PMI)',
    category: 'financialConcepts',
    definition:
      'Insurance the borrower pays on conventional loans with less than 20% down. It protects the lender, not the borrower.',
    whyItMatters: "It's why the 20% down payment is famous — reach it and PMI goes away.",
    related: ['downPayment', 'ltv', 'loanTypes'],
  },
];

export const GLOSSARY: Record<string, GlossaryEntry> = Object.fromEntries(
  ENTRIES.map((entry) => [entry.key, entry]),
);

export const ALL_TERM_KEYS: readonly string[] = ENTRIES.map((entry) => entry.key);

export function getEntry(key: string): GlossaryEntry | undefined {
  return GLOSSARY[key];
}

export function entriesByCategory(category: GlossaryCategory): GlossaryEntry[] {
  return ENTRIES.filter((entry) => entry.category === category);
}

/** Which glossary entry a Pipeline column header links to (GDD §4.1). */
export const STAGE_GLOSSARY_KEY: Partial<Record<LoanStage, string>> = {
  preQualification: 'preQualification',
  application: 'loanApplication',
  processing: 'processing',
  underwriting: 'underwriting',
  clearToClose: 'clearToClose',
  closing: 'closing',
  completed: 'loanServicing',
};
