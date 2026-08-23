import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MeshMap } from "@/components/aerolink/MeshMap";
import { NodeList } from "@/components/aerolink/NodeList";
import { SOSFeed } from "@/components/aerolink/SOSFeed";
import { StatusBar } from "@/components/aerolink/StatusBar";
import { useMeshTelemetry } from "@/lib/aerolink/useMeshTelemetry";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AeroLink GCS — LoRa Mesh Ground Control Station" },
      {
        name: "description",
        content:
          "Operator dashboard for AeroLink: monitor UAV-dropped LoRa relay nodes, self-healing mesh links, and incoming SOS triage messages from disaster zones.",
      },
      { property: "og:title", content: "AeroLink GCS — LoRa Mesh Ground Control Station" },
      {
        property: "og:description",
        content:
          "Live mesh topology, relay node health, and SOS triage feed for disaster-response ground teams.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { nodes, messages, links, lastUpdate, error, loading } = useMeshTelemetry();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const select = (id: string) => setSelectedId((prev) => (prev === id ? null : id));
  const criticalCount = messages.filter((m) => m.triageStatus === "critical").length;

  return (
    <main className="flex h-screen flex-col gap-3 overflow-hidden bg-background p-3">
      <StatusBar
        nodes={nodes}
        linkCount={links.length}
        lastUpdate={lastUpdate}
        criticalCount={criticalCount}
      />

      {error && (
        <div className="panel border-offline/40 bg-offline/10 px-4 py-2 font-mono text-xs text-offline">
          telemetry link error: {error}
        </div>
      )}

      {loading ? (
        <div className="panel flex flex-1 items-center justify-center font-mono text-xs text-muted-foreground">
          acquiring mesh telemetry…
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[260px_minmax(0,1fr)_360px]">
          <NodeList nodes={nodes} selectedId={selectedId} onSelect={select} />
          <MeshMap
            nodes={nodes}
            links={links}
            messages={messages}
            selectedId={selectedId}
            onSelect={select}
          />
          <SOSFeed
            messages={messages}
            selectedNodeId={selectedId}
            onSelectNode={select}
          />
        </div>
      )}
    </main>
  );
}
