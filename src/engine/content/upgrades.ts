/**
 * The 25-upgrade tree (GDD §7): 5 categories × 5 tiers. Data only.
 * Effect rates live in constants.ts; benefit chips describe them.
 */

export type UpgradeCategory = 'office' | 'training' | 'marketing' | 'technology' | 'customerExperience';

export interface UpgradeDef {
  id: string;
  category: UpgradeCategory;
  tier: 1 | 2 | 3 | 4 | 5;
  name: string;
  flavor: string;
  cost: number;
  benefits: string[];
}

export const CATEGORY_META: Record<UpgradeCategory, { label: string; theme: string }> = {
  office: { label: 'Office Improvements', theme: 'Make your workspace cozy' },
  training: { label: 'Staff Training', theme: 'Level up your team' },
  marketing: { label: 'Marketing', theme: 'Attract new customers' },
  technology: { label: 'Technology', theme: 'Modernize the office' },
  customerExperience: { label: 'Customer Experience', theme: 'Delight your clients' },
};

export const UPGRADES: UpgradeDef[] = [
  // Office Improvements — employee happiness & productivity
  { id: 'cozyChairs', category: 'office', tier: 1, name: 'Cozy Chairs', flavor: 'Happy backs, happy team.', cost: 400, benefits: ['+ daily team morale'] },
  { id: 'betterLighting', category: 'office', tier: 2, name: 'Better Lighting', flavor: 'Warm light, warmer moods.', cost: 800, benefits: ['+ daily team morale'] },
  { id: 'coffeeMachine', category: 'office', tier: 3, name: 'Coffee Machine', flavor: 'The heartbeat of every office.', cost: 1_200, benefits: ['+ daily team morale'] },
  { id: 'cornerOffice', category: 'office', tier: 4, name: 'Corner Office', flavor: 'Somewhere to dream big.', cost: 3_500, benefits: ['+ daily team morale'] },
  { id: 'executiveSuite', category: 'office', tier: 5, name: 'Executive Suite', flavor: 'The whole floor smells like success.', cost: 12_000, benefits: ['+ daily team morale'] },

  // Staff Training — skill growth rate & caps
  { id: 'basicSkills', category: 'training', tier: 1, name: 'Basic Skills', flavor: 'Everyone starts somewhere.', cost: 500, benefits: ['+20% training gains', '+0.1 skill cap'] },
  { id: 'advancedTraining', category: 'training', tier: 2, name: 'Advanced Training', flavor: 'Sharper tools, sharper minds.', cost: 1_200, benefits: ['+20% training gains', '+0.1 skill cap'] },
  { id: 'leadership', category: 'training', tier: 3, name: 'Leadership', flavor: 'Grow the people who grow people.', cost: 1_800, benefits: ['+20% training gains', '+0.1 skill cap'] },
  { id: 'specialization', category: 'training', tier: 4, name: 'Specialization', flavor: 'Deep expertise pays off.', cost: 2_400, benefits: ['+20% training gains', '+0.1 skill cap'] },
  { id: 'masterClass', category: 'training', tier: 5, name: 'Master Class', flavor: 'Learn from the best in the business.', cost: 6_800, benefits: ['+20% training gains', '+0.1 skill cap'] },

  // Marketing — lead volume & reputation
  { id: 'flyers', category: 'marketing', tier: 1, name: 'Flyers', flavor: 'Old school. Still works.', cost: 500, benefits: ['+5% new leads', '+2 reputation'] },
  { id: 'localAds', category: 'marketing', tier: 2, name: 'Local Ads', flavor: 'Your name on every bench.', cost: 1_600, benefits: ['+5% new leads', '+2 reputation'] },
  { id: 'socialMedia', category: 'marketing', tier: 3, name: 'Social Media', flavor: 'Cozy content, real engagement.', cost: 2_200, benefits: ['+5% new leads', '+2 reputation'] },
  { id: 'tvSpots', category: 'marketing', tier: 4, name: 'TV Spots', flavor: 'Prime time, prime leads.', cost: 5_400, benefits: ['+5% new leads', '+2 reputation'] },
  { id: 'brandVoice', category: 'marketing', tier: 5, name: 'Brand Voice', flavor: 'Everyone knows your jingle.', cost: 9_000, benefits: ['+5% new leads', '+2 reputation'] },

  // Technology — stage processing speed
  { id: 'modernPCs', category: 'technology', tier: 1, name: 'Modern PCs', flavor: 'No more loading spinners.', cost: 900, benefits: ['+5% processing speed'] },
  { id: 'fastInternet', category: 'technology', tier: 2, name: 'Fast Internet', flavor: 'Documents fly, not crawl.', cost: 1_800, benefits: ['+5% processing speed'] },
  { id: 'crmSystem', category: 'technology', tier: 3, name: 'CRM System', flavor: 'Every customer, one tidy view.', cost: 3_200, benefits: ['+5% processing speed'] },
  { id: 'aiAssistant', category: 'technology', tier: 4, name: 'AI Assistant', flavor: 'It drafts, you decide.', cost: 7_500, benefits: ['+5% processing speed'] },
  { id: 'autoApprovals', category: 'technology', tier: 5, name: 'Auto Approvals', flavor: 'Clean files sail through.', cost: 14_000, benefits: ['+5% processing speed'] },

  // Customer Experience — customer happiness & trust gain
  { id: 'welcomeKit', category: 'customerExperience', tier: 1, name: 'Welcome Kit', flavor: 'A warm hello in a box.', cost: 700, benefits: ['+ trust from Contact'] },
  { id: 'coffeeBar', category: 'customerExperience', tier: 2, name: 'Coffee Bar', flavor: 'Meetings taste better here.', cost: 1_800, benefits: ['+ trust from Contact', '+ happiness on milestones'] },
  { id: 'concierge', category: 'customerExperience', tier: 3, name: 'Concierge', flavor: 'Someone always picks up.', cost: 4_200, benefits: ['+ trust from Contact'] },
  { id: 'priorityLine', category: 'customerExperience', tier: 4, name: 'Priority Line', flavor: 'No hold music, ever.', cost: 6_500, benefits: ['+ trust from Contact', '+ happiness on milestones'] },
  { id: 'vipLounge', category: 'customerExperience', tier: 5, name: 'VIP Lounge', flavor: 'Slippers, cocoa, closing papers.', cost: 11_000, benefits: ['+ trust from Contact'] },
];

export const UPGRADES_BY_ID: Record<string, UpgradeDef> = Object.fromEntries(
  UPGRADES.map((u) => [u.id, u]),
);

export const CATEGORIES: UpgradeCategory[] = ['office', 'training', 'marketing', 'technology', 'customerExperience'];
