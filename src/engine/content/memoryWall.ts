/**
 * The Wall of Homes (v11) — Talia's favorite feature: every funded loan adds
 * a scrapbook page with the family, their home, and a thank-you note. Notes
 * are keyed to the borrower portrait so each persona sounds like themselves,
 * and stay name-neutral so repeat leads (alternate names) read naturally.
 */
import type { Customer, GameState, Loan, MemoryEntry } from '../types';

/** One voice per portrait (borrower-N.png). 1 = Sarah Chen, the tutorial customer. */
const THANK_YOU_BY_PORTRAIT: Record<number, string> = {
  1: 'We did it! The bungalow is home now — my golden retriever approved the yard in about four seconds. Thank you for guiding me through every single step. 🏡',
  2: 'The morning light in my new studio is everything I hoped for. Thank you for making a first-timer feel like a pro.',
  3: 'Locked up, headed to the airport, and not a lawn to mow in sight. Impeccable work — exactly as I expected.',
  4: 'First night in the condo: pizza on a moving box, keys on the counter. Could not have done this without you!',
  5: 'The fence went up last weekend and our little one finally naps in a room of his own. Thank you from all three of us!',
  6: 'The cat claimed the sunny window within five minutes. We claim the rest. Thank you — truly.',
  7: 'The garden is planted and the kettle is on. You made this feel so gentle. Thank you, dear.',
  8: "Row 47 of our spreadsheet said 'send thank-you note.' Done — and we mean every word of it.",
  9: 'Fifteen minutes door-to-door from the hospital. After a night shift, that is everything. Thank you!',
  10: 'Keys in hand before the quarter closed, exactly as requested. I have already recommended you twice.',
  11: 'Coffee on my own front porch every morning, just like I pictured it. Thank you for honoring my service.',
  12: 'The lower payment goes straight into the college fund now. You made a real difference for our kids.',
  13: 'The view is worth every box we packed. Thanks for keeping pace with us — we never waited on you once.',
  14: 'The corgi has thoroughly inspected and approved the backyard. So do we. Thank you for everything!',
  15: 'After fifty years in this house, the new payment feels like a gift. Thank you for taking such gentle care of us.',
  16: 'Everyone has their own room now and the peace treaty is holding. Thank you from all four of us!',
  17: 'The bearded dragon claimed the warmest windowsill in town, and we claimed our first home. Thank you for believing in us!',
};

/**
 * The shared note pool: fallbacks for customers from before the portrait era,
 * AND fresh voices for repeat portraits — a note never appears on the wall
 * twice (playtest 2026-07-07: same face, new family, new words).
 */
const GENERIC_THANK_YOUS: string[] = [
  'We still can’t believe the keys are ours. Thank you for making it feel easy!',
  'You turned a mountain of paperwork into a housewarming party. Thank you!',
  'Every question answered, every step explained. We tell everyone about you.',
  'Home at last — and it feels even better than we dreamed. Thank you so much!',
  'The first dinner in our own kitchen tasted better than any restaurant. Thank you!',
  'We measured every wall twice and the couch still barely fit — but it’s OUR doorway now. Thank you!',
  'The neighbors brought pie. The house brought peace. You brought both within reach.',
  'Our first mortgage payment came with a smile, believe it or not. Thank you for everything.',
  'The kids picked their rooms before we finished unloading the truck. Home, instantly. Thank you!',
  'We planted a tree the day we moved in. It grows, we stay. Thank you for the roots.',
  'Every box is unpacked and not one regret in any of them. You made this simple.',
  'The porch light was on for us our very first night. It will be on for you always.',
  'We hosted the holidays two weeks after closing. Everyone asked who our lender was.',
  'Rain on our own roof sounds different — better. Thank you for getting us here.',
  'From the first hello to the last signature, we always knew what came next. Thank you!',
  'We finally hung the pictures we carried through four apartments. They’re staying put. So are we.',
];

function seedNumber(seed: string): number {
  let n = 0;
  for (const ch of seed) n = (n * 31 + ch.charCodeAt(0)) >>> 0;
  return n;
}

/**
 * A thank-you note for this family. The portrait-keyed note is used the first
 * time that face appears on the wall; repeats (and portrait-less customers)
 * draw an unused note from the shared pool, so no two pages ever match.
 */
export function thankYouNote(
  customer: Pick<Customer, 'portraitId' | 'portraitSeed'> & { name?: string },
  usedNotes: ReadonlySet<string> = new Set(),
): string {
  const preferred = customer.portraitId ? THANK_YOU_BY_PORTRAIT[customer.portraitId] : undefined;
  if (preferred && !usedNotes.has(preferred)) return preferred;

  const start = seedNumber(customer.portraitSeed) % GENERIC_THANK_YOUS.length;
  for (let i = 0; i < GENERIC_THANK_YOUS.length; i++) {
    const note = GENERIC_THANK_YOUS[(start + i) % GENERIC_THANK_YOUS.length];
    if (note && !usedNotes.has(note)) return note;
  }
  // A very full wall: the family name keeps even this fallback one-of-a-kind.
  return `The keys are ours and the kettle is on — come by any time! — ${customer.name ?? 'Your newest neighbors'}`;
}

/** Build the scrapbook page for a loan that just funded. */
export function buildMemoryEntry(state: GameState, loan: Loan, customer: Customer): MemoryEntry {
  const usedNotes = new Set(state.memoryWall.map((page) => page.note));
  return {
    loanId: loan.id,
    customerName: customer.name,
    portraitId: customer.portraitId ?? null,
    portraitSeed: customer.portraitSeed,
    houseName: customer.dreamHome.name,
    neighborhoodId: customer.dreamHome.neighborhoodId,
    product: loan.product,
    purpose: loan.purpose,
    amount: loan.amount,
    closingDay: state.clock.day,
    season: state.clock.season,
    houseId: customer.houseId ?? customer.portraitId ?? null,
    note: thankYouNote(customer, usedNotes),
  };
}
