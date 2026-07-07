/**
 * Shared helpers for Talia's borrower portrait art (public/assets/art).
 * Repeat leads reuse the original image untouched (no tinting — Talia's
 * call); only the name changes. Variety comes from adding more art.
 */

export function borrowerArtUrl(portraitId: number): string {
  return `${import.meta.env.BASE_URL}assets/art/borrower-${portraitId}.png`;
}

/** Every borrower has a matching dream-home illustration (House N ↔ Borrower N). */
export function houseArtUrl(portraitId: number): string {
  return `${import.meta.env.BASE_URL}assets/art/house-${portraitId}.png`;
}
