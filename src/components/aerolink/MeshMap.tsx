import { coords } from "@/lib/aerolink/format";
import type { Node, SOSMessage } from "@/lib/aerolink/types";

const PAD = 60;
const W = 1000;
const H = 620;

const statusVar: Record<Node["status"], string> = {
  online: "var(--color-online)",
  degraded: "var(--color-degraded)",
  offline: "var(--color-offline)",
};

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
  const lats = nodes.map((n) => n.lat);
  const lngs = nodes.map((n) => n.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const x = (lng: number) =>
    PAD + ((lng - minLng) / (maxLng - minLng || 1)) * (W - PAD * 2);
  const y = (lat: number) =>
    H - PAD - ((lat - minLat) / (maxLat - minLat || 1)) * (H - PAD * 2);

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
