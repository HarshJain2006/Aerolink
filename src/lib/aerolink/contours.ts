/** Purely decorative topographic-style contour paths. Panel coordinates only — no geographic meaning. */
export function generateTopoPaths(W: number, H: number): string[] {
  const cx = W * 0.5;
  const cy = H * 0.5;
  const baseRadius = Math.min(W, H) * 0.38;
  const loops = 8;
  const segments = 64;
  const paths: string[] = [];

  for (let i = 0; i < loops; i++) {
    const r = baseRadius * (0.22 + i * 0.11);
    // Slightly offset the center of each loop for an organic, hand-drawn terrain feel.
    const dx = Math.sin(i * 1.7) * baseRadius * 0.06;
    const dy = Math.cos(i * 1.3) * baseRadius * 0.06;
    const loopCx = cx + dx;
    const loopCy = cy + dy;

    let d = "";
    for (let j = 0; j <= segments; j++) {
      const t = (j / segments) * Math.PI * 2;
      const distortion =
        Math.sin(t * 3 + i * 0.8) * 0.09 +
        Math.cos(t * 5 - i * 0.5) * 0.05 +
        Math.sin(t * 2 + i * 1.1) * 0.03;
      const radius = r * (1 + distortion);
      const x = loopCx + radius * Math.cos(t);
      const y = loopCy + radius * Math.sin(t);
      d +=
        j === 0
          ? `M ${x.toFixed(1)} ${y.toFixed(1)}`
          : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    d += " Z";
    paths.push(d);
  }

  return paths;
}
