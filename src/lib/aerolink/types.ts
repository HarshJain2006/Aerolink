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
  coordinates: { lat: number; lng: number };
  triageStatus: "critical" | "injured" | "stable" | "unknown";
}
