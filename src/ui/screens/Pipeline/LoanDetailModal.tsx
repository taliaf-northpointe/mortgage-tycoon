import { DOC_FRIENDLY_NAME, LOAN_TYPE_LABEL, STAGE_DISPLAY_NAME } from '../../../engine/constants';
import { missingDocs, nextStage } from '../../../engine/loans';
import type { Customer, DocStatus, DocumentKey, Loan } from '../../../engine/types';
import { useGameStore } from '../../../store/gameStore';
import { Button } from '../../components/Button';
import { moneyFull } from '../../format';
import styles from './Pipeline.module.css';

const DOC_ORDER: readonly DocumentKey[] = [
  'proofOfJob',
  'moneyInBank',
  'photoId',
  'addressHistory',
  'references',
  'taxPapers',
  'homeInspection',
];

const DOC_STATUS_LABEL: Record<Exclude<DocStatus, 'notRequired'>, string> = {
  missing: 'Missing',
  requested: 'Requested',
  collected: 'Collected',
};

export function LoanDetailModal({
  loan,
  customer,
  onClose,
}: {
  loan: Loan;
  customer: Customer | undefined;
  onClose(): void;
}) {
  const requestDocument = useGameStore((s) => s.requestDocument);
  const contactCustomer = useGameStore((s) => s.contactCustomer);
  const moveLoan = useGameStore((s) => s.moveLoan);

  const next = nextStage(loan.stage);
  const owed = missingDocs(loan).length;
  const moveBlocked = loan.stage === 'documents' && owed > 0;
  const requiredDocs = DOC_ORDER.filter((key) => loan.documents[key] !== 'notRequired');

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <section
        className={styles.modal}
        role="dialog"
        aria-label={`Loan details for ${customer?.name ?? loan.id}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.modalHeader}>
          <div>
            <h3>{customer?.name ?? 'Customer'}</h3>
            <span className={styles.loanId}>
              {loan.id} · {LOAN_TYPE_LABEL[loan.type]}
            </span>
          </div>
          <span className={styles.stageChipBig}>
            IN {STAGE_DISPLAY_NAME[loan.stage].toUpperCase()} · DAY {loan.daysInPipeline + 1}
          </span>
        </header>

        <dl className={styles.terms}>
          <div>
            <dt>Amount</dt>
            <dd>{moneyFull(loan.amount)}</dd>
          </div>
          <div>
            <dt>Term</dt>
            <dd>{loan.termYears} years</dd>
          </div>
          <div>
            <dt>Rate</dt>
            <dd>{loan.rate.toFixed(1)}%</dd>
          </div>
        </dl>

        <h4 className={styles.checklistTitle}>Papers</h4>
        <ul className={styles.checklist}>
          {requiredDocs.map((key) => {
            const status = loan.documents[key];
            if (status === 'notRequired') return null;
            return (
              <li key={key}>
                <span>{DOC_FRIENDLY_NAME[key]}</span>
                <span className={styles[`doc_${status}`]}>{DOC_STATUS_LABEL[status]}</span>
                {status === 'missing' && (
                  <Button onClick={() => requestDocument(loan.id, key)}>Request</Button>
                )}
              </li>
            );
          })}
        </ul>

        <footer className={styles.modalActions}>
          {loan.stage !== 'completed' && next ? (
            <>
              <Button variant="primary" disabled={moveBlocked} onClick={() => moveLoan(loan.id)}>
                Move to {STAGE_DISPLAY_NAME[next]}
              </Button>
              {moveBlocked && (
                <span className={styles.blockedNote}>
                  Waiting on {owed} more {owed === 1 ? 'paper' : 'papers'}
                </span>
              )}
            </>
          ) : (
            <span className={styles.doneNote}>All done — keys handed over! 🏠</span>
          )}
          {loan.stage !== 'completed' && (
            <Button onClick={() => contactCustomer(loan.id)}>Contact</Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </footer>
      </section>
    </div>
  );
}
