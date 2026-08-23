import type { Node, SOSMessage } from "./types";

const now = Date.now();
const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();

/** 5 relay nodes dropped in a rough cluster over a flood-hit valley. */
export const mockNodes: Node[] = [
  {
    id: "N1",
    lat: 30.0812,
    lng: 78.2673,
    status: "online",
    batteryPercent: 87,
    lastSeen: iso(0.2),
    connectedTo: ["N2", "N3"],
  },
  {
    id: "N2",
    lat: 30.0894,
    lng: 78.2801,
    status: "online",
    batteryPercent: 72,
    lastSeen: iso(0.4),
    connectedTo: ["N1", "N4"],
  },
  {
    id: "N3",
    lat: 30.0731,
    lng: 78.2818,
    status: "degraded",
    batteryPercent: 34,
    lastSeen: iso(3.5),
    connectedTo: ["N1"],
  },
  {
    id: "N4",
    lat: 30.0968,
    lng: 78.2935,
    status: "online",
    batteryPercent: 61,
    lastSeen: iso(0.6),
    connectedTo: ["N2", "N5"],
  },
  {
    id: "N5",
    lat: 30.0855,
    lng: 78.3062,
    status: "degraded",
    batteryPercent: 18,
    lastSeen: iso(6.2),
    connectedTo: ["N4"],
  },
  {
    id: "N6",
    lat: 30.0702,
    lng: 78.2962,
    status: "offline",
    batteryPercent: 4,
    lastSeen: iso(27),
    connectedTo: [],
  },
];

export const mockSOSMessages: SOSMessage[] = [
  {
    id: "SOS-1042",
    nodeId: "N4",
    timestamp: iso(2),
    message: "Three people on rooftop, water still rising. One elderly, breathing trouble.",
    coordinates: { lat: 30.0971, lng: 78.2941 },
    triageStatus: "critical",
  },
  {
    id: "SOS-1041",
    nodeId: "N2",
    timestamp: iso(7),
    message: "Leg fracture, cannot walk. Shelter in school building, 4 adults 2 children.",
    coordinates: { lat: 30.0889, lng: 78.2795 },
    triageStatus: "injured",
  },
  {
    id: "SOS-1040",
    nodeId: "N1",
    timestamp: iso(11),
    message: "Family of five safe, out of drinking water since morning.",
    coordinates: { lat: 30.0818, lng: 78.2668 },
    triageStatus: "stable",
  },
  {
    id: "SOS-1039",
    nodeId: "N3",
    timestamp: iso(16),
    message: "Heavy bleeding from head wound after wall collapse. Need medic urgently.",
    coordinates: { lat: 30.0736, lng: 78.2822 },
    triageStatus: "critical",
  },
  {
    id: "SOS-1038",
    nodeId: "N5",
    timestamp: iso(23),
    message: "Partial message received via relay ... coordinates uncertain ... help",
    coordinates: { lat: 30.0851, lng: 78.3058 },
    triageStatus: "unknown",
  },
  {
    id: "SOS-1037",
    nodeId: "N2",
    timestamp: iso(31),
    message: "Two injured with burns, stable for now. Bridge on east road is gone.",
    coordinates: { lat: 30.0902, lng: 78.2812 },
    triageStatus: "injured",
  },
  {
    id: "SOS-1036",
    nodeId: "N1",
    timestamp: iso(40),
    message: "Group of 12 sheltering in temple, no injuries reported.",
    coordinates: { lat: 30.0806, lng: 78.2681 },
    triageStatus: "stable",
  },
  {
    id: "SOS-1035",
    nodeId: "N6",
    timestamp: iso(52),
    message: "Trapped under debris, cannot move legs. Last known ward 7.",
    coordinates: { lat: 30.0707, lng: 78.2955 },
    triageStatus: "critical",
  },
];

const SOS_TEMPLATES: { message: string; triageStatus: SOSMessage["triageStatus"] }[] = [
  { message: "Unconscious person pulled from water, not responding.", triageStatus: "critical" },
  { message: "Deep cut on arm, bleeding controlled. Need dressing.", triageStatus: "injured" },
  { message: "Six people safe on higher ground, request food drop.", triageStatus: "stable" },
  { message: "Signal broke mid-transmission ... unclear ... rooftop", triageStatus: "unknown" },
  { message: "Child with high fever, no medicine available.", triageStatus: "injured" },
  { message: "Gas smell in collapsed block, evacuating now.", triageStatus: "critical" },
];

let sosCounter = 1043;

export function generateMockSOS(nodes: Node[]): SOSMessage {
  const reachable = nodes.filter((n) => n.status !== "offline");
  const node = (reachable.length ? reachable : nodes)[
    Math.floor(Math.random() * (reachable.length || nodes.length))
  ];
  const template = SOS_TEMPLATES[Math.floor(Math.random() * SOS_TEMPLATES.length)];
  return {
    id: `SOS-${sosCounter++}`,
    nodeId: node.id,
    timestamp: new Date().toISOString(),
    message: template.message,
    coordinates: {
      lat: +(node.lat + (Math.random() - 0.5) * 0.004).toFixed(4),
      lng: +(node.lng + (Math.random() - 0.5) * 0.004).toFixed(4),
    },
    triageStatus: template.triageStatus,
  };
}
