/**
 * Generates every audio asset the AudioManager references (M8 sound pass):
 * soft synth chimes for SFX, gentle 8-second chord-pad loops for music, and
 * filtered-noise ambience. Fully deterministic — rerun any time with:
 *
 *   node scripts/generate-audio.mjs
 *
 * 22.05 kHz mono 16-bit PCM keeps the whole set around 2 MB.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'assets', 'audio');
const SR = 22050;

/* ── WAV writer ────────────────────────────────────────────────────── */

function writeWav(relPath, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  const full = join(OUT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, buf);
  console.log(`wrote ${relPath} (${(buf.length / 1024).toFixed(0)} KB)`);
}

/* ── Synth helpers ─────────────────────────────────────────────────── */

const semitone = (root, st) => root * Math.pow(2, st / 12);

function lcg(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
}

/** Add a soft pad note (sine + faint octave) with a slow envelope. */
function padNote(out, freq, start, dur, gain) {
  const a = Math.min(0.9, dur * 0.35); // attack
  const r = Math.min(1.2, dur * 0.4); // release
  const s0 = Math.floor(start * SR);
  const sN = Math.min(out.length, Math.floor((start + dur) * SR));
  for (let i = s0; i < sN; i++) {
    const t = i / SR - start;
    const env = Math.min(1, t / a) * Math.min(1, (dur - t) / r);
    const ph = 2 * Math.PI * freq * (i / SR);
    out[i] += gain * env * (Math.sin(ph) + 0.35 * Math.sin(2 * ph) + 0.15 * Math.sin(3 * ph));
  }
}

/** Add a short plucky arpeggio note (triangle-ish, fast decay). */
function pluck(out, freq, start, dur, gain) {
  const s0 = Math.floor(start * SR);
  const sN = Math.min(out.length, Math.floor((start + dur) * SR));
  for (let i = s0; i < sN; i++) {
    const t = i / SR - start;
    const env = Math.exp(-t * 6) * Math.min(1, t / 0.008);
    const ph = 2 * Math.PI * freq * (i / SR);
    const tri = (2 / Math.PI) * Math.asin(Math.sin(ph));
    out[i] += gain * env * tri;
  }
}

/** One-pole lowpass + normalize + loop-friendly edge fade. */
function polish(samples, cutoff = 0.25, level = 0.55) {
  let y = 0;
  for (let i = 0; i < samples.length; i++) {
    y += cutoff * (samples[i] - y);
    samples[i] = y;
  }
  let peak = 0;
  for (const v of samples) peak = Math.max(peak, Math.abs(v));
  const norm = peak > 0 ? level / peak : 1;
  const fade = Math.floor(SR * 0.06);
  for (let i = 0; i < samples.length; i++) {
    let g = norm;
    if (i < fade) g *= i / fade;
    if (i >= samples.length - fade) g *= (samples.length - i) / fade;
    samples[i] *= g;
  }
  return samples;
}

/* ── Music loops ───────────────────────────────────────────────────── */

// Chord shapes in semitones above the root.
const MAJ7 = [0, 4, 7, 11];
const MAJ = [0, 4, 7];
const MIN7 = [0, 3, 7, 10];
const SUS = [0, 5, 7];
const ADD9 = [0, 4, 7, 14];

