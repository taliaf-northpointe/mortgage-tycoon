import { useMemo } from 'react';
import styles from './Confetti.module.css';

const COLORS = [
  'var(--color-sunset)',
  'var(--color-terracotta)',
  'var(--color-honey)',
  'var(--color-sky)',
  'var(--color-sage)',
  'var(--color-lavender)',
  'var(--color-rose)',
];

/**
 * Confetti Burst (Style Guide motion spec: 800ms) — the signature payoff
 * moment when a loan closes. Mount to fire; parent unmounts it afterwards.
 */
export function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        color: COLORS[i % COLORS.length] ?? 'var(--color-honey)',
        dx: `${Math.round((Math.random() - 0.5) * 640)}px`,
        dy: `${Math.round(-80 - Math.random() * 380)}px`,
        rot: `${Math.round((Math.random() - 0.5) * 720)}deg`,
        delay: `${Math.round(Math.random() * 120)}ms`,
        tall: i % 3 === 0,
      })),
    [],
  );

  return (
    <div className={styles.layer} aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className={p.tall ? styles.pieceTall : styles.piece}
          style={{
            background: p.color,
            ['--dx' as string]: p.dx,
            ['--dy' as string]: p.dy,
            ['--rot' as string]: p.rot,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
