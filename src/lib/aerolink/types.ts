export interface Node {
  id: string;
  lat: number;
  lng: number;
  status: "online" | "degraded" | "offline";
  batteryPercent: number;
  lastSeen: string;
  connectedTo: string[];
}

export interface SOSMessage {
  id: string;
  nodeId: string;
  timestamp: string;
  message: string;
  /** May be undefined while the mesh is still triangulating the sender. */
  coordinates?: { lat: number; lng: number };
  triageStatus: "critical" | "injured" | "stable" | "unknown";
}
