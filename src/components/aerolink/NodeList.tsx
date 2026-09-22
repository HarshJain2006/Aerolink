import { coords, timeAgo } from "@/lib/aerolink/format";
import type { Node } from "@/lib/aerolink/types";
import { NodeStatusBadge } from "./StatusBadge";

function batteryTone(pct: number) {
  if (pct <= 20) return "bg-offline";
  if (pct <= 50) return "bg-degraded";
  return "bg-online";
}

export function NodeList({
  nodes,
  selectedId,
  onSelect,
}: {
  nodes: Node[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="panel flex min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-widest">Relay nodes</h2>
        <span className="label-caps">{nodes.length} deployed</span>
      </div>
      <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
        {nodes.map((node) => {
          const active = node.id === selectedId;
          return (
            <li key={node.id}>
              <button
                type="button"
                onClick={() => onSelect(node.id)}
                className={`w-full px-4 py-3 text-left transition-colors hover:bg-panel-raised ${
                  active ? "bg-panel-raised ring-1 ring-inset ring-primary/50" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold">{node.id}</span>
                  <NodeStatusBadge status={node.status} />
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${batteryTone(node.batteryPercent)}`}
                      style={{ width: `${node.batteryPercent}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono text-[11px] text-muted-foreground">
                    {node.batteryPercent.toFixed(0)}%
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                  <span>{coords(node.lat, node.lng)}</span>
                  <span>{timeAgo(node.lastSeen)}</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                  peers: {node.connectedTo.length ? node.connectedTo.join(" · ") : "—"}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
