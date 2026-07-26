import { useState, useEffect, useCallback, useRef } from "react";

export type Phase = "online" | "offline" | "recovering";

export interface NodeState {
  id: number;
  phase: Phase;
  health: number;
}

interface PacketPath {
  id: number;
  fromNode: number;
}

const PHASE_DURATIONS: Record<Phase, number> = {
  online: 0,
  offline: 2500,
  recovering: 1200,
};

const NEXT_PHASE: Record<Phase, Phase> = {
  online: "offline",
  offline: "recovering",
  recovering: "online",
};

export function useNodeGrid(nodeCount = 6, failThreshold = 3) {
  const [nodes, setNodes] = useState<NodeState[]>(() =>
    Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      phase: "online" as Phase,
      health: 100,
    }))
  );
  const [loading, setLoading] = useState(false);
  const [packetPaths, setPacketPaths] = useState<PacketPath[]>([]);
  const packetIdRef = useRef(0);
  const phaseTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  // Keep a ref in sync so intervals can read current nodes without nesting setState
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Cleanup on unmount
  useEffect(() => () => {
    phaseTimers.current.forEach(clearTimeout);
    phaseTimers.current.clear();
  }, []);

  const transitionNode = useCallback((id: number, to: Phase) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const health = to === "online" ? 100 : 0;
        return { ...n, phase: to, health };
      })
    );

    if (PHASE_DURATIONS[to] > 0) {
      const next = NEXT_PHASE[to];
      const timer = setTimeout(() => transitionNode(id, next), PHASE_DURATIONS[to]);
      phaseTimers.current.set(id, timer);
    } else {
      phaseTimers.current.delete(id);
    }
  }, []);

  const triggerNodeFailure = useCallback(() => {
    const candidates = nodesRef.current.filter((n) => n.phase === "online");
    if (candidates.length <= failThreshold) return;

    const target = candidates[Math.floor(Math.random() * candidates.length)];
    transitionNode(target.id, "offline");
  }, [transitionNode, failThreshold]);

  // Periodic failure cycle
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.4) triggerNodeFailure();
    }, 5000);
    return () => clearInterval(interval);
  }, [triggerNodeFailure]);

  // Data packet loop — reads from ref, no nested setState
  useEffect(() => {
    const packetTimers = new Set<ReturnType<typeof setTimeout>>();
    const pushTimer = (cb: () => void, delay: number) => {
      const id = setTimeout(() => {
        cb();
        packetTimers.delete(id);
      }, delay);
      packetTimers.add(id);
    };
    const interval = setInterval(() => {
      const activeNodes = nodesRef.current.filter((n) => n.phase === "online");
      if (activeNodes.length === 0) return;

      const source = activeNodes[Math.floor(Math.random() * activeNodes.length)];
      const packetId = packetIdRef.current++;

      setPacketPaths((pp) => [...pp, { id: packetId, fromNode: source.id }]);
      setLoading(true);

      pushTimer(() => {
        setPacketPaths((pp) => pp.filter((p) => p.id !== packetId));
      }, 1500);

      pushTimer(() => setLoading(false), 800);
    }, 600);
    return () => {
      clearInterval(interval);
      packetTimers.forEach(clearTimeout);
    };
  }, []);

  const activeCount = nodes.filter((n) => n.phase === "online").length;
  const totalCount = nodes.length;

  return { nodes, loading, packetPaths, activeCount, totalCount };
}
