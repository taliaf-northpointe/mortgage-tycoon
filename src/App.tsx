import { useState } from 'react';
import { Dashboard } from './ui/screens/Dashboard/Dashboard';
import { MainMenu } from './ui/screens/MainMenu/MainMenu';

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
  const [screen, setScreen] = useState<ScreenId>('mainMenu');

  if (screen === 'mainMenu') {
    return <MainMenu onEnterGame={() => setScreen('dashboard')} />;
  }
  return <Dashboard onExitToMenu={() => setScreen('mainMenu')} />;
}
