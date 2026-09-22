import type { Node, SOSMessage } from "./types";

const now = Date.now();
const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();

/** 3 field-tested relay nodes dropped over a flood-hit valley. */
export const mockNodes: Node[] = [
  {
    id: "NODE_A",
    lat: 30.0812,
    lng: 78.2673,
    status: "online",
    batteryPercent: 87,
    lastSeen: iso(0.2),
    connectedTo: ["NODE_B", "NODE_C"],
  },
  {
    id: "NODE_B",
    lat: 30.0894,
    lng: 78.2801,
    status: "online",
    batteryPercent: 72,
    lastSeen: iso(0.4),
    connectedTo: ["NODE_A", "NODE_C"],
  },
  {
    id: "NODE_C",
    lat: 30.0731,
    lng: 78.2818,
    status: "degraded",
    batteryPercent: 34,
    lastSeen: iso(3.5),
    connectedTo: ["NODE_B", "NODE_A"],
  },
];

export const mockSOSMessages: SOSMessage[] = [
  {
    id: "SOS-1042",
    nodeId: "NODE_B",
    timestamp: iso(2),
    message: "woman not breathing hurry",
    coordinates: { lat: 30.0971, lng: 78.2941 },
    triageStatus: "critical",
  },
  {
    id: "SOS-1041",
    nodeId: "NODE_B",
    timestamp: iso(7),
    message: "ankle broken need splint",
    coordinates: { lat: 30.0889, lng: 78.2795 },
    triageStatus: "injured",
  },
  {
    id: "SOS-1040",
    nodeId: "NODE_A",
    timestamp: iso(11),
    message: "6 safe on hill need water",
    coordinates: { lat: 30.0818, lng: 78.2668 },
    triageStatus: "stable",
  },
  {
    id: "SOS-1039",
    nodeId: "NODE_C",
    timestamp: iso(16),
    message: "head bleeding bad hurry",
    coordinates: { lat: 30.0736, lng: 78.2822 },
    triageStatus: "critical",
  },
  {
    id: "SOS-1038",
    nodeId: "NODE_C",
    timestamp: iso(23),
    message: "cant ... rooftop ...",
    triageStatus: "unknown",
  },
  {
    id: "SOS-1037",
    nodeId: "NODE_B",
    timestamp: iso(31),
    message: "hands burned need dressing",
    coordinates: { lat: 30.0902, lng: 78.2812 },
    triageStatus: "injured",
  },
  {
    id: "SOS-1036",
    nodeId: "NODE_A",
    timestamp: iso(40),
    message: "12 at school no injuries",
    coordinates: { lat: 30.0806, lng: 78.2681 },
    triageStatus: "stable",
  },
  {
    id: "SOS-1035",
    nodeId: "NODE_A",
    timestamp: iso(52),
    message: "trapped cant move help",
    coordinates: { lat: 30.0707, lng: 78.2955 },
    triageStatus: "critical",
  },
];

/** Short, hurried fragments — typed one-handed on a cracked screen. */
const SOS_TEMPLATES: {
  message: string;
  triageStatus: SOSMessage["triageStatus"];
  kind?: "update" | "fragment";
}[] = [
  // critical
  { message: "trapped cant move help", triageStatus: "critical" },
  { message: "roof collapsed send help", triageStatus: "critical" },
  { message: "cant breathe smoke everywhere", triageStatus: "critical" },
  { message: "kid hurt bad hurry", triageStatus: "critical" },
  { message: "water rising 3 kids", triageStatus: "critical" },
  { message: "not breathing pls come", triageStatus: "critical" },
  { message: "gas smell wall cracking", triageStatus: "critical" },
  { message: "2 buried one silent", triageStatus: "critical" },
  { message: "chest pain no medicine", triageStatus: "critical" },
  { message: "bleeding wont stop", triageStatus: "critical" },
  { message: "fire below trapped upstairs", triageStatus: "critical" },
  { message: "help roof going do", triageStatus: "critical", kind: "fragment" },

  // injured
  { message: "leg broken cant walk", triageStatus: "injured" },
  { message: "arm cut deep need bandage", triageStatus: "injured" },
  { message: "child fever vomiting", triageStatus: "injured" },
  { message: "burns on hands", triageStatus: "injured" },
  { message: "ribs hurt breathing hard", triageStatus: "injured" },
  { message: "old man fell hip", triageStatus: "injured" },
  { message: "glass in eye cant see", triageStatus: "injured" },
  { message: "dizzy bleeding little", triageStatus: "injured" },
  { message: "rod in leg tied belt", triageStatus: "injured" },
  { message: "hand crushed pain send do", triageStatus: "injured", kind: "fragment" },

  // stable
  { message: "ok now, was scared", triageStatus: "stable" },
  { message: "3 ppl here need water", triageStatus: "stable" },
  { message: "all safe upstairs", triageStatus: "stable" },
  { message: "9 in hall no injuries", triageStatus: "stable" },
  { message: "need food packets only", triageStatus: "stable" },
  { message: "waving cloth from roof", triageStatus: "stable" },
  { message: "dry and safe, no doctor needed", triageStatus: "stable" },
  { message: "baby ok milk finishing", triageStatus: "stable" },
  { message: "we reached the ridge", triageStatus: "stable" },

  // unknown / fragments
  { message: "help ... near the ...", triageStatus: "unknown", kind: "fragment" },
  { message: "ward 4 ... repeat ...", triageStatus: "unknown", kind: "fragment" },
  { message: "...", triageStatus: "unknown", kind: "fragment" },
  { message: "anyone there sig", triageStatus: "unknown", kind: "fragment" },
  { message: "no gps yet", triageStatus: "unknown", kind: "fragment" },
  { message: "garbled packet", triageStatus: "unknown", kind: "fragment" },
  { message: "hello hello", triageStatus: "unknown", kind: "fragment" },

  // updates / follow-ups
  { message: "moved to school roof", triageStatus: "stable", kind: "update" },
  { message: "wrong spot, we are east", triageStatus: "stable", kind: "update" },
  { message: "found 2 more, one bad", triageStatus: "critical", kind: "update" },
  { message: "3 hurt not 1", triageStatus: "injured", kind: "update" },
  { message: "out now, all ok", triageStatus: "stable", kind: "update" },
];

