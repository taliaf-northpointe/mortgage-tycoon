/**
 * Shared helpers for Talia's borrower portrait art (public/assets/art).
 * Repeat leads reuse a portrait with a gentle color shift — hair, outfit,
 * and skin tone move together — so returning faces read as new neighbors.
 */
import type { Customer } from '../engine/types';

const VARIANT_FILTERS = [
  '',
  'hue-rotate(28deg) saturate(1.12)',
  'hue-rotate(-32deg) brightness(1.04)',
  'hue-rotate(75deg) saturate(0.9) brightness(0.98)',
  'hue-rotate(-70deg) saturate(1.05)',
];

export function borrowerArtUrl(portraitId: number): string {
  return `${import.meta.env.BASE_URL}assets/art/borrower-${portraitId}.png`;
}

/** Every borrower has a matching dream-home illustration (House N ↔ Borrower N). */
export function houseArtUrl(portraitId: number): string {
  return `${import.meta.env.BASE_URL}assets/art/house-${portraitId}.png`;
}

export function portraitFilter(customer: Pick<Customer, 'portraitVariant'>): string | undefined {
  const filter = VARIANT_FILTERS[(customer.portraitVariant ?? 0) % VARIANT_FILTERS.length];
  return filter === '' ? undefined : filter;
}
