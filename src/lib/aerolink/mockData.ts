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

const SOS_TEMPLATES: {
  message: string;
  triageStatus: SOSMessage["triageStatus"];
  kind?: "update" | "fragment";
}[] = [
  // Critical — short, long, detailed, cut off, vague, specific, typos
  { message: "Trapped, can't move, help", triageStatus: "critical" },
  { message: "Woman unconscious. Not breathing right. Need doctor NOW. Ward 7 near mosque.", triageStatus: "critical" },
  { message: "Gas leak smell strong. Building cracking. 4 people still inside.", triageStatus: "critical" },
  { message: "Baby crying but wont respond. Smoke everywhere. Cant get to stairs.", triageStatus: "critical" },
  { message: "Two workers buried. One still talking, other silent. Please hurry.", triageStatus: "critical" },
  { message: "Water rising fast on roof. 3 children and my mother. Can't swim.", triageStatus: "critical" },
  { message: "Heart patient, no medicines, chest pain spreading to left arm", triageStatus: "critical" },
  { message: "Fire from kitchen spreading. Trapped on 2nd floor. 6 of us total.", triageStatus: "critical" },
  { message: "Severe head wound, blood coming through cloth, person is fading", triageStatus: "critical" },
  { message: "Electrocuted trying to switch off mains. Not breathing. Do som", triageStatus: "critical", kind: "fragment" },
  { message: "Help us roof is collapsing. Not sure how many maybe 8-10 people here", triageStatus: "critical" },
  { message: "Child fell into well, water high, can hear crying but can't re", triageStatus: "critical", kind: "fragment" },

  // Injured — varied specificity, mixed details, incomplete
  { message: "Deep cut on left arm, bleeding slow now. Can walk to road.", triageStatus: "injured" },
  { message: "Ankle probably broken. Needs splint. 2 adults with me.", triageStatus: "injured" },
  { message: "Child 5 years, fever and vomiting, no ORS packets left", triageStatus: "injured" },
  { message: "Burns on both hands and face, needs clean dressing. Breathing ok.", triageStatus: "injured" },
  { message: "Rib pain, hard to breathe deep, but conscious and talking", triageStatus: "injured" },
  { message: "Metal rod in thigh. Bleeding controlled with belt. Need medic.", triageStatus: "injured" },
  { message: "Elderly fell, hip hurts, cannot stand. No visible bleeding.", triageStatus: "injured" },
  { message: "Multiple small cuts, feeling dizzy, maybe dehydrated", triageStatus: "injured" },
  { message: "Eye injury from flying glass. Vision blurry. Needs help to walk.", triageStatus: "injured" },
  { message: "Dog bite, deep puncture, swelling. Cannot leave area.", triageStatus: "injured" },
  { message: "Arm bent wrong way below elbow. Pain unbearable. Please send do", triageStatus: "injured", kind: "fragment" },

  // Stable — counts, requests, shelter details
  { message: "12 people at village school. Roof ok. No injuries yet. Need water.", triageStatus: "stable" },
  { message: "Family of 6 safe on hill. Need water and blankets when possible.", triageStatus: "stable" },
  { message: "Nine in community hall. All accounted for. No urgent medical need.", triageStatus: "stable" },
  { message: "All neighbours evacuated to ridge. Request food packets if available.", triageStatus: "stable" },
  { message: "Three adults two kids safe on first floor. Dry. No injuries.", triageStatus: "stable" },
  { message: "We are at the temple courtyard. About 20 people. No injuries.", triageStatus: "stable" },
  { message: "Need drinking water only. Everyone safe here.", triageStatus: "stable" },
  { message: "Can hear helicopter. Waving orange cloth from rooftop. All 4 safe.", triageStatus: "stable" },
  { message: "Sheltering in shop. 7 people. Doors blocked by debris but safe.", triageStatus: "stable" },
  { message: "Milk and baby food running out. Infant okay for now. No injuries.", triageStatus: "stable" },

  // Unknown / fragments — signal loss, triangulating, corrupted
  { message: "Signal weak ... can't ... rooftop ...", triageStatus: "unknown", kind: "fragment" },
  { message: "Ward 4 ... repeat ... unreadable", triageStatus: "unknown", kind: "fragment" },
  { message: "Partial packet: coordinates corrupted, sender unidentified.", triageStatus: "unknown", kind: "fragment" },
  { message: "LoRa relay echo only ... no payload decoded ... retrying", triageStatus: "unknown", kind: "fragment" },
  { message: "help us ... location is ... near the ...", triageStatus: "unknown", kind: "fragment" },
  { message: "Still triangulating. No GPS lock yet. Please wait.", triageStatus: "unknown", kind: "fragment" },
  { message: "Message garbled. Sender unknown. Only fragment received.", triageStatus: "unknown", kind: "fragment" },
  { message: "...", triageStatus: "unknown", kind: "fragment" },
  { message: "Can anyone hear me? Signal dropping every few se", triageStatus: "unknown", kind: "fragment" },

  // Location updates / follow-ups from the same reporter
  { message: "UPDATE: Moved to school roof. Water entered building. Still 5 of us.", triageStatus: "stable", kind: "update" },
  { message: "Location correction — we are at the warehouse, not the house. 3 people injured.", triageStatus: "injured", kind: "update" },
  { message: "Re-sending coordinates. Previous location was wrong. We shifted east.", triageStatus: "stable", kind: "update" },
  { message: "UPDATE: found 2 more survivors here. Now total 7, one critical.", triageStatus: "critical", kind: "update" },
  { message: "Follow-up: rescued from roof, all on higher ground, no injuries now.", triageStatus: "stable", kind: "update" },
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
    const noCoords = template.kind === "fragment" ? Math.random() < FRAGMENT_NO_COORDS_CHANCE : Math.random() < NO_COORDS_CHANCE;
    coordinates = noCoords
      ? undefined
      : {
          lat: +(node.lat + (Math.random() - 0.5) * 0.004).toFixed(4),
          lng: +(node.lng + (Math.random() - 0.5) * 0.004).toFixed(4),
        };
  }

  return {
    id: `SOS-${sosCounter++}`,
    nodeId: node.id,
    timestamp: new Date().toISOString(),
    message: template.message,
    coordinates,
    triageStatus: template.triageStatus,
  };
}