/** How many recent messages are treated as "still visible" and never repeated. */
const RECENT_WINDOW = 8;

/** Chance a normal message has no coordinates yet (still triangulating). */
const NO_COORDS_CHANCE = 0.12;
/** Fragments and corrupted messages are far more likely to lack coordinates. */
const FRAGMENT_NO_COORDS_CHANCE = 0.65;
/** Chance a new message is a location-update follow-up from the most recent reporter. */
const FOLLOW_UP_CHANCE = 0.18;

let sosCounter = 1043;

export function generateMockSOS(nodes: Node[], recent: SOSMessage[] = []): SOSMessage {
  const reachable = nodes.filter((n) => n.status !== "offline");
  const pool = reachable.length ? reachable : nodes;

  const recentWithCoords = recent.filter((m) => m.coordinates);
  const isFollowUp = recentWithCoords.length > 0 && Math.random() < FOLLOW_UP_CHANCE;

  let node: Node;
  let coordinates: { lat: number; lng: number } | undefined;

  if (isFollowUp) {
    const last = recentWithCoords[0]!;
    node = pool.find((n) => n.id === last.nodeId) ?? pool[Math.floor(Math.random() * pool.length)]!;
    coordinates = {
      lat: +(last.coordinates!.lat + (Math.random() - 0.5) * 0.006).toFixed(4),
      lng: +(last.coordinates!.lng + (Math.random() - 0.5) * 0.006).toFixed(4),
    };
  } else {
    node = pool[Math.floor(Math.random() * pool.length)] ?? mockNodes[0]!;
  }

  const blocked = new Set(recent.slice(0, RECENT_WINDOW).map((m) => m.message));
  let available = SOS_TEMPLATES.filter((t) => !blocked.has(t.message));
  if (!available.length) available = SOS_TEMPLATES;

  let template: (typeof SOS_TEMPLATES)[number];
  if (isFollowUp) {
    const updates = available.filter((t) => t.kind === "update");
    template = updates.length
      ? updates[Math.floor(Math.random() * updates.length)]!
      : available[Math.floor(Math.random() * available.length)]!;
  } else {
    template = available[Math.floor(Math.random() * available.length)]!;
  }

  if (!isFollowUp) {
    const noCoords =
      template.kind === "fragment"
        ? Math.random() < FRAGMENT_NO_COORDS_CHANCE
        : Math.random() < NO_COORDS_CHANCE;
    coordinates = noCoords
      ? undefined
      : {
          lat: +(node.lat + (Math.random() - 0.5) * 0.004).toFixed(4),
          lng: +(node.lng + (Math.random() - 0.5) * 0.004).toFixed(4),
        };
  }

  const base = {
    id: `SOS-${sosCounter++}`,
    nodeId: node.id,
    timestamp: new Date().toISOString(),
    message: template.message,
    triageStatus: template.triageStatus,
  };

  return coordinates === undefined ? base : { ...base, coordinates };
}
