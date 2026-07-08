/**
 * The Wall of Homes (v11) — Talia's favorite feature: every funded loan adds
 * a scrapbook page with the family, their home, and a thank-you note. Notes
 * are keyed to the borrower portrait so each persona sounds like themselves,
 * and stay name-neutral so repeat leads (alternate names) read naturally.
 */
import { PORTRAIT_KIND } from './leads';
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
  18: 'The trail starts right off our porch and the husky has already claimed the yard. Muddy paws forever — thank you!',
  19: 'The terrariums have their own warm den and the board-game shelf is up. Thank you for taking us exactly as we are!',
  20: 'Coffee on the veranda, the fairway glowing at sunset — precisely as pictured. Superb work, truly.',
  21: 'There is a studio where the morning light lands, and it is mine. The garden is already on canvas. Thank you!',
  22: 'Thirty years of taste deserved a proper address, and you delivered flawlessly. We expected no less.',
  23: 'First in my family to own a place. I hung my guitar on the wall that same night. Thank you — really.',
};

/**
 * Grammatical voice of a note: 'we' fits couples and families, 'i' fits a
 * single buyer, 'any' fits everyone (playtest 2026-07-08 — a solo homeowner
 * should never sign a note that says "we").
 */
type NoteVoice = 'we' | 'i' | 'any';

/**
 * The shared note pool: fallbacks for customers from before the portrait era,
 * AND fresh voices for repeat portraits — a note never appears on the wall
 * twice (playtest 2026-07-07: same face, new family, new words).
 */
const SHARED_NOTES: { text: string; voice: NoteVoice }[] = [
  { text: 'We still can’t believe the keys are ours. Thank you for making it feel easy!', voice: 'we' },
  { text: 'You turned a mountain of paperwork into a housewarming party. Thank you!', voice: 'any' },
  { text: 'Every question answered, every step explained. We tell everyone about you.', voice: 'we' },
  { text: 'Home at last — and it feels even better than we dreamed. Thank you so much!', voice: 'we' },
  { text: 'The first dinner in our own kitchen tasted better than any restaurant. Thank you!', voice: 'we' },
  { text: 'We measured every wall twice and the couch still barely fit — but it’s OUR doorway now. Thank you!', voice: 'we' },
  { text: 'The neighbors brought pie. The house brought peace. You brought both within reach.', voice: 'any' },
  { text: 'Our first mortgage payment came with a smile, believe it or not. Thank you for everything.', voice: 'we' },
  { text: 'The kids picked their rooms before we finished unloading the truck. Home, instantly. Thank you!', voice: 'we' },
  { text: 'We planted a tree the day we moved in. It grows, we stay. Thank you for the roots.', voice: 'we' },
  { text: 'Every box is unpacked and not one regret in any of them. You made this simple.', voice: 'any' },
  { text: 'The porch light was on for us our very first night. It will be on for you always.', voice: 'we' },
  { text: 'We hosted the holidays two weeks after closing. Everyone asked who our lender was.', voice: 'we' },
  { text: 'Rain on our own roof sounds different — better. Thank you for getting us here.', voice: 'we' },
  { text: 'From the first hello to the last signature, we always knew what came next. Thank you!', voice: 'we' },
  { text: 'We finally hung the pictures we carried through four apartments. They’re staying put. So are we.', voice: 'we' },
  { text: 'The spare key went to Grandma before the boxes were even open. That says everything.', voice: 'any' },
  { text: 'Our landlord days are over. The confetti from closing is still in the coat pocket.', voice: 'we' },
  { text: 'The dog figured out the yard before we figured out the light switches. Bliss.', voice: 'we' },
  { text: 'We painted the front door the exact yellow we always talked about. It looks like us.', voice: 'we' },
  { text: 'First snow on our own roof — we just stood in the driveway and grinned.', voice: 'we' },
  { text: 'The mortgage folder lives next to the cookbooks now. That feels right.', voice: 'any' },
  { text: 'Every nail hole is ours to make. We celebrated with a gallery wall.', voice: 'we' },
  { text: 'The garden gnome has a permanent address. So do we. Thank you!', voice: 'we' },
  { text: 'We can hear the birds instead of the upstairs neighbors. What a trade.', voice: 'we' },
  { text: 'Homeownership tastes like pancakes in a kitchen nobody else can claim.', voice: 'any' },
  { text: 'Our kid drew the house with all of us in front of it. It’s on the fridge — OUR fridge.', voice: 'we' },
  { text: 'The porch swing creaks in the best possible way. Come try it.', voice: 'any' },
  { text: 'We finally adopted the second cat. The house said there was room.', voice: 'we' },
  { text: 'The closing pen is framed in the hallway. We are not even ashamed.', voice: 'we' },
  { text: 'Twelve houseplants, one sunny bay window, zero regrets.', voice: 'any' },
  { text: 'The neighbors waved before we even parked the truck. We are home.', voice: 'we' },
  { text: 'We hosted book club the first Friday. Everyone asked for our lender’s number.', voice: 'we' },
  { text: 'The workbench in the garage has waited twenty years. It’s finally here.', voice: 'any' },
  { text: 'Our names on the mailbox took four minutes to install and made us cry.', voice: 'we' },
  { text: 'The bathtub fits a whole tired human. This is wealth.', voice: 'any' },
  { text: 'We counted: seventeen boxes of books, one reading nook. Perfect math.', voice: 'we' },
  { text: 'The driveway hockey net is UP and it is never coming down.', voice: 'any' },
  { text: 'Sunday mornings sound like our own coffee grinder now. Thank you for that.', voice: 'we' },
  { text: 'The keys still make us smile every time they jingle. Every single time.', voice: 'we' },
  { text: 'I signed my name and the whole room clapped. Still floating. Thank you!', voice: 'i' },
  { text: 'My key. My door. My quiet Sunday mornings. Thank you for all three.', voice: 'i' },
  { text: 'First night in, I ate takeout on the floor of MY living room. Five stars.', voice: 'i' },
  { text: 'I painted the bedroom at midnight just because nobody could tell me not to.', voice: 'i' },
  { text: 'My plants have a real windowsill now, and I have a real address. Thank you!', voice: 'i' },
  { text: 'Everyone said buying alone was impossible. You never once acted like it was.', voice: 'i' },
  { text: 'The mortgage is mine, the mess is mine, the peace is mine. Worth it.', voice: 'i' },
  { text: 'I hosted my first dinner party — six friends, one proud homeowner.', voice: 'i' },
  { text: 'I finally have a bathtub-and-book Saturday routine. This is the dream.', voice: 'i' },
  { text: 'One set of keys, zero roommates, infinite happiness. Thank you!', voice: 'i' },
  { text: 'I bought a ladder. Apparently that’s what homeowners do. I love it here.', voice: 'i' },
  { text: 'My grandmother’s quilt finally has a bedroom worthy of it. Thank you.', voice: 'i' },
];

