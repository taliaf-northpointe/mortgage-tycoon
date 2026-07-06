import { useState } from 'react';
import { useGameStore } from '../../../store/gameStore';
import { Button } from '../../components/Button';
import styles from './TutorialOverlay.module.css';

interface TutorialStep {
  title: string;
  body: string;
  tips: string[];
}

/** GDD §11 — 7 steps, rewritten with authentic terms (GDD §13 decision 10). */
const STEPS: TutorialStep[] = [
  {
    title: 'Welcome to your office! 🏠',
    body: "This cozy desk is the start of something big. Time flows on its own — one hour every few seconds — and your job is to help real people become homeowners.",
    tips: ['The top bar shows your money, reputation, and the interest rate.', 'Use the pause and speed buttons whenever you like.'],
  },
  {
    title: 'Meet Sarah Chen',
    body: "Sarah is a first-time homebuyer dreaming of a Cozy Bungalow. She's applying for an FHA loan — a favorite for first-timers thanks to its smaller down payment.",
    tips: ['Open the Pipeline and click her card to see her loan.', 'Her profile shows her happiness, trust, and dream home.'],
  },
  {
    title: 'The Loan Pipeline',
    body: 'Every loan travels the real mortgage journey: Lead → Pre-Qualification → Application → Document Collection → Processing → Underwriting → Clear to Close → Closing → Complete.',
    tips: ['Bold terms with a little ⓘ have friendly explanations — tap one!', 'The Learning Center collects everything you discover.'],
  },
  {
    title: 'Document Collection',
    body: "When Sarah's loan reaches Document Collection, peek inside to see what's still missing — things like Employment Verification and Tax Returns. Requesting documents brings them in faster.",
    tips: ['Requested documents arrive first.', "Asking twice nags her a little — happiness matters!"],
  },
  {
    title: 'Underwriting to Closing',
    body: "In Underwriting, the lender reviews everything and gives a Conditional Approval. Then it's Clear to Close, the signing table, and Funding — keys and confetti!",
    tips: ['Every closed loan pays a fee and earns XP.', 'Happy customers at closing can earn you a badge.'],
  },
  {
    title: 'Your team',
    body: 'Marcus, Dana, Priya, and Leo each own part of the journey. Watch their workload — an overworked teammate slows every loan they touch.',
    tips: ['Hire help when workloads run hot.', 'Train and promote your stars — payroll is charged daily, so grow wisely.'],
  },
  {
    title: 'Your first day awaits',
    body: "That's the whole loop: help customers, keep the team happy, grow your reputation, and one day open branches across the Meadowbrook Region. We'll be cheering you on!",
    tips: ['Each evening pauses on an End-of-Day summary.', 'Your game saves automatically. Good luck! 🍀'],
  },
];

export function TutorialOverlay() {
  const completeTutorial = useGameStore((s) => s.completeTutorial);
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  if (!step) return null;
  const last = stepIndex === STEPS.length - 1;

  return (
    <div className={styles.overlay} role="dialog" aria-label={`Tutorial step ${stepIndex + 1} of ${STEPS.length}`}>
      <div className={styles.progressTrack} aria-hidden="true">
        <div className={styles.progressFill} style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
      </div>
      <section className={styles.card}>
        <div className={styles.mascotRow}>
          <svg className={styles.mascot} viewBox="0 0 60 60" aria-hidden="true">
            <circle cx="30" cy="34" r="24" fill="var(--color-sunset)" />
            <circle cx="30" cy="24" r="15" fill="var(--color-cream)" stroke="var(--color-cocoa)" strokeWidth="1.5" />
            <circle cx="25" cy="22" r="1.8" fill="var(--color-ink)" />
            <circle cx="35" cy="22" r="1.8" fill="var(--color-ink)" />
            <path d="M 24 28 Q 30 33 36 28" stroke="var(--color-ink)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </svg>
          <div>
            <span className={styles.stepChip}>
              STEP {stepIndex + 1} OF {STEPS.length}
            </span>
            <span className={styles.says}>Alex says…</span>
          </div>
          <button type="button" className={styles.skip} onClick={() => completeTutorial(true)}>
            Skip Tutorial
          </button>
        </div>

        <h2>{step.title}</h2>
        <p className={styles.body}>{step.body}</p>
        <ul className={styles.tips}>
          {step.tips.map((tip) => (
            <li key={tip}>💡 {tip}</li>
          ))}
        </ul>

        <footer className={styles.nav}>
          <Button variant="ghost" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => i - 1)}>
            ← Previous
          </Button>
          <div className={styles.dots} aria-hidden="true">
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                className={i === stepIndex ? styles.dotActive : styles.dot}
                onClick={() => setStepIndex(i)}
                tabIndex={-1}
              />
            ))}
          </div>
          {last ? (
            <Button variant="primary" onClick={() => completeTutorial(false)}>
              Start playing! 🎉
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setStepIndex((i) => i + 1)}>
              Next →
            </Button>
          )}
        </footer>
      </section>
    </div>
  );
}
