/**
 * ALL tunable numbers and shared literals live here, nowhere else (TDD §3).
 * Every constant references the GDD/TDD section it comes from.
 */

/** GDD §1 */
export const GAME_TITLE = 'Mortgage Empire';
export const TAGLINE = 'Build your neighborhood. Own the block.';

/** TDD §5 — localStorage save key */
export const SAVE_KEY = 'mortgage-empire:save:v1';

/** TDD §4 — the working day runs 9 AM → 6 PM, 10 ticks/day */
export const DAY_START_HOUR = 9;
export const DAY_END_HOUR = 18;
export const TICKS_PER_DAY = 10;
