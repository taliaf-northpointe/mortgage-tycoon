import { useEffect, useState } from 'react';
import { REAL_MS_PER_HOUR } from './engine/constants';
import { useGameStore } from './store/gameStore';
import { Dashboard } from './ui/screens/Dashboard/Dashboard';
import { LearningCenter } from './ui/screens/LearningCenter/LearningCenter';
import { MainMenu } from './ui/screens/MainMenu/MainMenu';
import { Pipeline } from './ui/screens/Pipeline/Pipeline';

/** One id per designed screen (GDD §11). Screens arrive milestone by milestone. */
export type ScreenId =
  | 'mainMenu'
  | 'dashboard'
  | 'pipeline'
  | 'learning'
  | 'customer'
  | 'employees'
  | 'upgrades'
  | 'map'
  | 'endOfDay';

export type Speed = 0 | 1 | 2 | 3;

export function App() {
  const [screen, setScreen] = useState<ScreenId>('mainMenu');
  const [speed, setSpeed] = useState<Speed>(1);
  const hasGame = useGameStore((s) => s.game !== null);

  // The day clock (TDD §4) runs whenever a game is open, on any game screen.
  // Returning to the Main Menu pauses the world.
  useEffect(() => {
    if (!hasGame || screen === 'mainMenu' || speed === 0) return;
    const id = window.setInterval(() => useGameStore.getState().tick(), REAL_MS_PER_HOUR / speed);
    return () => window.clearInterval(id);
  }, [hasGame, screen, speed]);

  if (screen === 'mainMenu') {
    return <MainMenu onEnterGame={() => setScreen('dashboard')} />;
  }
  if (screen === 'pipeline') {
    return <Pipeline onBack={() => setScreen('dashboard')} />;
  }
  if (screen === 'learning') {
    return <LearningCenter onBack={() => setScreen('dashboard')} />;
  }
  return (
    <Dashboard
      speed={speed}
      onSpeedChange={setSpeed}
      onNavigate={setScreen}
      onExitToMenu={() => setScreen('mainMenu')}
    />
  );
}
