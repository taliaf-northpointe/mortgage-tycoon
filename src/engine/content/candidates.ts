/**
 * Hire-pool candidate generation (GDD §5: "new candidates with randomized
 * skill/salary"). Deterministic for a given seed — the UI picks the seed.
 * Each pool name has a fixed gender (see characterSprites.ts) so portraits
 * always match.
 */
import { genderForName, spritesForGender } from './characterSprites';
import { SALARY_RANGE_BY_ROLE } from '../constants';
import type { HireCandidate } from '../employees';
import { mulberry32 } from '../rng';
import type { Role } from '../types';

export const CANDIDATE_NAMES = [
  'Avery Brooks',
  'Jordan Patel',
  'Casey Nguyen',
  'Riley Thompson',
  'Morgan Alvarez',
  'Quinn Fischer',
  'Harper Osei',
  'Rowan Kim',
  'Sydney Larsson',
  'Emerson Cole',
  'Jamie Okada',
  'Alexis Romero',
  'Taylor Singh',
  'Devon Marsh',
  'Skyler Anand',
  'Reese Delgado',
  'Ainsley Rhodes',
  'Callum Frost',
  'Della Winters',
  'Ezra Caldwell',
  'Fern Whitley',
  'Hollis Grant',
  'Juniper Lane',
  'Kendall Ford',
  'Lorenzo Ricci',
  'Maren Voss',
  'Nate Sterling',
  'Opal Hendricks',
  'Percy Malone',
  'Romy Fielder',
  'Stefan Brandt',
  'Tilda Moreau',
];

/** One cozy line per candidate — their profile in the hire modal (2026-07-08). */
export const CANDIDATE_ABOUT: Record<string, string> = {
  'Avery Brooks': 'Color-codes everything and remembers everyone’s birthday.',
  'Jordan Patel': 'Calm on deadline day; keeps a bonsai on the desk.',
  'Casey Nguyen': 'Reads contracts like novels and finds the plot holes.',
  'Riley Thompson': 'First one in, playlist already humming.',
  'Morgan Alvarez': 'Once closed three files during a fire drill.',
  'Quinn Fischer': 'Speaks fluent spreadsheet and decent guitar.',
  'Harper Osei': 'Keeps the candy jar that unites the whole floor.',
  'Rowan Kim': 'Quiet until the numbers get interesting.',
  'Sydney Larsson': 'Marathon runner; treats backlogs the same way.',
  'Emerson Cole': 'Learned the business at a kitchen-table brokerage.',
  'Jamie Okada': 'Writes thank-you sticky notes nobody asked for.',
  'Alexis Romero': 'Can explain escrow to anyone, including toddlers.',
  'Taylor Singh': 'Brings homemade chai on rainy Mondays.',
  'Devon Marsh': 'Ex-teacher; grades files with a red pen, kindly.',
  'Skyler Anand': 'Names every office plant and waters them all.',
  'Reese Delgado': 'Whistles while filing. Somehow not annoying.',
  'Ainsley Rhodes': 'Sharp-eyed, soft-spoken, always two steps ahead.',
  'Callum Frost': 'Keeps winter photos on the desk to stay cool-headed.',
  'Della Winters': 'Former barista; now pulls perfect closing dates.',
  'Ezra Caldwell': 'Chess-club patience with a courier’s pace.',
  'Fern Whitley': 'Gardens on weekends; grows pipelines on weekdays.',
  'Hollis Grant': 'Old-school notebook, new-school results.',
  'Juniper Lane': 'Sunniest desk in the office, by choice and by nature.',
  'Kendall Ford': 'Former debate captain; wins with kindness.',
  'Lorenzo Ricci': 'Makes espresso for the whole row at 3 PM sharp.',
  'Maren Voss': 'Sails on Sundays; navigates paperwork the same way.',
  'Nate Sterling': 'The calm voice customers ask for by name.',
  'Opal Hendricks': 'Knits during webinars; retains every word.',
  'Percy Malone': 'Collects vintage calculators. Uses none of them.',
  'Romy Fielder': 'Photographs every office birthday. Frames the best.',
  'Stefan Brandt': 'Builds model houses; helps people buy real ones.',
  'Tilda Moreau': 'Hums jazz while reconciling anything.',
};

/**
 * Three candidates for a role. Higher skill costs more, sensibly. Names
 * already on the team never show up again (playtest 2026-07-07 — two Avery
 * Brookses in one office is one too many).
 */
export function generateCandidates(
  seed: number,
  role: Role,
  takenNames: readonly string[] = [],
): HireCandidate[] {
  const rng = mulberry32(seed >>> 0);
  const range = SALARY_RANGE_BY_ROLE[role];
  const taken = new Set(takenNames);
  const pool = CANDIDATE_NAMES.filter((n) => !taken.has(n));
  // A 32-name pool should never run dry; if it somehow does, repeats beat a hang.
  const names = pool.length >= 3 ? pool : CANDIDATE_NAMES;
  const usedNames = new Set<string>();

  return Array.from({ length: 3 }, () => {
    let name = rng.pick(names);
    while (usedNames.has(name)) name = rng.pick(names);
    usedNames.add(name);

    const gender = genderForName(name);
    const pool = spritesForGender(gender);
    const spriteId = pool[rng.int(0, pool.length - 1)] ?? 3;

    const skill = Math.round((1.5 + rng.next() * 2.5) * 4) / 4; // 1.5–4.0 in quarter steps
    const skillShare = (skill - 1.5) / 2.5;
    const salaryMonthly =
      Math.round((range.min + (range.max - range.min) * (0.3 + 0.7 * skillShare)) / 50) * 50;

    return { name, gender, role, skill, salaryMonthly, spriteId, about: CANDIDATE_ABOUT[name] };
  });
}
