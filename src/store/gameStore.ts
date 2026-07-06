/**
 * Zustand store (TDD §2): holds GameState, exposes actions + selectors.
 * The UI renders state and dispatches actions; it never computes game logic.
 */
import { create } from 'zustand';
import { DAY_END_HOUR } from '../engine/constants';
import { createStarterState } from '../engine/content/starter';
import { advanceDay, advanceHour } from '../engine/tick';
import type { GameState } from '../engine/types';
import { loadGame, saveGame, serializeSave } from './saveSystem';

interface GameStore {
  game: GameState | null;
  /** Create a fresh game with the player's chosen names, and autosave it. */
  newGame(playerName: string, officeName: string): void;
  /** Load the autosave. Returns false if there is none (or it's unreadable). */
  continueGame(): boolean;
  /** Replace the running game with an imported save (already parsed). */
  adoptImportedGame(state: GameState): void;
  /** Current game as pretty JSON for the export download, or null. */
  exportJson(): string | null;
  /**
   * One simulation step for the real-time loop: advance an hour, or roll to
   * the next morning once the working day is over (TDD §4).
   */
  tick(): void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,

  newGame(playerName, officeName) {
    const state = createStarterState((Date.now() ^ (Math.random() * 0xffffffff)) >>> 0);
    state.meta = {
      ...state.meta,
      playerName: playerName.trim() || 'You',
      officeName: officeName.trim() || 'My First Office',
      createdAt: new Date().toISOString(),
    };
    saveGame(state);
    set({ game: state });
  },

  continueGame() {
    const loaded = loadGame();
    if (!loaded) return false;
    set({ game: loaded });
    return true;
  },

  adoptImportedGame(state) {
    saveGame(state);
    set({ game: state });
  },

  exportJson() {
    const { game } = get();
    return game ? serializeSave(game) : null;
  },

  tick() {
    const { game } = get();
    if (!game) return;
    set({ game: game.clock.hour > DAY_END_HOUR ? advanceDay(game) : advanceHour(game) });
  },
}));

/** Autosave whenever the game state object changes (plus on tab hide, below). */
useGameStore.subscribe((state, prev) => {
  if (state.game && state.game !== prev.game) saveGame(state.game);
});

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      const { game } = useGameStore.getState();
      if (game) saveGame(game);
    }
  });
}
