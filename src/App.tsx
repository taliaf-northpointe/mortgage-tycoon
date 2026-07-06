import { useState } from 'react';
import { GAME_TITLE, TAGLINE } from './engine/constants';
import styles from './App.module.css';

/** One id per designed screen (GDD §11). Screens arrive milestone by milestone. */
export type ScreenId =
  | 'mainMenu'
  | 'dashboard'
  | 'pipeline'
  | 'customer'
  | 'employees'
  | 'upgrades'
  | 'map'
  | 'endOfDay';

export function App() {
  const [screen] = useState<ScreenId>('mainMenu');

  // M0: every screen renders the themed placeholder. M2 replaces mainMenu
  // with the real Main Menu; later milestones fill in the rest.
  return <PlaceholderScreen screen={screen} />;
}

function PlaceholderScreen({ screen }: { screen: ScreenId }) {
  return (
    <main className={styles.splash}>
      <span className={styles.pill}>A Cozy Tycoon Game</span>
      <h1 className={styles.title}>{GAME_TITLE}</h1>
      <p className={styles.tagline}>{TAGLINE}</p>
      <p className={styles.note}>
        Milestone M0 · scaffold up and running · current screen: {screen}
      </p>
    </main>
  );
}