/**
 * When even the shared pool runs dry (a gloriously full wall), notes are
 * built from these — the family name keeps each one unique, and the many
 * shapes keep neighbors from reading like photocopies (playtest 2026-07-08).
 */
const FALLBACK_TEMPLATES: { make: (name: string) => string; voice: NoteVoice }[] = [
  { make: (n) => `The house is everything you promised, and the welcome mat is out for you. — ${n}`, voice: 'any' },
  { make: (n) => `A note from ${n}: the boxes are unpacked, the hearts are full. Thank you.`, voice: 'we' },
  { make: (n) => `Love from the new place — dinner is on us whenever you visit. — ${n}`, voice: 'we' },
  { make: (n) => `Signed with joy and a brand-new address — ${n}.`, voice: 'any' },
  { make: (n) => `“Best decision we ever made.” — ${n}, writing from their own kitchen table.`, voice: 'we' },
  { make: (n) => `The porch light is on for you any evening. With thanks — ${n}`, voice: 'any' },
  { make: (n) => `No more measuring rooms — just living in them. Thank you! — ${n}`, voice: 'any' },
  { make: (n) => `From the first hello to keys in hand: grateful beyond words. — ${n}`, voice: 'any' },
  { make: (n) => `The house has already survived one epic housewarming. Thank you! — ${n}`, voice: 'any' },
  { make: (n) => `New address, same gratitude — every single day. — ${n}`, voice: 'any' },
  { make: (n) => `“Best decision I ever made.” — ${n}, with the front-door key on a brand-new ring.`, voice: 'i' },
  { make: (n) => `One person, one porch, one very good decision. — ${n}`, voice: 'i' },
  { make: (n) => `My own four walls at last — come see them soon. — ${n}`, voice: 'i' },
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

  // Voice: solo buyers write "I", households write "we", unknown (pre-portrait
  // customers) can use anything — a single homeowner never signs a "we" note.
  const kind = customer.portraitId ? PORTRAIT_KIND[customer.portraitId] : undefined;
  const fits = (voice: NoteVoice) =>
    voice === 'any' || (kind === undefined ? true : kind === 'f' || kind === 'm' ? voice === 'i' : voice === 'we');

  const pool = SHARED_NOTES.filter((n) => fits(n.voice));
  const start = seedNumber(customer.portraitSeed) % pool.length;
  for (let i = 0; i < pool.length; i++) {
    const note = pool[(start + i) % pool.length]?.text;
    if (note && !usedNotes.has(note)) return note;
  }

  // A very full wall: name-embedded templates — the name keeps each unique,
  // and the many shapes keep neighboring cards from rhyming.
  const name = customer.name ?? 'Your newest neighbors';
  const templates = FALLBACK_TEMPLATES.filter((t) => fits(t.voice));
  const templateStart = seedNumber(customer.portraitSeed) % templates.length;
  for (let i = 0; i < templates.length; i++) {
    const template = templates[(templateStart + i) % templates.length];
    const note = template ? template.make(name) : '';
    if (note && !usedNotes.has(note)) return note;
  }
  return `Home, sweet home — at last and forever. — ${name}`;
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
