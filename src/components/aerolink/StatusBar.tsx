import { USE_MOCK_DATA } from "@/lib/aerolink/config";
import { clockTime } from "@/lib/aerolink/format";
import type { Node } from "@/lib/aerolink/types";

function Metric({
  label,
  value,
  tone = "text-foreground",
}: {
  label: string;
  value: string | number;
  tone?: string;
}) {
  return (
    <div className="flex min-w-[86px] flex-col gap-0.5">
      <span className="label-caps">{label}</span>
      <span className={`font-mono text-lg leading-none ${tone}`}>{value}</span>
    </div>
  );
}

export function StatusBar({
  nodes,
  linkCount,
  lastUpdate,
  criticalCount,
}: {
  nodes: Node[];
  linkCount: number;
  lastUpdate: string;
  criticalCount: number;
}) {
  const count = (s: Node["status"]) => nodes.filter((n) => n.status === s).length;

  return (
    <header className="panel flex flex-wrap items-center gap-x-8 gap-y-4 px-5 py-3">
      <div className="flex items-center gap-3 pr-4">
        <div className="relative flex h-8 w-8 items-center justify-center rounded border border-primary/50 bg-primary/10">
          <span className="font-mono text-xs font-bold text-primary">AL</span>
          <span className="ping-ring absolute inset-0 rounded border border-primary/50" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-wide">AeroLink Ground Control</h1>
          <p className="label-caps">LoRa mesh · disaster response</p>
        </div>
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-x-8 gap-y-3">
        <Metric label="Total nodes" value={nodes.length} />
        <Metric label="Online" value={count("online")} tone="text-online" />
        <Metric label="Degraded" value={count("degraded")} tone="text-degraded" />
        <Metric label="Offline" value={count("offline")} tone="text-offline" />
        <Metric label="Active links" value={linkCount} tone="text-primary" />
        <Metric label="Critical SOS" value={criticalCount} tone="text-critical" />
        <Metric label="Last update" value={clockTime(lastUpdate)} tone="text-muted-foreground" />
      </div>

      <span
        className={`rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${
          USE_MOCK_DATA
            ? "border-degraded/40 bg-degraded/10 text-degraded"
            : "border-online/40 bg-online/10 text-online"
        }`}
      >
        {USE_MOCK_DATA ? "mock feed" : "live api"}
      </span>
    </header>
  );
}
