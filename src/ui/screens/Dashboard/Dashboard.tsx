import { STAGE_FRIENDLY_LABEL, WEEKDAYS } from '../../../engine/constants';
import { useGameStore } from '../../../store/gameStore';
import { Button } from '../../components/Button';
import styles from './Dashboard.module.css';

interface DashboardProps {
  onExitToMenu(): void;
}

/**
 * M2 placeholder — proves a running, restorable game. The real Dashboard
 * (KPI bar, office scene, notification feed) is Milestone M3.
 */
export function Dashboard({ onExitToMenu }: DashboardProps) {
  const game = useGameStore((s) => s.game);
  if (!game) return null;

  const { clock, meta, currencies } = game;
  const weekday = WEEKDAYS[clock.weekday] ?? '';
  const customers = Object.values(game.customers);
  const loans = Object.values(game.loans);

  return (
    <main className={styles.screen}>
      <header className={styles.topBar}>
        <span className={styles.dayChip}>
          DAY {clock.day} · {clock.season.toUpperCase()} · {weekday.toUpperCase()}
        </span>
        <h3>{meta.officeName}</h3>
        <span className={styles.money}>${currencies.coins.toLocaleString('en-US')}</span>
      </header>

      <section className={styles.body}>
        <h2>Welcome in, {meta.playerName}!</h2>
        <p className={styles.copy}>
          Your desk is set up and the coffee is warm. The full office view arrives in Milestone 3 —
          but your game is saved automatically, so feel free to come and go.
        </p>

        {loans.map((loan) => {
          const customer = customers.find((c) => c.id === loan.customerId);
          return (
            <article key={loan.id} className={styles.loanCard}>
              <h4>{customer ? customer.name : 'A new customer'}</h4>
              <p>
                {customer ? customer.dreamHome.name : 'Dream home'} · $
                {loan.amount.toLocaleString('en-US')}
              </p>
              <span className={styles.stageChip}>{STAGE_FRIENDLY_LABEL[loan.stage]}</span>
            </article>
          );
        })}

        <Button variant="ghost" onClick={onExitToMenu}>
          Back to Main Menu
        </Button>
      </section>
    </main>
  );
}
