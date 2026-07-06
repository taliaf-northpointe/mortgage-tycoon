/**
 * World Map actions (GDD §9): scouting and branch expansion.
 * Pure: same-reference refusal when an action isn't allowed.
 */
import { MAP_SCREEN_LEVEL, SCOUTING_COST } from './constants';
import { NEIGHBORHOODS_BY_ID } from './content/neighborhoods';
import type { GameEvent, GameState } from './types';

function pushEvent(state: GameState, category: GameEvent['category'], title: string, detail: string): void {
  const { day, hour } = state.clock;
  const n = state.eventLog.length;
  state.eventLog.push({ id: `evt-${day}-${hour}-${n}`, day, hour, category, title, detail });
}

export function branchCount(state: GameState): number {
  return Object.values(state.neighborhoods).filter((n) => n.status === 'branch').length;
}

/** Send scouts (GDD §9): a small fee reveals the hidden stats. */
export function scoutNeighborhood(state: GameState, id: string): GameState {
  const hood = state.neighborhoods[id];
  const def = NEIGHBORHOODS_BY_ID[id];
  if (!hood || !def || hood.scouted) return state;
  if (state.currencies.coins < SCOUTING_COST) return state;

  const s = structuredClone(state);
  const h = s.neighborhoods[id];
  if (!h) return state;
  s.currencies.coins -= SCOUTING_COST;
  h.scouted = true;
  pushEvent(
    s,
    'customers',
    `Scouts are back from ${def.name}`,
    `${def.homes} homes and ${h.leads} warm leads out there. ${def.description}`,
  );
  return s;
}

/** Why a branch can't open here right now, or null if it can. */
export function branchBlockedReason(state: GameState, id: string): string | null {
  const hood = state.neighborhoods[id];
  const def = NEIGHBORHOODS_BY_ID[id];
  if (!hood || !def) return 'Unknown neighborhood.';
  if (hood.status === 'mainOffice') return 'Home sweet headquarters.';
  if (hood.status === 'branch') return 'Already open!';
  if (state.stats.level < MAP_SCREEN_LEVEL) return `Reach Level ${MAP_SCREEN_LEVEL} (CEO) first.`;
  if (state.stats.reputation < def.reputationRequired)
    return `Needs ${def.reputationRequired} reputation (you have ${state.stats.reputation}).`;
  if (hood.status === 'locked') return 'Grow your reputation to unlock this neighborhood.';
  if (state.currencies.coins < def.branchCost) return 'Not enough coins yet.';
  return null;
}

/** Open Branch Office (GDD §9). */
export function openBranch(state: GameState, id: string): GameState {
  if (branchBlockedReason(state, id)) return state;
  const def = NEIGHBORHOODS_BY_ID[id];
  if (!def) return state;

  const s = structuredClone(state);
  const h = s.neighborhoods[id];
  if (!h) return state;
  s.currencies.coins -= def.branchCost;
  h.status = 'branch';
  h.scouted = true;
  pushEvent(
    s,
    'loans',
    `🎊 New branch open in ${def.name}!`,
    `${def.description} Local leads will start finding you.`,
  );
  return s;
}

/** Locked neighborhoods become available as reputation grows (checked daily). */
export function refreshNeighborhoodAvailability(state: GameState): void {
  for (const [id, hood] of Object.entries(state.neighborhoods)) {
    const def = NEIGHBORHOODS_BY_ID[id];
    if (!def) continue;
    if (hood.status === 'locked' && state.stats.reputation >= def.reputationRequired) {
      hood.status = 'available';
      pushEvent(
        state,
        'customers',
        `${def.name} noticed you`,
        'Your reputation opened a new neighborhood — take a look at the map!',
      );
    }
  }
}
