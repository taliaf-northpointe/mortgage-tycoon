/**
 * Processes Talia's generated art (repo root) into game-ready sprites in
 * public/assets/art/:
 *
 *   Office N.png        → office-room-N.png (resized backdrops — the office
 *                                            upgrade stages, bg kept)
 *   Desk.png / Desk N.png → desk-N.png      (bg + soft shadow stripped,
 *                                            trimmed; desk-1 comes from the
 *                                            original Desk.png)
 *   Character N.png     → char-N.png        (bg stripped, baked-in desk rows
 *                                            cropped away, trimmed)
 *   Borrower N.png      → borrower-N.png    (bg stripped, trimmed — full-body
 *                                            customer portraits, pets included)
 *   House N.png         → house-N.png       (full-scene dream-home art for the
 *                                            matching borrower; resized only)
 *
 * Rerun any time:  node scripts/process-art.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { PNG } = require('pngjs');

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'assets', 'art');
mkdirSync(OUT, { recursive: true });

function load(name) {
  return PNG.sync.read(readFileSync(join(ROOT, name)));
}

function save(name, png) {
  const buf = PNG.sync.write(png);
  writeFileSync(join(OUT, name), buf);
  console.log(`wrote ${name} (${png.width}×${png.height}, ${(buf.length / 1024).toFixed(0)} KB)`);
}

const idx = (png, x, y) => (png.width * y + x) << 2;

/** Flood-fill from the borders, clearing pixels close to the corner color. */
function stripBackground(png, tolerance = 34) {
  const { width, height, data } = png;
  const bg = [data[idx(png, 2, 2)], data[idx(png, 2, 2) + 1], data[idx(png, 2, 2) + 2]];
  const isBg = (i) =>
    Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) <
    tolerance * 3;

  const visited = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x++) stack.push([x, 0], [x, height - 1]);
  for (let y = 0; y < height; y++) stack.push([0, y], [width - 1, y]);

  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const flat = width * y + x;
    if (visited[flat]) continue;
    visited[flat] = 1;
    const i = flat << 2;
    if (!isBg(i)) continue;
    data[i + 3] = 0;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return png;
}

/** Crop away full-width content rows from the bottom (the baked-in desk). */
function cropDeskRows(png, widthRatio = 0.7) {
  const { width, height, data } = png;
  let cropAt = height;
  for (let y = height - 1; y > height * 0.4; y--) {
    let filled = 0;
    for (let x = 0; x < width; x++) if (data[idx(png, x, y) + 3] > 40) filled++;
    if (filled / width > widthRatio) cropAt = y;
    else if (cropAt < height && filled / width < widthRatio * 0.8) break;
  }
  if (cropAt >= height) return png;
  const out = new PNG({ width, height: cropAt });
  PNG.bitblt(png, out, 0, 0, width, cropAt, 0, 0);
  // soften the cut with a short alpha fade so shirts don't end in a hard line
  const fade = Math.min(26, cropAt);
  for (let y = cropAt - fade; y < cropAt; y++) {
    const g = (cropAt - y) / fade;
    for (let x = 0; x < width; x++) {
      const i = idx(out, x, y);
      out.data[i + 3] = Math.round(out.data[i + 3] * g);
    }
  }
  return out;
}

/**
 * Median content width across the top band of a bust — a robust "how wide is
 * this person's head" measure (hair included, stray wisps ignored).
 */
function headWidth(png) {
  const { width, height, data } = png;
  const widths = [];
  const bandEnd = Math.max(1, Math.floor(height * 0.45));
  for (let y = 0; y < bandEnd; y++) {
    let minX = -1;
    let maxX = -1;
    for (let x = 0; x < width; x++) {
      if (data[idx(png, x, y) + 3] > 40) {
        if (minX < 0) minX = x;
        maxX = x;
      }
    }
    if (maxX >= 0) widths.push(maxX - minX + 1);
  }
  if (widths.length === 0) return width;
  widths.sort((a, b) => a - b);
  return widths[Math.floor(widths.length / 2)];
}

/**
 * Normalize a bust sprite onto a uniform canvas (2026-07-08): every character
 * renders at the same size behind a desk regardless of how the source was
 * framed. Content anchors at the top (heads align) and centers horizontally;
 * anything past the canvas is cut with a soft alpha fade / centered crop.
 */
function normalizeBust(png, targetW = 300, targetH = 180) {
  const out = new PNG({ width: targetW, height: targetH });
  const copyW = Math.min(png.width, targetW);
  const copyH = Math.min(png.height, targetH);
  const srcX = Math.max(0, Math.floor((png.width - targetW) / 2));
  const dstX = Math.max(0, Math.floor((targetW - png.width) / 2));
  PNG.bitblt(png, out, srcX, 0, copyW, copyH, dstX, 0);
  if (png.height > targetH) {
    const fade = Math.min(26, targetH);
    for (let y = targetH - fade; y < targetH; y++) {
      const g = (targetH - y) / fade;
      for (let x = 0; x < targetW; x++) {
        const i = idx(out, x, y);
        out.data[i + 3] = Math.round(out.data[i + 3] * g);
      }
    }
  }
  return out;
}

