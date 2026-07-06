import { Coins, FolderCheck, Star, TrendingUp, Wallet } from 'lucide-react';
import { DAY_START_HOUR, WEEKDAYS } from '../../../engine/constants';
import { ACHIEVEMENTS_BY_ID } from '../../../engine/content/achievements';
import { useGameStore } from '../../../store/gameStore';
import { Button } from '../../components/Button';
import { moneyFull } from '../../format';
import styles from './EndOfDay.module.css';

/** End of Day Summary (GDD §11 screen 8). Shown when the clock rolls over. */
export function EndOfDay() {
  const game = useGameStore((s) => s.game);
  const startNextDay = useGameStore((s) => s.startNextDay);

  if (!game) return null;
  const today = game.dayHistory[game.dayHistory.length - 1];
  if (!today) return null;
  const yesterday = game.dayHistory[game.dayHistory.length - 2];

  const verdict =
    today.starRating >= 4 ? 'Great day!' : today.starRating === 3 ? 'Solid day.' : 'A tough one — tomorrow is fresh.';
  const net = today.revenue - today.payroll;
  const maxBar = Math.max(1, ...today.revenueByHour, ...(yesterday?.revenueByHour ?? []));
  const activeLoans = Object.values(game.loans).filter((l) => l.stage !== 'completed').length;

  return (
    <main className={styles.screen}>
      <section className={styles.panel}>
        <header className={styles.hero}>
          <span className={styles.dayChip}>
            DAY {today.day} · {game.clock.season.toUpperCase()} ·{' '}
            {(WEEKDAYS[(game.clock.weekday + 6) % 7] ?? '').toUpperCase()}
          </span>
          <h1>{verdict}</h1>
          <div className={styles.stars} aria-label={`${today.starRating} of 5 stars`}>
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                size={26}
                className={i < today.starRating ? styles.starOn : styles.star}
                fill={i < today.starRating ? 'currentColor' : 'none'}
              />
            ))}
          </div>
        </header>

        <div className={styles.kpis}>
          <Kpi
            icon={<Coins size={15} />}
            label="Revenue"
            value={moneyFull(today.revenue)}
            delta={yesterday ? today.revenue - yesterday.revenue : null}
            money
          />
          <Kpi
            icon={<Wallet size={15} />}
            label="Payroll"
            value={`−${moneyFull(today.payroll)}`}
            delta={null}
            note={`net ${net >= 0 ? '+' : '−'}${moneyFull(Math.abs(net))}`}
          />
          <Kpi
            icon={<FolderCheck size={15} />}
            label="Loans Completed"
            value={String(today.loansCompleted)}
            delta={yesterday ? today.loansCompleted - yesterday.loansCompleted : null}
          />
          <Kpi icon={<TrendingUp size={15} />} label="XP Earned" value={`+${today.xpEarned}`} delta={null} />
        </div>

        <section className={styles.chartSection}>
          <h4>Hourly revenue {yesterday ? '· today vs yesterday' : ''}</h4>
          <div className={styles.chart} role="img" aria-label="Hourly revenue bar chart, 9 AM to 6 PM">
            {today.revenueByHour.map((value, i) => (
              <div key={i} className={styles.hourGroup}>
                <div className={styles.bars}>
                  {yesterday && (
                    <div
                      className={styles.barYesterday}
                      style={{ height: `${((yesterday.revenueByHour[i] ?? 0) / maxBar) * 100}%` }}
                      title={`Yesterday: ${moneyFull(yesterday.revenueByHour[i] ?? 0)}`}
                    />
                  )}
                  <div
                    className={styles.barToday}
                    style={{ height: `${(value / maxBar) * 100}%` }}
                    title={`Today: ${moneyFull(value)}`}
                  />
                </div>
                <span className={styles.hourLabel}>{formatHour(DAY_START_HOUR + i)}</span>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.columns}>
          <section>
            <h4>Today's highlights</h4>
            {today.highlights.length === 0 ? (
              <p className={styles.quiet}>A quiet, steady day at the office.</p>
            ) : (
              <ul className={styles.highlights}>
                {today.highlights.map((event, i) => (
                  <li key={i}>
                    <strong>{event.title}</strong>
                    <span>{event.detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h4>Badges</h4>
            {today.badgesEarned.length === 0 ? (
              <p className={styles.quiet}>No new badges today — plenty still to earn!</p>
            ) : (
              <div className={styles.badges}>
                {today.badgesEarned.map((id) => {
                  const badge = ACHIEVEMENTS_BY_ID[id];
                  if (!badge) return null;
                  return (
                    <span key={id} className={styles.badge}>
                      <span className={styles.newRibbon}>NEW</span>
                      {badge.emoji} {badge.name}
                    </span>
                  );
                })}
              </div>
            )}

            <h4 className={styles.upNextTitle}>Up next</h4>
            <p className={styles.quiet}>
              {activeLoans > 0
                ? `${activeLoans} ${activeLoans === 1 ? 'loan is' : 'loans are'} in the pipeline — and maybe a new face tomorrow.`
                : 'The pipeline is clear. A fresh lead might walk in tomorrow!'}
            </p>
          </section>
        </div>

        <footer className={styles.actions}>
          <Button variant="primary" size="lg" onClick={startNextDay}>
            Start Day {game.clock.day} →
          </Button>
          <span className={styles.savedNote}>Progress saved automatically 💾</span>
        </footer>
      </section>
    </main>
  );
}

function Kpi({
  icon,
  label,
  value,
  delta,
  note,
  money = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: number | null;
  note?: string;
  money?: boolean;
}) {
  return (
    <div className={styles.kpi}>
      <span className={styles.kpiIcon}>{icon}</span>
      <span className={styles.kpiLabel}>{label}</span>
      <strong className={styles.kpiValue}>{value}</strong>
      {delta !== null && delta !== 0 && (
        <span className={delta > 0 ? styles.deltaUp : styles.deltaDown}>
          {delta > 0 ? '↑' : '↓'} {money ? moneyFull(Math.abs(delta)) : Math.abs(delta)} vs yesterday
        </span>
      )}
      {note && <span className={styles.kpiNote}>{note}</span>}
    </div>
  );
}

function formatHour(hour: number): string {
  if (hour === 12) return '12p';
  return hour < 12 ? `${hour}a` : `${hour - 12}p`;
}
