/**
 * Purely decorative topographic-style contour lines.
 *
 * A deterministic multi-octave value-noise field is sampled over the ENTIRE
 * panel rectangle (with a bleed margin), then marching squares extracts
 * iso-lines at several thresholds. The result is full-bleed, irregular and
 * asymmetric — no single centre, no concentric rings. Panel coordinates only;
 * no geographic meaning whatsoever.
 */

/** Deterministic hash -> [0,1). */
function hash(x: number, y: number, seed: number): number {
  let h = x * 374761393 + y * 668265263 + seed * 1442695040;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

function valueNoise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const tx = smooth(x - xi);
  const ty = smooth(y - yi);
  const a = hash(xi, yi, seed);
  const b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed);
  const d = hash(xi + 1, yi + 1, seed);
  return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
}

function fbm(x: number, y: number): number {
  let sum = 0;
  let amp = 1;
  let norm = 0;
  let freq = 1;
  for (let o = 0; o < 5; o++) {
    sum += amp * valueNoise(x * freq, y * freq, 17 + o * 91);
    norm += amp;
    amp *= 0.52;
    freq *= 2.07;
  }
  return sum / norm;
}

export function generateTopoPaths(W: number, H: number): string[] {
  if (!(W > 0) || !(H > 0)) return [];

  // Bleed beyond the panel so lines run off every edge instead of stopping.
  const bleed = Math.max(W, H) * 0.12;
  const x0 = -bleed;
  const y0 = -bleed;
  const gw = W + bleed * 2;
  const gh = H + bleed * 2;

  // Sampling grid — fine enough for organic curves, cheap enough per resize.
  const step = Math.max(10, Math.min(gw, gh) / 34);
  const cols = Math.ceil(gw / step) + 1;
  const rows = Math.ceil(gh / step) + 1;

  // Noise scale: a few "hills" across the panel, stretched unevenly so the
  // field is anisotropic (terrain-like ridges rather than round blobs).
  const sx = 3.1 / gw;
  const sy = 4.6 / gh;

  const field = new Float32Array(cols * rows);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const px = x0 + i * step;
      const py = y0 + j * step;
      // Warp the sample point with a second noise lookup for extra irregularity.
      const wx = valueNoise(px * sx * 1.9 + 11, py * sy * 1.9 + 5, 303) - 0.5;
      const wy = valueNoise(px * sx * 1.9 + 71, py * sy * 1.9 + 29, 707) - 0.5;
      field[j * cols + i] = fbm(
        (px * sx + wx * 0.9) * 2.4,
        (py * sy + wy * 0.9) * 2.4,
      );
    }
  }

  let min = Infinity;
  let max = -Infinity;
  for (let k = 0; k < field.length; k++) {
    const v = field[k]!;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = max - min || 1;

  const levels = 13;
  const paths: string[] = [];

  const px = (i: number) => x0 + i * step;
  const py = (j: number) => y0 + j * step;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  for (let l = 1; l <= levels; l++) {
    // Uneven level spacing -> varied line density across the panel.
    const f = l / (levels + 1);
    const t = f + Math.sin(f * Math.PI * 2.3) * 0.035;
    const iso = min + range * t;
    let d = "";

    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const v00 = field[j * cols + i]!;
        const v10 = field[j * cols + i + 1]!;
        const v11 = field[(j + 1) * cols + i + 1]!;
        const v01 = field[(j + 1) * cols + i]!;
        let idx = 0;
        if (v00 > iso) idx |= 1;
        if (v10 > iso) idx |= 2;
        if (v11 > iso) idx |= 4;
        if (v01 > iso) idx |= 8;
        if (idx === 0 || idx === 15) continue;

        const top = () => [
          lerp(px(i), px(i + 1), (iso - v00) / (v10 - v00 || 1e-6)),
          py(j),
        ] as const;
        const right = () => [
          px(i + 1),
          lerp(py(j), py(j + 1), (iso - v10) / (v11 - v10 || 1e-6)),
        ] as const;
        const bottom = () => [
          lerp(px(i), px(i + 1), (iso - v01) / (v11 - v01 || 1e-6)),
          py(j + 1),
        ] as const;
        const left = () => [
          px(i),
          lerp(py(j), py(j + 1), (iso - v00) / (v01 - v00 || 1e-6)),
        ] as const;

        const seg: readonly (readonly [number, number])[] =
          idx === 1 || idx === 14
            ? [left(), top()]
            : idx === 2 || idx === 13
              ? [top(), right()]
              : idx === 3 || idx === 12
                ? [left(), right()]
                : idx === 4 || idx === 11
                  ? [right(), bottom()]
                  : idx === 6 || idx === 9
                    ? [top(), bottom()]
                    : idx === 7 || idx === 8
                      ? [left(), bottom()]
                      : idx === 5
                        ? [left(), top()]
                        : [top(), right()];

        const [a, b] = seg as [
          readonly [number, number],
          readonly [number, number],
        ];
        d += `M ${a[0].toFixed(1)} ${a[1].toFixed(1)} L ${b[0].toFixed(1)} ${b[1].toFixed(1)} `;

        // Ambiguous saddles: emit the complementary pair too.
        if (idx === 5) {
          const c = right();
          const e = bottom();
          d += `M ${c[0].toFixed(1)} ${c[1].toFixed(1)} L ${e[0].toFixed(1)} ${e[1].toFixed(1)} `;
        } else if (idx === 10) {
          const c = left();
          const e = bottom();
          d += `M ${c[0].toFixed(1)} ${c[1].toFixed(1)} L ${e[0].toFixed(1)} ${e[1].toFixed(1)} `;
        }
      }
    }

    if (d) paths.push(d.trim());
  }

  return paths;
}
