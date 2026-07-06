import { describe, expect, it } from 'vitest';
import { STAGE_ORDER } from '../../src/engine/constants';
import {
  ALL_TERM_KEYS,
  entriesByCategory,
  getEntry,
  GLOSSARY,
  STAGE_GLOSSARY_KEY,
} from '../../src/engine/content/glossary';

describe('MortgageGlossary service (GDD §4.1)', () => {
  it('has unique keys and complete beginner-friendly entries', () => {
    expect(new Set(ALL_TERM_KEYS).size).toBe(ALL_TERM_KEYS.length);
    for (const key of ALL_TERM_KEYS) {
      const entry = getEntry(key);
      expect(entry, key).toBeDefined();
      expect(entry?.term.length, key).toBeGreaterThan(2);
      expect(entry?.definition.length, key).toBeGreaterThan(20);
      expect(entry?.whyItMatters.length, key).toBeGreaterThan(10);
    }
  });

  it('every related key resolves to a real entry', () => {
    for (const entry of Object.values(GLOSSARY)) {
      for (const related of entry.related) {
        expect(getEntry(related), `${entry.key} → ${related}`).toBeDefined();
      }
    }
  });

  it('every whereInProcess is a real pipeline stage', () => {
    for (const entry of Object.values(GLOSSARY)) {
      if (entry.whereInProcess) {
        expect(STAGE_ORDER).toContain(entry.whereInProcess);
      }
    }
  });

  it('covers the four required categories', () => {
    expect(entriesByCategory('gettingStarted').length).toBeGreaterThanOrEqual(3);
    expect(entriesByCategory('documents').length).toBeGreaterThanOrEqual(7);
    expect(entriesByCategory('loanProcess').length).toBeGreaterThanOrEqual(9);
    expect(entriesByCategory('financialConcepts').length).toBeGreaterThanOrEqual(8);
  });

  it('every stage-header glossary link resolves', () => {
    for (const key of Object.values(STAGE_GLOSSARY_KEY)) {
      expect(getEntry(key)).toBeDefined();
    }
  });

  it('the in-game document checklist keys are all glossary entries', () => {
    for (const key of [
      'employmentVerification',
      'bankStatements',
      'governmentId',
      'residenceHistory',
      'creditAuthorization',
      'taxReturns',
      'homeInspectionReport',
    ]) {
      expect(getEntry(key), key).toBeDefined();
    }
  });
});
