import { beforeEach, describe, expect, it } from 'vitest';
import { DAY_START_HOUR, TICKS_PER_DAY } from '../../src/engine/constants';
import { useGameStore } from '../../src/store/gameStore';

beforeEach(() => {
  useGameStore.setState({ game: null });
});

describe('gameStore', () => {
  it('newGame stamps the chosen names', () => {
    useGameStore.getState().newGame('  Talia ', 'Sunny Corner Lending');
    const game = useGameStore.getState().game;
    expect(game?.meta.playerName).toBe('Talia');
    expect(game?.meta.officeName).toBe('Sunny Corner Lending');
    expect(game?.clock.day).toBe(1);
  });

  it('newGame falls back to friendly defaults for empty names', () => {
    useGameStore.getState().newGame('   ', '');
    const game = useGameStore.getState().game;
    expect(game?.meta.playerName).toBe('You');
    expect(game?.meta.officeName).toBe('My First Office');
  });

  it('tick advances one hour and rolls to the next morning after the last one', () => {
    useGameStore.getState().newGame('Talia', 'Northpointe');
    const store = useGameStore.getState();

    store.tick();
    expect(useGameStore.getState().game?.clock.hour).toBe(DAY_START_HOUR + 1);

    // finish the working day (hour climbs past 6 PM)…
    for (let i = 1; i < TICKS_PER_DAY; i++) useGameStore.getState().tick();
    expect(useGameStore.getState().game?.clock.day).toBe(1);

    // …and the next tick rolls the calendar
    useGameStore.getState().tick();
    const game = useGameStore.getState().game;
    expect(game?.clock.day).toBe(2);
    expect(game?.clock.hour).toBe(DAY_START_HOUR);
    expect(game?.dayHistory).toHaveLength(1);
  });

  it('continueGame restores what newGame saved', () => {
    useGameStore.getState().newGame('Talia', 'Northpointe');
    const saved = useGameStore.getState().game;
    useGameStore.setState({ game: null });

    expect(useGameStore.getState().continueGame()).toBe(true);
    expect(useGameStore.getState().game).toEqual(saved);
  });
});
