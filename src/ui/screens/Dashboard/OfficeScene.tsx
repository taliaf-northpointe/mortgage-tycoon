import type { Employee } from '../../../engine/types';
import styles from './Dashboard.module.css';

const DESKS = [
  { x: 190, y: 220 },
  { x: 480, y: 170 },
  { x: 400, y: 330 },
  { x: 660, y: 290 },
];

const SHIRTS = ['var(--color-sky)', 'var(--color-sage)', 'var(--color-lavender)', 'var(--color-rose)'];

/**
 * The office scene (GDD §11 screen 2) — SVG with gentle idle bob. Static
 * composition in v1 by design (TDD §1.1); upgrades add decor in M7.
 */
export function OfficeScene({ employees }: { employees: Employee[] }) {
  return (
    <svg className={styles.scene} viewBox="40 90 820 380" aria-label="Your office">
      {/* floor */}
      <polygon
        points="450,30 880,260 450,490 20,260"
        fill="color-mix(in srgb, var(--color-sand) 55%, var(--color-paper))"
        stroke="var(--color-sand)"
        strokeWidth="2"
      />
      <ellipse cx="450" cy="270" rx="180" ry="90" fill="var(--color-sage)" opacity="0.14" />

      {/* water cooler */}
      <g className={styles.bobSlow}>
        <rect x="800" y="180" width="26" height="52" rx="8" fill="var(--color-paper)" stroke="var(--color-sand)" />
        <rect x="803" y="160" width="20" height="26" rx="7" fill="var(--color-sky)" opacity="0.55" />
      </g>

      {/* plant */}
      <g className={styles.bob}>
        <rect x="76" y="252" width="30" height="26" rx="8" fill="var(--color-terracotta)" opacity="0.85" />
        <circle cx="91" cy="238" r="20" fill="var(--color-sage)" />
        <circle cx="76" cy="248" r="13" fill="var(--color-sage)" opacity="0.8" />
        <circle cx="106" cy="248" r="13" fill="var(--color-sage)" opacity="0.8" />
      </g>

      {employees.slice(0, DESKS.length).map((employee, i) => {
        const desk = DESKS[i];
        if (!desk) return null;
        return (
          <Workstation
            key={employee.id}
            x={desk.x}
            y={desk.y}
            name={employee.name.split(' ')[0] ?? employee.name}
            shirt={SHIRTS[i % SHIRTS.length] ?? 'var(--color-sky)'}
            slow={i % 2 === 1}
          />
        );
      })}
    </svg>
  );
}

function Workstation({
  x,
  y,
  name,
  shirt,
  slow,
}: {
  x: number;
  y: number;
  name: string;
  shirt: string;
  slow: boolean;
}) {
  return (
    <g>
      {/* person behind the desk */}
      <g className={slow ? styles.bobSlow : styles.bob}>
        <rect x={x + 48} y={y - 34} width={44} height={40} rx={14} fill={shirt} />
        <circle cx={x + 70} cy={y - 46} r={17} fill="var(--color-cream)" stroke="var(--color-cocoa)" strokeWidth="1.5" />
        <circle cx={x + 64} cy={y - 48} r={1.8} fill="var(--color-ink)" />
        <circle cx={x + 76} cy={y - 48} r={1.8} fill="var(--color-ink)" />
        <path d={`M ${x + 65} ${y - 41} Q ${x + 70} ${y - 37} ${x + 75} ${y - 41}`} stroke="var(--color-ink)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>

      {/* iso desk */}
      <polygon
        points={`${x},${y + 26} ${x + 70},${y - 4} ${x + 140},${y + 26} ${x + 70},${y + 56}`}
        fill="var(--color-paper)"
        stroke="var(--color-sand)"
        strokeWidth="2"
      />
      <polygon
        points={`${x},${y + 26} ${x + 70},${y + 56} ${x + 70},${y + 76} ${x},${y + 46}`}
        fill="var(--color-sand)"
      />
      <polygon
        points={`${x + 140},${y + 26} ${x + 70},${y + 56} ${x + 70},${y + 76} ${x + 140},${y + 46}`}
        fill="color-mix(in srgb, var(--color-sand) 70%, var(--color-cocoa))"
      />
      {/* monitor */}
      <rect x={x + 56} y={y - 2} width={28} height={20} rx={5} fill="var(--color-ink)" opacity="0.85" />
      <rect x={x + 59} y={y + 1} width={22} height={14} rx={3} fill="var(--color-sky)" opacity="0.7" />

      <text x={x + 70} y={y + 96} textAnchor="middle" className={styles.deskLabel}>
        {name}
      </text>
    </g>
  );
}