/** spec: root Hz, chords (each plays dur seconds), arp pattern, feel */
const MUSIC = {
  'music/main-menu.wav': { root: 220.0, chords: [MAJ7, [5, 9, 12], SUS, MAJ], arp: [0, 7, 12, 16], pace: 0.5 },
  'music/office-dashboard.wav': { root: 196.0, chords: [MAJ, ADD9, [5, 9, 12], MAJ7], arp: [0, 12, 7, 16], pace: 0.5 },
  'music/town-map.wav': { root: 246.9, chords: [SUS, MAJ, [2, 5, 9], MAJ7], arp: [0, 7, 12, 7], pace: 0.66 },
  'music/customer-screen.wav': { root: 174.6, chords: [MAJ7, MIN7, [5, 9, 12], MAJ], arp: [12, 16, 19, 16], pace: 1.0 },
  'music/loan-pipeline.wav': { root: 220.0, chords: [ADD9, [7, 11, 14], MAJ, SUS], arp: [0, 12, 16, 12], pace: 0.4 },
  'music/upgrade-screen.wav': { root: 261.6, chords: [MAJ, [5, 9, 12], ADD9, MAJ7], arp: [12, 16, 19, 24], pace: 0.5 },
  'music/daily-summary.wav': { root: 164.8, chords: [MAJ7, [5, 9, 12], MIN7, MAJ], arp: [12, 19, 16, 12], pace: 1.0 },
  'music/tutorial.wav': { root: 233.1, chords: [MAJ, SUS, MAJ7, ADD9], arp: [0, 7, 12, 16], pace: 0.66 },
  'music/celebration.wav': { root: 261.6, chords: [MAJ, [5, 9, 12, 17], [7, 11, 14], [12, 16, 19]], arp: [12, 16, 19, 24], pace: 0.25 },
  'music/expansion.wav': { root: 196.0, chords: [ADD9, MAJ7, [5, 9, 12, 16], [7, 11, 14]], arp: [0, 12, 16, 19], pace: 0.33 },
};

function renderMusic(spec, seconds = 8) {
  const out = new Float32Array(SR * seconds);
  const chordDur = seconds / spec.chords.length;
  spec.chords.forEach((chord, ci) => {
    const start = ci * chordDur;
    for (const st of chord) {
      padNote(out, semitone(spec.root, st), start, chordDur + 0.4, 0.16);
      padNote(out, semitone(spec.root / 2, chord[0]), start, chordDur + 0.4, 0.1); // bass
    }
    // arpeggio sparkle
    let t = start;
    let k = 0;
    while (t < start + chordDur - 0.05) {
      const st = spec.arp[k % spec.arp.length];
      pluck(out, semitone(spec.root * 2, st), t, 0.5, 0.08);
      t += spec.pace;
      k += 1;
    }
  });
  return polish(out, 0.22, 0.5);
}

/* ── SFX ───────────────────────────────────────────────────────────── */

function renderUiClick() {
  const out = new Float32Array(Math.floor(SR * 0.1));
  pluck(out, 523, 0, 0.1, 0.8);
  pluck(out, 659, 0.015, 0.08, 0.4);
  return polish(out, 0.5, 0.5);
}

function renderEventChime() {
  const out = new Float32Array(Math.floor(SR * 0.45));
  pluck(out, 659, 0, 0.3, 0.7);
  pluck(out, 880, 0.12, 0.33, 0.6);
  return polish(out, 0.5, 0.5);
}

/* ── Ambience ──────────────────────────────────────────────────────── */

function renderAmbience(seed, brightness, lfoHz, seconds = 8) {
  const noise = lcg(seed);
  const out = new Float32Array(SR * seconds);
  let brown = 0;
  for (let i = 0; i < out.length; i++) {
    brown += noise() * 0.02;
    brown *= 0.997; // keep it bounded
    const lfo = 0.75 + 0.25 * Math.sin(2 * Math.PI * lfoHz * (i / SR));
    out[i] = brown * lfo;
  }
  return polish(out, brightness, 0.18);
}

/* ── Generate everything ───────────────────────────────────────────── */

for (const [path, spec] of Object.entries(MUSIC)) writeWav(path, renderMusic(spec));
writeWav('ui/placeholder.wav', renderUiClick());
writeWav('events/placeholder.wav', renderEventChime());
writeWav('ambience/office.wav', renderAmbience(42, 0.08, 0.05));
writeWav('ambience/town.wav', renderAmbience(7, 0.15, 0.08));

console.log('done — cozy sounds ready 🎵');
