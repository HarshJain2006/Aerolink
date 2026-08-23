import { clockTime, coordsMaybe, timeAgo } from "@/lib/aerolink/format";
import type { SOSMessage } from "@/lib/aerolink/types";
import { TriageBadge } from "./StatusBadge";

export function SOSFeed({
  messages,
  selectedNodeId,
  onSelectNode,
}: {
  messages: SOSMessage[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}) {
  return (
    <section className="panel flex min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-widest">SOS / triage feed</h2>
        <span className="label-caps">{messages.length} messages</span>
      </div>
      <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
        {messages.map((msg) => {
          const critical = msg.triageStatus === "critical";
          return (
            <li
              key={msg.id}
              className={`px-4 py-3 ${critical ? "bg-critical/5 border-l-2 border-l-critical" : ""} ${
                msg.nodeId === selectedNodeId ? "bg-panel-raised" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <TriageBadge status={msg.triageStatus} />
                  <button
                    type="button"
                    onClick={() => onSelectNode(msg.nodeId)}
                    className="font-mono text-[11px] text-primary hover:underline"
                  >
                    via {msg.nodeId}
                  </button>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {clockTime(msg.timestamp)} · {timeAgo(msg.timestamp)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-snug text-foreground/90">{msg.message}</p>
              <div className="mt-1.5 flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                <span>{msg.id}</span>
                <span>{coordsMaybe(msg.coordinates)}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
