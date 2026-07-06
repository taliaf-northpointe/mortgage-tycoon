import { useState } from 'react';
import {
  Armchair,
  ArrowLeft,
  Check,
  Cpu,
  Gem,
  GraduationCap,
  HeartHandshake,
  Lock,
  Megaphone,
  Microscope,
  Coins as CoinsIcon,
} from 'lucide-react';
import { UPGRADES_SCREEN_LEVEL, WEEKDAYS } from '../../../engine/constants';
import { CATEGORIES, CATEGORY_META, UPGRADES, UPGRADES_BY_ID } from '../../../engine/content/upgrades';
import type { UpgradeCategory } from '../../../engine/content/upgrades';
import { purchaseBlockedReason, totalPurchased } from '../../../engine/upgrades';
import { useGameStore } from '../../../store/gameStore';
import { Button } from '../../components/Button';
import { moneyFull } from '../../format';
import styles from './Upgrades.module.css';

const CATEGORY_ICON: Record<UpgradeCategory, React.ReactNode> = {
  office: <Armchair size={16} />,
  training: <GraduationCap size={16} />,
  marketing: <Megaphone size={16} />,
  technology: <Cpu size={16} />,
  customerExperience: <HeartHandshake size={16} />,
};

export function Upgrades({ onBack }: { onBack(): void }) {
  const game = useGameStore((s) => s.game);
  const purchase = useGameStore((s) => s.purchaseUpgrade);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!game) return null;
  const gated = game.stats.level < UPGRADES_SCREEN_LEVEL;
  const selected = selectedId ? UPGRADES_BY_ID[selectedId] : undefined;
  const selectedBlocked = selectedId ? purchaseBlockedReason(game, selectedId) : null;

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
          <strong>Upgrades</strong>
        </nav>
        <span className={styles.dayChip}>
          DAY {game.clock.day} · {game.clock.season.toUpperCase()} ·{' '}
          {(WEEKDAYS[game.clock.weekday] ?? '').toUpperCase()}
        </span>
        <div className={styles.currencies}>
          <span className={styles.currency}>
            <CoinsIcon size={14} /> {moneyFull(game.currencies.coins)}
          </span>
          <span className={styles.currency}>
            <Gem size={14} /> {game.currencies.gems} gems
          </span>
          <span className={styles.currency}>
            <Microscope size={14} /> {game.currencies.research} research
          </span>
        </div>
        <span className={styles.progress}>{totalPurchased(game)} / 25</span>
      </header>

      {gated ? (
        <section className={styles.gate}>
          <Lock size={28} aria-hidden="true" />
          <h2>Upgrades unlock at Level {UPGRADES_SCREEN_LEVEL}</h2>
          <p>
            Keep closing loans to become a <strong>Branch Manager</strong> — then the whole upgrade tree
            opens up. You're Level {game.stats.level} with {game.stats.xp} XP.
          </p>
        </section>
      ) : (
        <div className={styles.tree}>
          {CATEGORIES.map((category) => (
            <section key={category} className={styles.categoryRow}>
              <div className={styles.categoryInfo}>
                <span className={styles.categoryIcon}>{CATEGORY_ICON[category]}</span>
                <div>
                  <h4>{CATEGORY_META[category].label}</h4>
                  <span className={styles.theme}>{CATEGORY_META[category].theme}</span>
                </div>
              </div>
              <div className={styles.nodes}>
                {UPGRADES.filter((u) => u.category === category).map((upgrade, i) => {
                  const status = game.upgrades[upgrade.id] ?? 'locked';
                  return (
                    <button
                      key={upgrade.id}
                      type="button"
                      className={`${styles.node} ${styles[`node_${status}`]} ${
                        selectedId === upgrade.id ? styles.nodeSelected : ''
                      }`}
                      onClick={() => setSelectedId(upgrade.id)}
                      aria-label={`${upgrade.name}: ${status}`}
                    >
                      {i > 0 && <span className={styles.connector} aria-hidden="true" />}
                      <span className={styles.nodeIcon}>
                        {status === 'purchased' ? (
                          <Check size={15} />
                        ) : status === 'locked' ? (
                          <Lock size={13} />
                        ) : (
                          <span className={styles.nodeCost}>${Math.round(upgrade.cost / 100) / 10}K</span>
                        )}
                      </span>
                      <span className={styles.nodeName}>{upgrade.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {selected && !gated && (
        <div className={styles.overlay} onClick={() => setSelectedId(null)} role="presentation">
          <section
            className={styles.popover}
            role="dialog"
            aria-label={`Upgrade: ${selected.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span className={styles.popCategory}>
              {CATEGORY_META[selected.category].label} · Tier {selected.tier}
            </span>
            <h3>{selected.name}</h3>
            <p className={styles.flavor}>{selected.flavor}</p>
            <div className={styles.benefits}>
              {selected.benefits.map((benefit) => (
                <span key={benefit} className={styles.benefitChip}>
                  {benefit}
                </span>
              ))}
            </div>
            <div className={styles.popActions}>
              <Button
                variant="primary"
                disabled={selectedBlocked !== null}
                onClick={() => {
                  purchase(selected.id);
                  setSelectedId(null);
                }}
              >
                {game.upgrades[selected.id] === 'purchased'
                  ? 'Purchased ✓'
                  : `Purchase — ${moneyFull(selected.cost)}`}
              </Button>
              <Button variant="ghost" onClick={() => setSelectedId(null)}>
                Close
              </Button>
            </div>
            {selectedBlocked && game.upgrades[selected.id] !== 'purchased' && (
              <span className={styles.blockedNote}>{selectedBlocked}</span>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
