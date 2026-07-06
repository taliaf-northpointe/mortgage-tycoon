/**
 * Achievement/badge definitions (GDD §10 launch set). Data only —
 * award logic lives in engine/economy.ts.
 */

export interface AchievementDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'dealStreak', name: 'Deal Streak', emoji: '🔥', description: 'Close 3 loans in a single hour.' },
  { id: 'happyCustomer', name: 'Happy Customer', emoji: '😄', description: 'Close a loan for a customer at 95%+ happiness.' },
  { id: 'teamBuilder', name: 'Team Builder', emoji: '🤝', description: 'Hire a new employee.' },
  { id: 'rainmaker', name: 'Rainmaker', emoji: '💰', description: 'Earn $50,000 in a single day.' },
  { id: 'scout', name: 'Scout', emoji: '🔭', description: 'Welcome your first brand-new lead.' },
];

export const ACHIEVEMENTS_BY_ID: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);
