import { useEffect, useRef, useState } from "react";
import { fetchNodes, fetchSOSMessages } from "./api";
import { REFRESH_INTERVAL_MS, USE_MOCK_DATA } from "./config";
import { generateMockSOS } from "./mockData";
import type { Node, SOSMessage } from "./types";

const STATUSES: Node["status"][] = ["online", "degraded", "offline"];

/**
 * Single source of truth for mesh edges: one edge per unique pair of nodes that
 * BOTH list each other in `connectedTo`. The status bar counter and the map both
 * consume this, so the displayed count can never diverge from the drawn lines.
 */
export function meshLinks(nodes: Node[]): { a: Node; b: Node }[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const seen = new Set<string>();
  const links: { a: Node; b: Node }[] = [];
  for (const node of nodes) {
    for (const peerId of node.connectedTo) {
      const peer = byId.get(peerId);
      if (!peer) continue;
      if (!peer.connectedTo.includes(node.id)) continue; // not a mutual link
      const key = [node.id, peer.id].sort().join("-");
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({ a: node, b: peer });
    }
  }
  return links;
}

/** Make adjacency reciprocal so a peer link is never half-declared. */
function symmetrize(nodes: Node[]): Node[] {
  const wanted = new Map(nodes.map((n) => [n.id, new Set(n.connectedTo)]));
  for (const node of nodes) {
    if (node.status === "offline") {
      wanted.get(node.id)!.clear();
      continue;
    }
    for (const peerId of node.connectedTo) {
      const peer = nodes.find((p) => p.id === peerId);
      if (!peer || peer.status === "offline") {
        wanted.get(node.id)!.delete(peerId);
        continue;
      }
      wanted.get(peerId)!.add(node.id);
    }
  }
  // Drop links pointing at offline nodes that were added reciprocally.
  for (const node of nodes) {
    if (node.status === "offline") wanted.get(node.id)!.clear();
    else
      for (const peerId of [...wanted.get(node.id)!])
        if (nodes.find((p) => p.id === peerId)?.status === "offline")
          wanted.get(node.id)!.delete(peerId);
  }
  return nodes.map((n) => ({ ...n, connectedTo: [...wanted.get(n.id)!] }));
}


/** Simulate one tick of live telemetry: battery drain, status flips, new SOS. */
function simulateTick(input: Node[]): Node[] {
  const nodes = input;
  const idx = Math.floor(Math.random() * nodes.length);
  const ticked = nodes.map((node, i) => {
    let next: Node = { ...node };
    if (i === idx) {
      next.batteryPercent = Math.max(0, +(node.batteryPercent - Math.random() * 1.4).toFixed(1));
      if (node.status !== "offline") next.lastSeen = new Date().toISOString();

      if (Math.random() < 0.18) {
        const candidates = STATUSES.filter((s) => s !== node.status);
        next.status = candidates[Math.floor(Math.random() * candidates.length)] ?? node.status;
      }
    }

    // Self-healing mesh: offline nodes lose links, recovered nodes re-link to
    // their nearest reachable peers.
    if (next.status === "offline") {
      next.connectedTo = [];
    } else if (next.connectedTo.length === 0) {
      const peers = nodes
        .filter((p) => p.id !== next.id && p.status !== "offline")
        .sort(
          (p, q) =>
            Math.hypot(p.lat - next.lat, p.lng - next.lng) -
            Math.hypot(q.lat - next.lat, q.lng - next.lng),
        )
        .slice(0, 2)
        .map((p) => p.id);
      next.connectedTo = peers;
    } else {
      next.connectedTo = next.connectedTo.filter(
        (id) => nodes.find((p) => p.id === id)?.status !== "offline",
      );
    }
    return next;
  });
  // Canonicalise adjacency: every peer reference is made reciprocal (or dropped)
  // so peer lists, the drawn lines and the link counter can never disagree.
  return symmetrize(ticked);
}

export function useMeshTelemetry() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [messages, setMessages] = useState<SOSMessage[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const nodesRef = useRef<Node[]>([]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [n, s] = await Promise.all([fetchNodes(), fetchSOSMessages()]);
        if (cancelled) return;
        setNodes(symmetrize(n));
        setMessages(sortAndCap(s));
        setLastUpdate(new Date().toISOString());
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Telemetry link failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(async () => {
      if (USE_MOCK_DATA) {
        const next = simulateTick(nodesRef.current);
        setNodes(next);
        if (Math.random() < 0.3) {
          setMessages((prev) => [generateMockSOS(next), ...prev].slice(0, 40));
        }
        setLastUpdate(new Date().toISOString());
        return;
      }
      try {
        const [n, s] = await Promise.all([fetchNodes(), fetchSOSMessages()]);
        setNodes(n);
        setMessages([...s].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)));
        setLastUpdate(new Date().toISOString());
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Telemetry link failed");
      }
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return { nodes, messages, lastUpdate, error, loading, links: meshLinks(nodes) };
}
