import { useEffect, useRef, useState } from "react";
import { coords } from "@/lib/aerolink/format";
import type { Node, SOSMessage } from "@/lib/aerolink/types";

/** Largest decoration drawn around a node centre (critical pulse ring). */
const NODE_RADIUS = 34;
/** Space the two-line label needs to the right of a node centre. */
const LABEL_WIDTH = 210;
/** Extra breathing room around the fitted bounding box (~18% each side). */
const FIT_MARGIN = 0.18;

const statusVar: Record<Node["status"], string> = {
  online: "var(--color-online)",
  degraded: "var(--color-degraded)",
  offline: "var(--color-offline)",
};

const clamp = (v: number, lo: number, hi: number) =>
  hi < lo ? (lo + hi) / 2 : Math.min(Math.max(v, lo), hi);

export function MeshMap({
  nodes,
  links,
  messages,
  selectedId,
  onSelect,
}: {
  nodes: Node[];
  links: { a: Node; b: Node }[];
  messages: SOSMessage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 1000, h: 620 });

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry?.contentRect;
      if (r && r.width > 0 && r.height > 0)
        setSize({ w: Math.round(r.width), h: Math.round(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w: W, h: H } = size;

  // Safe padded bounds: every node centre lives inside this box, so its circle
  // and label always render fully inside the panel.
  const padLeft = Math.min(NODE_RADIUS + 8, W * 0.2);
  const padRight = Math.min(LABEL_WIDTH, W * 0.42);
  const padY = Math.min(NODE_RADIUS + 10, H * 0.2);
  const innerW = Math.max(W - padLeft - padRight, 1);
  const innerH = Math.max(H - padY * 2, 1);

  // Auto-fit: bounding box of current node positions, expanded by FIT_MARGIN,
  // mapped onto the safe box. Recomputes whenever positions change.
  const lats = nodes.map((n) => n.lat);
  const lngs = nodes.map((n) => n.lng);
  const minLat = nodes.length ? Math.min(...lats) : 0;
  const maxLat = nodes.length ? Math.max(...lats) : 0;
  const minLng = nodes.length ? Math.min(...lngs) : 0;
  const maxLng = nodes.length ? Math.max(...lngs) : 0;
  const latSpan = maxLat - minLat || 0.01;
  const lngSpan = maxLng - minLng || 0.01;
  const lat0 = minLat - latSpan * FIT_MARGIN;
  const lat1 = maxLat + latSpan * FIT_MARGIN;
  const lng0 = minLng - lngSpan * FIT_MARGIN;
  const lng1 = maxLng + lngSpan * FIT_MARGIN;

  const x = (lng: number) =>
    clamp(
      padLeft + ((lng - lng0) / (lng1 - lng0)) * innerW,
      padLeft,
      padLeft + innerW,
    );
  const y = (lat: number) =>
    clamp(
      H - padY - ((lat - lat0) / (lat1 - lat0)) * innerH,
      padY,
      padY + innerH,
    );

  const criticalNodes = new Set(
    messages.filter((m) => m.triageStatus === "critical").map((m) => m.nodeId),
  );


  return (
    <section className="panel relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-widest">
          Mesh topology · disaster zone
        </h2>
        <div className="flex items-center gap-4">
          {(["online", "degraded", "offline"] as Node["status"][]).map((s) => (
            <span key={s} className="label-caps flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: statusVar[s] }}
              />
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div className="grid-backdrop absolute inset-0" />
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full"
        >
          {links.map(({ a, b }) => {
            const weak = a.status === "degraded" || b.status === "degraded";
            const highlighted = selectedId === a.id || selectedId === b.id;
            return (
              <line
                key={`${a.id}-${b.id}`}
                x1={x(a.lng)}
                y1={y(a.lat)}
                x2={x(b.lng)}
                y2={y(b.lat)}
                stroke={weak ? "var(--color-degraded)" : "var(--color-primary)"}
                strokeWidth={highlighted ? 2.5 : 1.5}
                strokeOpacity={highlighted ? 0.95 : 0.5}
                strokeDasharray={weak ? "7 6" : undefined}
              />
            );
          })}

          {nodes.map((node) => {
            const cx = x(node.lng);
            const cy = y(node.lat);
            const selected = node.id === selectedId;
            const color = statusVar[node.status];
            return (
              <g
                key={node.id}
                onClick={() => onSelect(node.id)}
                className="cursor-pointer"
              >
                {node.status !== "offline" && (
                  <circle cx={cx} cy={cy} r={22} fill={color} opacity={0.08} />
                )}
                {criticalNodes.has(node.id) && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={28}
                    fill="none"
                    stroke="var(--color-critical)"
                    strokeWidth={1.5}
                    strokeOpacity={0.7}
                  >
                    <animate
                      attributeName="r"
                      values="20;34;20"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="stroke-opacity"
                      values="0.8;0;0.8"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {selected && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={20}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={9}
                  fill={color}
                  stroke="var(--color-background)"
                  strokeWidth={2}
                />
                <text
                  x={cx + 16}
                  y={cy - 4}
                  fill="var(--color-foreground)"
                  fontFamily="var(--font-mono)"
                  fontSize={14}
                  fontWeight={600}
                >
                  {node.id}
                </text>
                <text
                  x={cx + 16}
                  y={cy + 12}
                  fill="var(--color-muted-foreground)"
                  fontFamily="var(--font-mono)"
                  fontSize={11}
                >
                  {node.batteryPercent.toFixed(0)}% · {coords(node.lat, node.lng)}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="pointer-events-none absolute bottom-3 left-4 font-mono text-[10px] text-muted-foreground">
          multi-hop LoRa mesh · dashed = degraded link · offline nodes drop links and mesh re-routes
        </div>
      </div>
    </section>
  );
}
