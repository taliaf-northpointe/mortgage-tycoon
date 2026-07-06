/**
 * Meadowbrook Region content (GDD §9). Static per-neighborhood data —
 * live status/leads/scouted state lives in GameState.neighborhoods.
 */

export interface NeighborhoodDef {
  id: string;
  name: string;
  description: string;
  homes: number;
  branchCost: number;
  reputationRequired: number;
}

export const NEIGHBORHOODS: NeighborhoodDef[] = [
  {
    id: 'oldTown',
    name: 'Old Town',
    description: 'Where it all started — brick storefronts, big oaks, and your very first desk.',
    homes: 120,
    branchCost: 0,
    reputationRequired: 0,
  },
  {
    id: 'sunnyHeights',
    name: 'Sunny Heights',
    description: 'Bright bungalows on a friendly hill. Everyone waves. Everyone wants a porch.',
    homes: 96,
    branchCost: 25_000,
    reputationRequired: 55,
  },
  {
    id: 'riversideVillage',
    name: 'Riverside Village',
    description: 'Cozy riverside community full of first-time buyers.',
    homes: 142,
    branchCost: 45_000,
    reputationRequired: 60,
  },
  {
    id: 'uptownHills',
    name: 'Uptown Hills',
    description: 'Larger homes, longer driveways, bigger loans — and pickier buyers.',
    homes: 88,
    branchCost: 65_000,
    reputationRequired: 70,
  },
  {
    id: 'eastRidge',
    name: 'East Ridge',
    description: 'Quiet streets and patient sellers. Cheap to enter, slow to bloom.',
    homes: 64,
    branchCost: 18_000,
    reputationRequired: 50,
  },
  {
    id: 'greenValley',
    name: 'Green Valley',
    description: 'The biggest neighborhood in the region — a whole valley of front doors.',
    homes: 210,
    branchCost: 80_000,
    reputationRequired: 75,
  },
];

export const NEIGHBORHOODS_BY_ID: Record<string, NeighborhoodDef> = Object.fromEntries(
  NEIGHBORHOODS.map((n) => [n.id, n]),
);
