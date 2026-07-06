/**
 * Save migrations (TDD §5): any change to the GameState shape requires a
 * migration entry in the same PR. Keyed by the saveVersion being upgraded
 * FROM; each migration returns data at saveVersion + 1.
 */

export const CURRENT_SAVE_VERSION = 1;

type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

/** No migrations yet — v1 is the first shipped save format. */
export const MIGRATIONS: Record<number, Migration> = {};

export function applyMigrations(data: Record<string, unknown>): Record<string, unknown> {
  let current = data;
  let version = readVersion(current);
  while (version < CURRENT_SAVE_VERSION) {
    const migrate = MIGRATIONS[version];
    if (!migrate) {
      throw new Error(`This save is from version ${version} and we don't know how to update it.`);
    }
    current = migrate(current);
    version = readVersion(current);
  }
  return current;
}

function readVersion(data: Record<string, unknown>): number {
  const meta = data['meta'];
  if (meta && typeof meta === 'object' && 'saveVersion' in meta) {
    const v = (meta as Record<string, unknown>)['saveVersion'];
    if (typeof v === 'number') return v;
  }
  return Number.NaN;
}
