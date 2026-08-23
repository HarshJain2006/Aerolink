import { API_ENDPOINTS, USE_MOCK_DATA } from "./config";
import { mockNodes, mockSOSMessages } from "./mockData";
import type { Node, SOSMessage } from "./types";

/**
 * Data access layer. Every consumer talks to these two functions only, so
 * switching USE_MOCK_DATA to false swaps mocks for the Django REST API
 * without touching any component or data shape.
 */
export async function fetchNodes(): Promise<Node[]> {
  if (USE_MOCK_DATA) return structuredClone(mockNodes);
  const res = await fetch(API_ENDPOINTS.nodes);
  if (!res.ok) throw new Error(`GET ${API_ENDPOINTS.nodes} failed: ${res.status}`);
  return (await res.json()) as Node[];
}

export async function fetchSOSMessages(): Promise<SOSMessage[]> {
  if (USE_MOCK_DATA) return structuredClone(mockSOSMessages);
  const res = await fetch(API_ENDPOINTS.sos);
  if (!res.ok) throw new Error(`GET ${API_ENDPOINTS.sos} failed: ${res.status}`);
  return (await res.json()) as SOSMessage[];
}
