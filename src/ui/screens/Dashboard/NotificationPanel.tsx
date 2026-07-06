import { useState } from 'react';
import { Bell } from 'lucide-react';
import type { GameEvent } from '../../../engine/types';
import styles from './Dashboard.module.css';

type Filter = 'all' | 'loans' | 'customers' | 'alerts';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'loans', label: 'Loans' },
  { key: 'customers', label: 'Customers' },
  { key: 'alerts', label: 'Alerts' },
];

export function NotificationPanel({ events, currentHour }: { events: GameEvent[]; currentHour: number }) {
  const [filter, setFilter] = useState<Filter>('all');
  const visible = events.filter((e) => filter === 'all' || e.category === filter).slice().reverse();

  return (
    <aside className={styles.panel}>
      <header className={styles.panelHeader}>
        <Bell size={16} aria-hidden="true" />
        <h4>What's happening</h4>
      </header>
      <div className={styles.filterRow}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={filter === f.key ? styles.filterChipActive : styles.filterChip}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className={styles.eventList}>
        {visible.length === 0 ? (
          <p className={styles.emptyFeed}>All quiet for now — news lands here as the day rolls on.</p>
        ) : (
          visible.map((event) => (
            <article key={event.id} className={styles.eventCard}>
              <h4>{event.title}</h4>
              <p>{event.detail}</p>
              <span className={styles.eventTime}>{relativeTime(event, currentHour)}</span>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}

function relativeTime(event: GameEvent, currentHour: number): string {
  const hours = Math.max(0, currentHour - event.hour);
  if (hours === 0) return 'just now';
  if (hours === 1) return '1 hour ago';
  return `${hours} hours ago`;
}
