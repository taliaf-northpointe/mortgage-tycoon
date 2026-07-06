import styles from './MainMenu.module.css';

/**
 * Decorative animated town backdrop for the Main Menu (GDD §11).
 * Cozy flat-front houses with idle bob — the full isometric scene ships
 * with the Office/Map milestones.
 */
export function TownScene() {
  return (
    <svg
      className={styles.town}
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <circle cx="1200" cy="70" r="46" fill="var(--color-honey)" opacity="0.9" />
      <g className={styles.bob}>
        <House x={140} body="var(--color-cream)" roof="var(--color-terracotta)" />
      </g>
      <g className={styles.bobSlow}>
        <House x={420} body="var(--color-paper)" roof="var(--color-sky)" wide />
      </g>
      <g className={styles.bob}>
        <House x={760} body="var(--color-cream)" roof="var(--color-sage)" />
      </g>
      <g className={styles.bobSlow}>
        <House x={1020} body="var(--color-paper)" roof="var(--color-lavender)" wide />
      </g>
      <Tree x={340} />
      <Tree x={700} />
      <Tree x={1300} />
      <rect x="0" y="296" width="1440" height="24" rx="12" fill="var(--color-sage)" opacity="0.35" />
    </svg>
  );
}

function House({ x, body, roof, wide = false }: { x: number; body: string; roof: string; wide?: boolean }) {
  const w = wide ? 200 : 150;
  return (
    <g>
      <rect x={x} y={190} width={w} height={110} rx={10} fill={body} stroke="var(--color-sand)" strokeWidth="2" />
      <path
        d={`M ${x - 14} 196 Q ${x + w / 2} 100 ${x + w + 14} 196 Z`}
        fill={roof}
        opacity="0.92"
      />
      <rect x={x + 22} y={220} width={30} height={30} rx={8} fill="var(--color-honey)" opacity="0.85" />
      <rect x={x + w - 52} y={220} width={30} height={30} rx={8} fill="var(--color-honey)" opacity="0.85" />
      <rect x={x + w / 2 - 16} y={252} width={32} height={48} rx={9} fill="var(--color-cocoa)" opacity="0.8" />
    </g>
  );
}

function Tree({ x }: { x: number }) {
  return (
    <g>
      <rect x={x - 5} y={262} width={10} height={38} rx={5} fill="var(--color-cocoa)" />
      <circle cx={x} cy={246} r={30} fill="var(--color-sage)" opacity="0.85" />
    </g>
  );
}