/** Final head width every character is scaled to (of the 300px canvas). */
const TARGET_HEAD_WIDTH = 165;

/** Trim transparent margins. */
function trim(png, pad = 4) {
  const { width, height, data } = png;
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[idx(png, x, y) + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const out = new PNG({ width: maxX - minX + 1, height: maxY - minY + 1 });
  PNG.bitblt(png, out, minX, minY, out.width, out.height, 0, 0);
  return out;
}

/** Bilinear resize to a target width. */
function resize(png, targetW) {
  if (png.width <= targetW) return png;
  const scale = targetW / png.width;
  const targetH = Math.round(png.height * scale);
  const out = new PNG({ width: targetW, height: targetH });
  for (let y = 0; y < targetH; y++) {
    const sy = y / scale;
    const y0 = Math.floor(sy), y1 = Math.min(png.height - 1, y0 + 1), fy = sy - y0;
    for (let x = 0; x < targetW; x++) {
      const sx = x / scale;
      const x0 = Math.floor(sx), x1 = Math.min(png.width - 1, x0 + 1), fx = sx - x0;
      const o = idx(out, x, y);
      for (let c = 0; c < 4; c++) {
        const v =
          png.data[idx(png, x0, y0) + c] * (1 - fx) * (1 - fy) +
          png.data[idx(png, x1, y0) + c] * fx * (1 - fy) +
          png.data[idx(png, x0, y1) + c] * (1 - fx) * fy +
          png.data[idx(png, x1, y1) + c] * fx * fy;
        out.data[o + c] = Math.round(v);
      }
    }
  }
  return out;
}

/** Crop by fractions of width/height. */
function cropFraction(png, fx0, fy0, fx1, fy1) {
  const x0 = Math.round(png.width * fx0);
  const y0 = Math.round(png.height * fy0);
  const w = Math.round(png.width * (fx1 - fx0));
  const h = Math.round(png.height * (fy1 - fy0));
  const out = new PNG({ width: w, height: h });
  PNG.bitblt(png, out, x0, y0, w, h, 0, 0);
  return out;
}

/* ── Process everything ────────────────────────────────────────────── */

for (let n = 1; n <= 5; n++) {
  const src = `Office ${n}.png`;
  if (!existsSync(join(ROOT, src))) continue;
  save(`office-room-${n}.png`, resize(load(src), 1500));
}

for (let n = 1; n <= 5; n++) {
  const src = n === 1 ? 'Desk.png' : `Desk ${n}.png`;
  if (!existsSync(join(ROOT, src))) continue;
  // higher tolerance eats the soft drop shadow too
  save(`desk-${n}.png`, resize(trim(stripBackground(load(src), 46)), 460));
}

// 1, 2, and 8 are retired from the office cast (Talia's call, 2026-07-06)
const RETIRED_CHARACTERS = new Set([1, 2, 8]);
for (let n = 1; n <= 30; n++) {
  const src = `Character ${n}.png`;
  if (RETIRED_CHARACTERS.has(n) || !existsSync(join(ROOT, src))) continue;
  // Scale each bust so its HEAD lands at the same width — source framing
  // varies (tight face crops vs. wide shoulders), so canvas-only
  // normalization left some faces looking huge and others tiny
  // (2026-07-08 playtest). Then everyone shares the same 300×180 canvas.
  const bust = trim(cropDeskRows(stripBackground(load(src), 34)));
  const scaledW = Math.round(bust.width * (TARGET_HEAD_WIDTH / headWidth(bust)));
  save(`char-${n}.png`, normalizeBust(resize(bust, Math.max(120, Math.min(scaledW, 340)))));
}

for (let n = 1; n <= 30; n++) {
  const src = `Borrower ${n}.png`;
  if (!existsSync(join(ROOT, src))) continue;
  save(`borrower-${n}.png`, resize(trim(stripBackground(load(src), 34)), 420));
}

for (let n = 1; n <= 30; n++) {
  const src = `House ${n}.png`;
  if (!existsSync(join(ROOT, src))) continue;
  save(`house-${n}.png`, resize(load(src), 640));
}

if (existsSync(join(ROOT, 'Menu.png'))) {
  // Menu.png is the clean golden-hour scene, no baked-in UI (2026-07-07) —
  // it fills the whole menu screen and the live card floats over it.
  save('menu-scene.png', resize(load('Menu.png'), 1800));
} else if (existsSync(join(ROOT, 'Home Menu.png'))) {
  // fallback: keep only the illustrated house side of the old mockup; the
  // live menu card replaces the baked-in title/buttons on the left
  save('menu-scene.png', resize(cropFraction(load('Home Menu.png'), 0.49, 0.02, 0.99, 0.98), 1100));
}

if (existsSync(join(ROOT, 'Map 3.png'))) {
  // Map 3 is clean full-bleed terrain — no baked-in UI panels, use it whole
  save('map-region.png', resize(load('Map 3.png'), 1200));
} else if (existsSync(join(ROOT, 'Map 2.png'))) {
  // slice the terrain out of the mockup, leaving the baked-in UI panels behind
  save('map-region.png', resize(cropFraction(load('Map 2.png'), 0.165, 0.08, 0.815, 0.84), 1200));
}

console.log('done — art ready 🎨');
