import type { Node, SOSMessage } from "@/lib/aerolink/types";

const nodeStyles: Record<Node["status"], string> = {
  online: "text-online border-online/40 bg-online/10",
  degraded: "text-degraded border-degraded/40 bg-degraded/10",
  offline: "text-offline border-offline/40 bg-offline/10",
};

const triageStyles: Record<SOSMessage["triageStatus"], string> = {
  critical: "text-critical border-critical/50 bg-critical/15",
  injured: "text-injured border-injured/40 bg-injured/10",
  stable: "text-stable border-stable/40 bg-stable/10",
  unknown: "text-unknown border-unknown/40 bg-unknown/10",
};

export function NodeStatusBadge({ status }: { status: Node["status"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${nodeStyles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function TriageBadge({ status }: { status: SOSMessage["triageStatus"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest ${triageStyles[status]} ${
        status === "critical" ? "pulse-critical" : ""
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
