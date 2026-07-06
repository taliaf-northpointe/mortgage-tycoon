import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import {
  LOAN_PRODUCT_LABEL,
  LOAN_PURPOSE_LABEL,
  STAGE_DISPLAY_NAME,
  STAGE_ORDER,
  STAGE_PROGRESS_PCT,
  WEEKDAYS,
} from '../../../engine/constants';
import { STAGE_GLOSSARY_KEY } from '../../../engine/content/glossary';
import type { Loan, LoanStage } from '../../../engine/types';
import { useGameStore } from '../../../store/gameStore';
import { Confetti } from '../../components/Confetti';
import { GlossaryTerm } from '../../glossary/GlossaryTerm';
import { initials, moneyCompact, moneyFull } from '../../format';
import { LoanDetailModal } from './LoanDetailModal';
import styles from './Pipeline.module.css';

interface PipelineProps {
  onBack(): void;
  onOpenCustomer(customerId: string): void;
}

export function Pipeline({ onBack, onOpenCustomer }: PipelineProps) {
  const game = useGameStore((s) => s.game);
  const [search, setSearch] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  // Fire the confetti burst when any loan reaches Completed while the board
  // is open (Style Guide: this is the game's signature payoff moment).
  const prevStages = useRef<Record<string, LoanStage>>({});
  useEffect(() => {
    if (!game) return;
    const stages: Record<string, LoanStage> = {};
    let closed = false;
    for (const loan of Object.values(game.loans)) {
      stages[loan.id] = loan.stage;
      const prev = prevStages.current[loan.id];
      if (prev && prev !== 'completed' && loan.stage === 'completed') closed = true;
    }
    prevStages.current = stages;
    if (closed) {
      setCelebrating(true);
      const timer = window.setTimeout(() => setCelebrating(false), 1_000);
      return () => window.clearTimeout(timer);
    }
  }, [game]);

  if (!game) return null;

  const loans = Object.values(game.loans);
  const query = search.trim().toLowerCase();
  const visibleLoans = query
    ? loans.filter((loan) => {
        const customer = game.customers[loan.customerId];
        return (customer?.name ?? '').toLowerCase().includes(query);
      })
    : loans;

  const metrics = boardMetrics(loans);
  const selectedLoan = selectedLoanId ? game.loans[selectedLoanId] : undefined;

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
          <strong>Loan Pipeline</strong>
        </nav>
        <span className={styles.dayChip}>
          DAY {game.clock.day} · {game.clock.season.toUpperCase()} ·{' '}
          {(WEEKDAYS[game.clock.weekday] ?? '').toUpperCase()}
        </span>
        <label className={styles.search}>
          <Search size={14} aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers…"
            aria-label="Search customers"
          />
        </label>
      </header>

      <section className={styles.metrics}>
        <Metric label="Total Loans" value={String(metrics.totalLoans)} />
        <Metric label="Total Volume" value={moneyFull(metrics.totalVolume)} />
        <Metric label="Avg. Time in Pipeline" value={metrics.avgDays} />
        <Metric label="Conversion Rate" value={metrics.conversion} />
      </section>

      <section className={styles.board} aria-label="Loan pipeline board">
        {STAGE_ORDER.map((stage) => {
          const stageLoans = visibleLoans.filter((loan) => loan.stage === stage);
          const glossaryKey = STAGE_GLOSSARY_KEY[stage];
          return (
            <div key={stage} className={styles.column}>
              <header className={styles.columnHeader}>
                <h4>
                  {glossaryKey ? (
                    <GlossaryTerm termKey={glossaryKey}>{STAGE_DISPLAY_NAME[stage]}</GlossaryTerm>
                  ) : (
                    STAGE_DISPLAY_NAME[stage]
                  )}
                </h4>
                <span>{stageLoans.length}</span>
              </header>
              {stageLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  customerName={game.customers[loan.customerId]?.name ?? 'Customer'}
                  onClick={() => setSelectedLoanId(loan.id)}
                />
              ))}
            </div>
          );
        })}
      </section>

      {selectedLoan && (
        <LoanDetailModal
          loan={selectedLoan}
          customer={game.customers[selectedLoan.customerId]}
          onClose={() => setSelectedLoanId(null)}
          onOpenCustomer={onOpenCustomer}
        />
      )}
      {celebrating && <Confetti />}
    </div>
  );
}

function LoanCard({
  loan,
  customerName,
  onClick,
}: {
  loan: Loan;
  customerName: string;
  onClick(): void;
}) {
  const progress = STAGE_PROGRESS_PCT[loan.stage];
  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <div className={styles.cardTop}>
        <span className={styles.cardAvatar}>{initials(customerName)}</span>
        <div>
          <strong>{customerName}</strong>
          <span className={styles.cardType}>
            {LOAN_PRODUCT_LABEL[loan.product]} · {LOAN_PURPOSE_LABEL[loan.purpose]}
          </span>
        </div>
        <span className={styles.cardAmount}>{moneyCompact(loan.amount)}</span>
      </div>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>
      <div className={styles.cardBottom}>
        <span>
          Day {loan.daysInPipeline + 1} · {progress}%
        </span>
        {loan.statusTag && <span className={styles.cardTag}>{loan.statusTag}</span>}
      </div>
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metric}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function boardMetrics(loans: Loan[]) {
  // Metrics describe every loan on the board — otherwise Total Volume reads
  // $0 the moment the last loan closes, which looks broken.
  const completed = loans.filter((l) => l.stage === 'completed').length;
  const avg =
    loans.length === 0 ? null : loans.reduce((sum, l) => sum + l.daysInPipeline + 1, 0) / loans.length;
  return {
    totalLoans: loans.length,
    totalVolume: loans.reduce((sum, l) => sum + l.amount, 0),
    avgDays: avg === null ? '—' : `${avg.toFixed(1)} days`,
    conversion: loans.length === 0 ? '—' : `${Math.round((completed / loans.length) * 100)}%`,
  };
}
