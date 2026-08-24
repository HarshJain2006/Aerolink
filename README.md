# AeroLink Command

Build AeroLink — a Ground Control Station (GCS) dashboard for a disaster-response system (SIH 2026, PS ID 26223). Real system context, for accuracy — do not invent features beyond this:

UAVs drop hardened relay nodes (ESP32 + LoRa/TTGO) into disaster zones.

Each node broadcasts a local EMERGENCY_SOS_WIFI captive portal so survivors can submit SOS + triage info from their own phone — that portal is separate embedded firmware, NOT part of this app.

Nodes relay data to each other and back to this dashboard over a self-healing LoRa mesh (multi-hop).

A Django REST API (endpoints TBD, using placeholders below) is the data source for this dashboard.

This is an operator/command-center tool used by rescue teams, not a public-facing app. No marketing landing page, no signup flow, no auth screen unless told otherwise.

Tech stack

React + TypeScript + Tailwind CSS

Dark theme only — this is a 24/7 command-center tool, not a consumer app. Think ops/NOC dashboard aesthetic: near-black background, high-contrast status colors, monospace for coordinates/IDs/timestamps.

No backend framework — this app will call a REST API. For now, mock the API responses locally using the exact TypeScript interfaces below, structured so swapping in real fetch calls later requires no data-shape changes.

Data model (use these exact shapes)

interface Node {
  id: string;              // e.g. "N1"
  lat: number;
  lng: number;
  status: "online" | "degraded" | "offline";
  batteryPercent: number;  // 0-100
  lastSeen: string;        // ISO timestamp
  connectedTo: string[];   // IDs of peer nodes currently linked (mesh edges)
}

interface SOSMessage {
  id: string;
  nodeId: string;          // which node relayed this message
  timestamp: string;       // ISO timestamp
  message: string;         // free-text SOS content
  coordinates: { lat: number; lng: number };
  triageStatus: "critical" | "injured" | "stable" | "unknown";
}


Generate realistic mock data: 4-6 nodes in a rough geographic cluster (simulate a disaster zone), a handful with degraded/offline status and missing connectedTo links to demonstrate mesh self-healing, and 5-10 SOS messages spread across nodes with varied triage statuses and timestamps over the last hour.

Pages / layout

Single main dashboard view (no multi-page nav needed unless it gets crowded):

Top status bar — network health summary: total nodes, nodes online/degraded/offline, total active links, last update time.

Mesh map/graph panel (primary, largest panel) — nodes plotted as points (use lat/lng on a simple map, or a force-directed graph if a real map is overkill for the demo) with lines drawn between nodes listed in each other's connectedTo. Color-code nodes by status: green=online, yellow=degraded, red=offline. This panel is the single most important thing on the screen — it's the visual proof the mesh is self-healing when a node drops.

Node list panel (sidebar) — scrollable list of all nodes with id, status badge, battery %, last seen. Clicking a node highlights it on the map panel.

SOS/Triage feed panel — reverse-chronological list of incoming messages, each showing node id, timestamp, triage status (color-coded badge), coordinates, and message text. This is the emotionally resonant part of the demo — make triage status visually unmissable (critical = red pulse/highlight).

Behavior requirements

Simulate live updates: every few seconds, randomly jitter a node's battery down slightly, occasionally flip a node's status, occasionally push a new mock SOS message — so the dashboard looks alive during a demo even without a real backend connected yet.

Add a small toggle or config flag (e.g. USE_MOCK_DATA = true) clearly separated from the rest of the code, so swapping to real API calls later is a one-line change, not a rewrite.

No login/auth, no settings page, no user management — out of scope.

Explicit constraints

Don't add features not described above (no chat, no analytics history charts, no admin panel) — this is a focused ops dashboard, not a general SaaS product.

Don't default to a light theme or add a marketing hero section — this opens directly into the dashboard.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://aerolinkmesh.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b80e7789-d4e4-41a1-8b21-9fd2d2a0905b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
