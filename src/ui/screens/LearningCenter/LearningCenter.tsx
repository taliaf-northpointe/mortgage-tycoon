import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, Sparkle } from 'lucide-react';
import { GLOSSARY_SIZE_KEY, JOURNEY_DISPLAY } from '../../../engine/constants';
import {
  ALL_TERM_KEYS,
  CATEGORY_LABEL,
  entriesByCategory,
  getEntry,
} from '../../../engine/content/glossary';
import type { GlossaryCategory } from '../../../engine/content/glossary';
import { useGameStore } from '../../../store/gameStore';
import styles from './LearningCenter.module.css';

const CATEGORIES: GlossaryCategory[] = ['gettingStarted', 'documents', 'loanProcess', 'financialConcepts'];
type GlossarySize = 'sm' | 'md' | 'lg';

/**
 * Mortgage Learning Center (GDD §4.1) — the in-game encyclopedia.
 * All entries are browsable (curiosity is never locked out); terms that have
 * appeared in gameplay carry an "In play" badge, and opening one marks it
 * Learned toward the completion %.
 */
export function LearningCenter({ onBack }: { onBack(): void }) {
  const game = useGameStore((s) => s.game);
  const learnTerm = useGameStore((s) => s.learnTerm);
  const [selectedKey, setSelectedKey] = useState<string>('mortgageBasics');
  const [size, setSize] = useState<GlossarySize>(() => {
    const stored = typeof localStorage === 'undefined' ? null : localStorage.getItem(GLOSSARY_SIZE_KEY);
    return stored === 'sm' || stored === 'lg' ? stored : 'md';
  });

  useEffect(() => {
    document.documentElement.dataset['glossarySize'] = size;
    localStorage.setItem(GLOSSARY_SIZE_KEY, size);
  }, [size]);

  useEffect(() => {
    learnTerm(selectedKey);
  }, [selectedKey, learnTerm]);

  if (!game) return null;

  const learnedCount = ALL_TERM_KEYS.filter((key) => game.glossary[key]?.learned).length;
  const completionPct = Math.round((learnedCount / ALL_TERM_KEYS.length) * 100);
  const selected = getEntry(selectedKey);

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button type="button" className={styles.backButton} onClick={onBack} aria-label="Back to Dashboard">
          <ArrowLeft size={16} />
        </button>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <button type="button" onClick={onBack}>
            Dashboard
          </button>
          <span>/</span>
          <strong>Mortgage Learning Center</strong>
        </nav>
        <div className={styles.completion}>
          <BookOpen size={15} aria-hidden="true" />
          <span>
            You've learned <strong>{learnedCount}</strong> of {ALL_TERM_KEYS.length} terms
          </span>
          <div className={styles.completionTrack} role="progressbar" aria-valuenow={completionPct} aria-valuemin={0} aria-valuemax={100}>
            <div className={styles.completionFill} style={{ width: `${completionPct}%` }} />
          </div>
          <span className={styles.completionPct}>{completionPct}%</span>
        </div>
        <div className={styles.sizeControl} role="group" aria-label="Text size">
          {(['sm', 'md', 'lg'] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={size === s ? styles.sizeActive : styles.sizeButton}
              onClick={() => setSize(s)}
              aria-pressed={size === s}
              aria-label={`Text size ${s === 'sm' ? 'small' : s === 'md' ? 'medium' : 'large'}`}
            >
              A
            </button>
          ))}
        </div>
      </header>

      <div className={styles.body}>
        <nav className={styles.list} aria-label="Glossary entries">
          {CATEGORIES.map((category) => (
            <section key={category}>
              <h4 className={styles.categoryTitle}>{CATEGORY_LABEL[category]}</h4>
              {entriesByCategory(category).map((entry) => {
                const progress = game.glossary[entry.key];
                return (
                  <button
                    key={entry.key}
                    type="button"
                    className={entry.key === selectedKey ? styles.entryActive : styles.entry}
                    onClick={() => setSelectedKey(entry.key)}
                    aria-current={entry.key === selectedKey}
                  >
                    <span className={progress?.unlocked || progress?.learned ? styles.entryName : styles.entryNameDim}>
                      {entry.term}
                    </span>
                    {progress?.learned && (
                      <CheckCircle2 size={13} className={styles.learnedIcon} aria-label="Learned" />
                    )}
                    {progress?.unlocked && !progress?.learned && (
                      <Sparkle size={13} className={styles.unlockedIcon} aria-label="Seen in play" />
                    )}
                  </button>
                );
              })}
            </section>
          ))}
        </nav>

        {selected && (
          <article className={styles.detail} data-size={size}>
            <span className={styles.detailCategory}>{CATEGORY_LABEL[selected.category]}</span>
            <h2>{selected.term}</h2>
            <p className={styles.definition}>{selected.definition}</p>

            <h4>Why it matters</h4>
            <p>{selected.whyItMatters}</p>

            {selected.whereInProcess && (
              <>
                <h4>Where it appears in the process</h4>
                <ol className={styles.journey}>
                  {JOURNEY_DISPLAY.map((step) => {
                    const here = step.stage === selected.whereInProcess;
                    return (
                      <li key={step.label} className={here ? styles.journeyHere : undefined}>
                        {here ? '➡ ' : ''}
                        {step.label}
                      </li>
                    );
                  })}
                </ol>
              </>
            )}

            {selected.funFact && (
              <>
                <h4>Fun fact</h4>
                <p className={styles.funFact}>{selected.funFact}</p>
              </>
            )}

            {selected.related.length > 0 && (
              <>
                <h4>Related topics</h4>
                <div className={styles.related}>
                  {selected.related.map((key) => {
                    const rel = getEntry(key);
                    if (!rel) return null;
                    return (
                      <button key={key} type="button" className={styles.relatedChip} onClick={() => setSelectedKey(key)}>
                        {rel.term}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </article>
        )}
      </div>
    </div>
  );
}
