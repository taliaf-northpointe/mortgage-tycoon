/** Shared display formatting for money and names. */

export function moneyFull(n: number): string {
  return `$${n.toLocaleString('en-US')}`;
}

/** Loan-card style compact money: $220K, $1.2M */
export function moneyCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
