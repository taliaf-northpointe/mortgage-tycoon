import { useState } from 'react';
import { ArrowLeft, Binoculars, Building2, Lock } from 'lucide-react';
import { MAP_SCREEN_LEVEL, SCOUTING_COST, WEEKDAYS } from '../../../engine/constants';
import { NEIGHBORHOODS, NEIGHBORHOODS_BY_ID } from '../../../engine/content/neighborhoods';
import { branchBlockedReason } from '../../../engine/map';
import { useGameStore } from '../../../store/gameStore';
import { Button } from '../../components/Button';
import { moneyFull } from '../../format';
import styles from './WorldMap.module.css';

/** Plot positions for the region view (design-canvas coordinates). */
const PLOTS: Record<string, { x: number; y: number }> = {
  oldTown: { x: 330, y: 200 },
  sunnyHeights: { x: 520, y: 110 },
  riversideVillage: { x: 150, y: 130 },
  uptownHills: { x: 600, y: 250 },
  eastRidge: { x: 120, y: 290 },
  greenValley: { x: 400, y: 330 },
};

const STATUS_LABEL: Record<string, string> = {
  mainOffice: 'Main Office',
  branch: 'Branch',
  available: 'Available!',
  locked: 'Locked',
};

export function WorldMap({ onBack }: { onBack(): void }) {
  const game = useGameStore((s) => s.game);
  const scout = useGameStore((s) => s.scoutNeighborhood);
  const open = useGameStore((s) => s.openBranch);
  const [selectedId, setSelectedId] = useState('riversideVillage');

  if (!game) return null;
  const gated = game.stats.level < MAP_SCREEN_LEVEL;
  const selected = NEIGHBORHOODS_BY_ID[selectedId];
  const selectedState = game.neighborhoods[selectedId];
  const blocked = branchBlockedReason(game, selectedId);
  const loansIn = (id: string) =>
    Object.values(game.loans).filter((l) => {
      const customer = game.customers[l.customerId];
      return customer?.dreamHome.neighborhoodId === id && l.stage !== 'completed';
    }).length;

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button type="button" className={styles.backButton} onClick={onBack} aria-label="Back">
          <ArrowLeft size={16} />
        </button>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <button type="button" onClick={onBack}>
            Dashboard
          </button>
          <span>/</span>
          <strong>Meadowbrook Region</strong>
        </nav>
        <span className={styles.dayChip}>
          DAY {game.clock.day} · {game.clock.season.toUpperCase()} ·{' '}
          {(WEEKDAYS[game.clock.weekday] ?? '').toUpperCase()}
        </span>
        <span className={styles.repChip}>⭐ Reputation {game.stats.reputation}/100</span>
        <span className={styles.coinChip}>{moneyFull(game.currencies.coins)}</span>
      </header>

      {gated ? (
        <section className={styles.gate}>
          <Lock size={28} aria-hidden="true" />
          <h2>The World Map unlocks at Level {MAP_SCREEN_LEVEL}</h2>
          <p>
            Become a <strong>CEO</strong> and the whole Meadowbrook Region opens up for expansion.
            You're Level {game.stats.level}.
          </p>
        </section>
      ) : (
        <div className={styles.body}>
          {/* ── Neighborhood list ── */}
          <nav className={styles.list} aria-label="Neighborhoods">
            {NEIGHBORHOODS.map((def) => {
              const hood = game.neighborhoods[def.id];
              if (!hood) return null;
              const statusLine =
                hood.status === 'mainOffice'
                  ? `Main Office · ${loansIn(def.id)} loans`
                  : hood.status === 'branch'
                    ? `Branch · ${loansIn(def.id)} loans`
                    : hood.status === 'available'
                      ? hood.scouted
                        ? `Available! · ${hood.leads} leads`
                        : 'Available! · ?'
                      : `Locked · needs ${def.reputationRequired} rep`;
              return (
                <button
                  key={def.id}
                  type="button"
                  className={def.id === selectedId ? styles.hoodActive : styles.hood}
                  onClick={() => setSelectedId(def.id)}
                  aria-current={def.id === selectedId}
                >
                  <span className={`${styles.dot} ${styles[`dot_${hood.status}`]}`} aria-hidden="true" />
                  <span className={styles.hoodName}>{def.name}</span>
                  <span className={styles.hoodStatus}>{statusLine}</span>
                </button>
              );
            })}
            <div className={styles.legend} aria-label="Legend">
              <span>
                <span className={`${styles.dot} ${styles.dot_mainOffice}`} /> Main Office
              </span>
              <span>
                <span className={`${styles.dot} ${styles.dot_branch}`} /> Branch
              </span>
              <span>
                <span className={`${styles.dot} ${styles.dot_available}`} /> Available
              </span>
              <span>
                <span className={`${styles.dot} ${styles.dot_locked}`} /> Locked
              </span>
            </div>
          </nav>

          {/* ── Region view ── */}
          <section className={styles.mapArea} aria-label="Region map">
            <svg viewBox="0 0 720 420" className={styles.mapSvg}>
              <ellipse cx="360" cy="220" rx="340" ry="190" fill="var(--color-sage)" opacity="0.15" />
              <path
                d="M 40 90 Q 200 160 250 260 Q 290 340 200 400"
                stroke="var(--color-sky)"
                strokeWidth="16"
                fill="none"
                opacity="0.35"
                strokeLinecap="round"
              />
              {NEIGHBORHOODS.map((def) => {
                const hood = game.neighborhoods[def.id];
                const plot = PLOTS[def.id];
                if (!hood || !plot) return null;
                return (
                  <g
                    key={def.id}
                    className={styles.plot}
                    onClick={() => setSelectedId(def.id)}
                    role="button"
                    aria-label={`${def.name}: ${STATUS_LABEL[hood.status]}`}
                  >
                    <polygon
                      points={`${plot.x},${plot.y - 34} ${plot.x + 56},${plot.y} ${plot.x},${plot.y + 34} ${plot.x - 56},${plot.y}`}
                      className={`${styles.plotShape} ${styles[`plot_${hood.status}`]} ${
                        def.id === selectedId ? styles.plotSelected : ''
                      }`}
                    />
                    {(hood.status === 'mainOffice' || hood.status === 'branch') && (
                      <g className={styles.bob}>
                        <rect x={plot.x - 12} y={plot.y - 22} width={24} height={18} rx={4} fill="var(--color-paper)" stroke="var(--color-cocoa)" />
                        <path d={`M ${plot.x - 16} ${plot.y - 20} L ${plot.x} ${plot.y - 32} L ${plot.x + 16} ${plot.y - 20} Z`} fill="var(--color-terracotta)" />
                      </g>
                    )}
                    {hood.status === 'locked' && (
                      <text x={plot.x} y={plot.y - 12} textAnchor="middle" fontSize="14">
                        🔒
                      </text>
                    )}
                    <text x={plot.x} y={plot.y + 14} textAnchor="middle" className={styles.plotLabel}>
                      {def.name}
                    </text>
                  </g>
                );
              })}
              {/* ambient life */}
              <circle className={styles.car} r="4" fill="var(--color-rose)" />
              <circle className={styles.carSlow} r="4" fill="var(--color-sky)" />
            </svg>
          </section>

          {/* ── Detail panel ── */}
          {selected && selectedState && (
            <aside className={styles.detail}>
              <h3>{selected.name}</h3>
              <span className={styles.detailStatus}>{STATUS_LABEL[selectedState.status]}</span>
              <p className={styles.description}>{selected.description}</p>
              <dl className={styles.stats}>
                <div>
                  <dt>Demand</dt>
                  <dd>{selectedState.demand.toUpperCase()}</dd>
                </div>
                <div>
                  <dt>Homes</dt>
                  <dd>{selectedState.scouted ? selected.homes : '?'}</dd>
                </div>
                <div>
                  <dt>Leads</dt>
                  <dd>{selectedState.scouted ? selectedState.leads : '?'}</dd>
                </div>
              </dl>

              {selectedState.status === 'available' || selectedState.status === 'locked' ? (
                <>
                  <div className={styles.costRow}>
                    <span>Branch cost</span>
                    <strong>{moneyFull(selected.branchCost)}</strong>
                  </div>
                  <Button variant="primary" disabled={blocked !== null} onClick={() => open(selectedId)}>
                    <Building2 size={14} /> Open Branch Office
                  </Button>
                  {!selectedState.scouted && (
                    <Button
                      onClick={() => scout(selectedId)}
                      disabled={game.currencies.coins < SCOUTING_COST}
                    >
                      <Binoculars size={14} /> Send scouts first — {moneyFull(SCOUTING_COST)}
                    </Button>
                  )}
                  {blocked && <span className={styles.blockedNote}>{blocked}</span>}
                </>
              ) : (
                <p className={styles.description}>
                  {selectedState.status === 'mainOffice'
                    ? 'Home sweet headquarters. The whole story started here.'
                    : 'Your branch is open and greeting neighbors every day. 🎊'}
                </p>
              )}
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
