import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioManager, PLAYLIST, shuffledPlaylistCycle } from './AudioManager';

describe('AudioManager', () => {
  beforeEach(() => {
    // Headless test runs have no localStorage — provide a tiny in-memory one.
    if (typeof globalThis.localStorage === 'undefined') {
      const data = new Map<string, string>();
      vi.stubGlobal('localStorage', {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => void data.set(key, String(value)),
        removeItem: (key: string) => void data.delete(key),
        clear: () => data.clear(),
      });
    }
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('persists audio settings to local storage', () => {
    const manager = AudioManager.getInstance();

    manager.setSettings({ masterVolume: 0.35, musicVolume: 0.2, sfxVolume: 0.7, ambienceVolume: 0.6 });

    const saved = JSON.parse(localStorage.getItem('mortgage-empire.audio') ?? '{}');
    expect(saved.masterVolume).toBe(0.35);
    expect(saved.musicVolume).toBe(0.2);
    expect(saved.sfxVolume).toBe(0.7);
    expect(saved.ambienceVolume).toBe(0.6);
  });

  it('shuffles the playlist: every track once per cycle, no back-to-back repeats', () => {
    const manager = AudioManager.getInstance();
    expect(PLAYLIST).toHaveLength(6);

    // A full cycle plays each of the 6 tracks exactly once…
    const cycle = Array.from({ length: PLAYLIST.length }, () => manager.nextTrackIndex(0));
    expect([...cycle].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5]);
    // …and never opens with the track that just finished.
    expect(cycle[0]).not.toBe(0);

    // The next cycle also avoids echoing the last song played.
    const lastPlayed = cycle[PLAYLIST.length - 1] ?? 0;
    expect(manager.nextTrackIndex(lastPlayed)).not.toBe(lastPlayed);
  });

  it('shuffledPlaylistCycle is a permutation that respects the no-repeat rule', () => {
    // deterministic rng stub: cycles through fixed fractions
    const seq = [0.1, 0.9, 0.4, 0.7, 0.2, 0.6, 0.8, 0.3];
    let n = 0;
    const rng = () => seq[n++ % seq.length] ?? 0.5;

    for (let lastPlayed = 0; lastPlayed < 6; lastPlayed++) {
      const cycle = shuffledPlaylistCycle(6, lastPlayed, rng);
      expect([...cycle].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5]);
      expect(cycle[0]).not.toBe(lastPlayed);
    }

    // a single-track playlist can't avoid repeating itself — and shouldn't crash
    expect(shuffledPlaylistCycle(1, 0, rng)).toEqual([0]);
  });

  it('raises the dynamic intensity when the office gets busier', () => {
    const manager = AudioManager.getInstance();

    manager.updateDynamicState({ activeLoans: 2, hasCelebration: false });
    expect(manager.getState().dynamicIntensity).toBe('calm');

    manager.updateDynamicState({ activeLoans: 7, hasCelebration: false });
    expect(manager.getState().dynamicIntensity).toBe('rush');
  });

  it('marks scenes as needing ambience for office-like screens', () => {
    const manager = AudioManager.getInstance();

    expect(manager.shouldPlayAmbience('dashboard')).toBe(true);
    expect(manager.shouldPlayAmbience('customer')).toBe(false);
  });
});
