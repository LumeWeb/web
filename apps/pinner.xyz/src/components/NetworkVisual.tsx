import { useEffect, useRef, useCallback, useReducer } from "react";
import { Server, HardDrive, Globe, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";

interface NetworkVisualProps {
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const INFLUENCE_RADIUS = 35;
const MAX_REPULSE = 4;

const HOST_COUNT = 8;          /* total provider nodes */
const ACTIVE_COUNT = 4;        /* visible active providers */

/* Phase durations in seconds */
const D = {
  STABLE:  8,
  FAILING: 3,
  HEALING: 2.5,
  RESYNC:  2.5,
};

const dist2D = (ax: number, ay: number, bx: number, by: number) =>
  Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);

const angle2D = (ax: number, ay: number, bx: number, by: number) =>
  (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;

/** Generate random float animation params for a node */
const createFloat = (baseAmpX = 2, baseAmpY = 1.5) => ({
  freqX: 0.45 + Math.random() * 0.15,
  freqY: 0.40 + Math.random() * 0.15,
  ampX: baseAmpX + Math.random(),
  ampY: baseAmpY + Math.random(),
  phaseX: Math.random() * 6,
  phaseY: Math.random() * 6,
});

/** Try to find a non-overlapping position for a new host, clamped to safe bounds */
const findHostPosition = (existing: NodeSpec[], minDist = 14) => {
  let attempts = 0;
  let baseX = 50;
  let baseY = 48;
  let valid = false;

  /* "You" node position (fixed) */
  const userX = 50;
  const userY = 90;
  const minUserDist = 22; /* Keep well clear of the user node */

  /* Safe bounds: keep node center + max float amplitude + node radius inside container.
     Node radius ~7% (w-10 = 40px / ~600px container ≈ 6.7%).
     Max drift from float: ampX ≈ 3.5, ampY ≈ 2.5.
     Mouse repulse: MAX_REPULSE = 4.  */
  const SAFE_PAD = 12; /* percentage padding from each edge */

  while (!valid && attempts < 200) {
    /* Spawn in upper 225° arc, keeping clear of "You" at bottom */
    const angle = Math.random() * Math.PI * 1.25 - Math.PI * 0.625;
    const radius = 28 + Math.random() * 18;
    baseX = 50 + Math.cos(angle) * radius;
    baseY = 48 + Math.sin(angle) * radius;

    /* Clamp to safe bounds */
    baseX = Math.max(SAFE_PAD, Math.min(100 - SAFE_PAD, baseX));
    baseY = Math.max(SAFE_PAD, Math.min(100 - SAFE_PAD, baseY));

    valid = true;
    /* Don't overlap other hosts */
    for (const n of existing) {
      if (dist2D(baseX, baseY, n.baseX, n.baseY) < minDist) {
        valid = false;
        break;
      }
    }
    /* Don't overlap "You" node */
    if (valid && dist2D(baseX, baseY, userX, userY) < minUserDist) {
      valid = false;
    }
    attempts++;
  }

  /* Fallback: force spawn far from "You", clamped to bounds */
  if (!valid) {
    baseX = Math.max(SAFE_PAD, Math.min(100 - SAFE_PAD, 50 + (Math.random() > 0.5 ? 1 : -1) * (25 + Math.random() * 15)));
    baseY = Math.max(SAFE_PAD, Math.min(100 - SAFE_PAD, 20 + Math.random() * 25));
  }

  return { baseX, baseY };
};

/* ------------------------------------------------------------------ */
/*  Node Data                                                          */
/* ------------------------------------------------------------------ */

interface NodeSpec {
  id: string;
  baseX: number;
  baseY: number;
  label: string;
  type: "center" | "host" | "user";
  float: { freqX: number; freqY: number; ampX: number; ampY: number; phaseX: number; phaseY: number };
}

const makeHost = (i: number): NodeSpec => {
  /* Two-row layout: upper row (0-3) at radius 25, mid row (4-7) at radius 38
   * Both rows stay in upper 240-270° arc, well clear of "You" at bottom */
  const row = i < 4 ? 0 : 1;
  const idxInRow = i % 4;
  const radius = row === 0 ? 25 : 38;
  const arc = row === 0 ? 240 : 270; /* degrees */
  const startAngle = -120 * Math.PI / 180;
  const angle = startAngle + (idxInRow / 3) * (arc * Math.PI / 180);
  return {
    id: `h${i + 1}`,
    baseX: 50 + Math.cos(angle) * radius,
    baseY: 48 + Math.sin(angle) * radius,
    label: `Provider ${i + 1}`,
    type: "host",
    float: createFloat(2, 1.5),
  };
};

const ALL: NodeSpec[] = [
  { id: "c", baseX: 50, baseY: 48, label: "Pinner", type: "center", float: { freqX: 0.40, freqY: 0.35, ampX: 2.0, ampY: 1.5, phaseX: 0, phaseY: 1.2 } },
  { id: "u", baseX: 50, baseY: 90, label: "You",     type: "user",   float: { freqX: 0.35, freqY: 0.40, ampX: 1.5, ampY: 1.2, phaseX: 1.0, phaseY: 0.3 } },
  ...Array.from({ length: HOST_COUNT }, (_, i) => makeHost(i)),
];

const HOST_IDS = Array.from({ length: HOST_COUNT }, (_, i) => `h${i + 1}`);

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const NetworkVisual = ({ className }: NetworkVisualProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  /* Force re-render without storing meaningful state */
  const [, forceRender] = useReducer(x => x + 1, 0);

  /* DOM refs */
  const nodeEls = useRef<Record<string, HTMLDivElement | null>>({});
  const lineEls = useRef<Record<string, HTMLDivElement | null>>({});
  const fragEls = useRef<HTMLDivElement[]>([]);
  const badgeEl = useRef<HTMLDivElement>(null);

  /* Mutable state machine */
  const active = useRef<string[]>(["h1", "h2", "h3", "h4"]);
  const failed = useRef<string | null>(null);
  const repl   = useRef<string | null>(null);
  const nextProviderIdx = useRef(HOST_COUNT + 1);  /* Provider 9, 10, 11... */
  const allHostIds = useRef<Set<string>>(new Set(HOST_IDS)); /* Track all hosts ever created */
  const allNodes = useRef<NodeSpec[]>([...ALL]); /* Component-scoped copy to avoid module mutation */

  /* Mouse */
  const mouse = useRef({ x: 0, y: 0, active: false });

  /* ---- Ambient Float Ticker (runs always) ---- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mouse.current = {
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
        active: true,
      };
    };
    const onLeave = () => { mouse.current.active = false; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    const t0 = gsap.ticker.time;
    const tick = () => {
      const t = gsap.ticker.time - t0;
      const m = mouse.current;
      const visible = new Set(["c", "u", ...active.current]);
      if (repl.current) visible.add(repl.current);
      if (failed.current) visible.add(failed.current);

      for (const n of allNodes.current) {
        if (!visible.has(n.id)) continue;
        const dom = nodeEls.current[n.id];
        if (!dom) continue;

        let x = n.baseX + Math.sin(t * n.float.freqX + n.float.phaseX) * n.float.ampX;
        let y = n.baseY + Math.cos(t * n.float.freqY + n.float.phaseY) * n.float.ampY;

        /* Clamp to safe bounds; account for node radius (~5% at w-10 / 420px container)
           plus float amplitude (~3.5% x, ~2.5% y) plus mouse repulse (MAX_REPULSE=4%).
           Use 8% pad to ensure nodes never clip container edges. */
        const SAFE_PAD = 8;
        x = Math.max(SAFE_PAD, Math.min(100 - SAFE_PAD, x));
        y = Math.max(SAFE_PAD, Math.min(100 - SAFE_PAD, y));

        /* Keep nodes away from the top-right badge area (badge ~100px at 420px = ~24% width) */
        const BADGE_RIGHT = 28; /* right edge of badge area */
        const BADGE_BOTTOM = 8; /* bottom edge of badge area */
        if (x > 100 - BADGE_RIGHT && y < BADGE_BOTTOM) {
          /* Push node down-and-left, away from badge */
          const dx = (x - (100 - BADGE_RIGHT)) / BADGE_RIGHT; /* 0 to 1 */
          const dy = (BADGE_BOTTOM - y) / BADGE_BOTTOM; /* 0 to 1 */
          const pushStrength = Math.min(1, Math.sqrt(dx * dx + dy * dy));
          x -= pushStrength * 6;
          y += pushStrength * 6;
          /* Re-clamp after push */
          x = Math.max(SAFE_PAD, Math.min(100 - SAFE_PAD, x));
          y = Math.max(SAFE_PAD, Math.min(100 - SAFE_PAD, y));
        }

        if (m.active) {
          const d = dist2D(x, y, m.x, m.y);
          if (d < INFLUENCE_RADIUS && d > 0.1) {
            const f = (1 - d / INFLUENCE_RADIUS) * MAX_REPULSE;
            x += ((x - m.x) / d) * f;
            y += ((y - m.y) / d) * f;
          }
        }

        dom.style.transform = `translate(calc(${x - n.baseX}% - 50%), calc(${y - n.baseY}% - 50%))`;
        (dom as any)._pos = { x, y };
      }

      /* Update lines */
      const targets = [...active.current, "u"];
      if (repl.current) targets.push(repl.current);
      for (const tid of targets) {
        const line = lineEls.current[`c-${tid}`];
        const fromEl = nodeEls.current["c"] as any;
        const toEl = nodeEls.current[tid] as any;
        if (!line || !fromEl?._pos || !toEl?._pos) continue;
        const a = fromEl._pos;
        const b = toEl._pos;
        line.style.left = `${a.x}%`;
        line.style.top = `${a.y}%`;
        line.style.width = `${dist2D(a.x, a.y, b.x, b.y)}%`;
        line.style.transform = `rotate(${angle2D(a.x, a.y, b.x, b.y)}deg)`;
      }
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  /* ---- Narrative Timeline ---- */
  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

    /* STABLE */
    tl.to({}, {
      duration: D.STABLE,
      onStart: () => setBadge("", ""),
    });

    /* FAILING */
    tl.call(() => {
      /* Pick victim from ALL hosts that have ever existed, not just currently active */
      const pool = Array.from(allHostIds.current).filter(id => active.current.includes(id));
      const victim = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : active.current[Math.floor(Math.random() * active.current.length)];
      failed.current = victim;
      forceRender();
      setBadge("Provider Failure Detected", "red");

      const dom = nodeEls.current[victim];
      if (dom) {
        gsap.to(dom.querySelector(".node-circle"), {
          borderColor: "rgba(239,68,68,0.9)",
          backgroundColor: "rgba(239,68,68,0.35)",
          duration: 0.25,
          yoyo: true,
          repeat: 7,
        });

        const pos = (dom as any)._pos || { x: 50, y: 50 };
        for (let i = 0; i < 6; i++) {
          const frag = fragEls.current[i];
          if (!frag) continue;
          gsap.set(frag, { left: `${pos.x}%`, top: `${pos.y}%`, opacity: 1, scale: 1 });
          const ang = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
          const spd = 18 + Math.random() * 22;
          gsap.to(frag, {
            left: `${pos.x + Math.cos(ang) * spd}%`,
            top: `${pos.y + Math.sin(ang) * spd}%`,
            opacity: 0,
            scale: 0,
            duration: D.FAILING,
            ease: "power3.out",
          });
        }

        gsap.to(dom, { opacity: 0.15, scale: 0.7, duration: D.FAILING, ease: "power2.in" });
      }
    });
    tl.to({}, { duration: D.FAILING });

    /* HEALING */
    tl.call(() => {
      const idx = nextProviderIdx.current++;
      const rid = `h${idx}`;
      repl.current = rid;
      forceRender();
      setBadge("Finding Replacement...", "emerald");

  /* Add new host to allNodes if not present */
      if (!allNodes.current.find(n => n.id === rid)) {
        const { baseX, baseY } = findHostPosition(allNodes.current);

        allNodes.current.push({
          id: rid,
          baseX,
          baseY,
          label: `Provider ${idx}`,
          type: "host",
          float: createFloat(2, 1.5),
        });
        allHostIds.current.add(rid);
      }

      const dom = nodeEls.current[rid];
      if (dom) {
        gsap.set(dom, { opacity: 0, scale: 0.4 });
        gsap.to(dom, { opacity: 1, scale: 1, duration: D.HEALING, ease: "back.out(1.7)" });
      }

      const line = lineEls.current[`c-${rid}`];
      if (line) gsap.to(line, { opacity: 0.8, duration: D.HEALING });
    });
    tl.to({}, { duration: D.HEALING });

    /* RESYNC */
    tl.call(() => {
      setBadge("Resyncing Data...", "orange");
      /* Ensure React has re-rendered and the replacement line exists */
      requestAnimationFrame(() => {
        const line = lineEls.current[`c-${repl.current}`];
        if (line) {
          /* Draw the line from 0 to full width */
          const fullWidth = line.style.width || "100%";
          gsap.fromTo(line,
            { width: "0%", opacity: 0.8 },
            { width: fullWidth, opacity: 0.8, duration: 0.6, ease: "power2.out" }
          );

          for (let i = 0; i < 3; i++) {
            const pkt = document.createElement("span");
            pkt.className = "absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400";
            line.appendChild(pkt);
            gsap.fromTo(pkt,
              { left: "0%", opacity: 0 },
              { left: "100%", opacity: 1, duration: 1.0, delay: 0.3 + i * 0.35, ease: "power2.in", onComplete: () => pkt.remove() }
            );
          }
        }
      });
    });
    tl.to({}, { duration: D.RESYNC });

    /* CLEANUP */
    tl.call(() => {
      const f = failed.current;
      const r = repl.current;
      if (f && r) {
        active.current = active.current.map(id => id === f ? r : id);
      }
      /* Reset failed node visuals and prune from collections to prevent unbounded growth */
      if (f) {
        const fdom = nodeEls.current[f];
        if (fdom) gsap.set(fdom, { opacity: 1, scale: 1, transform: "" });
        allNodes.current = allNodes.current.filter(n => n.id !== f);
        allHostIds.current.delete(f);
        delete nodeEls.current[f];
        delete lineEls.current[`c-${f}`];
      }
      if (r) {
        const rdom = nodeEls.current[r];
        if (rdom) {
          gsap.set(rdom.querySelector(".node-circle"), { borderColor: "", backgroundColor: "" });
        }
      }
      failed.current = null;
      repl.current = null;
      setBadge("", "");
      forceRender();
    });

    return () => { tl.kill(); };
  }, []);

  /* Badge helper */
  const setBadge = useCallback((text: string, color?: string) => {
    const b = badgeEl.current;
    if (!b) return;
    if (!text) { b.style.opacity = "0"; return; }
    b.textContent = text;
    b.style.opacity = "1";
    b.className = cn(
      "absolute top-0 right-0 z-10 text-[10px] font-medium tracking-wider uppercase rounded-full px-2.5 py-1 transition-opacity duration-300 border",
      color === "red"     ? "text-red-400     bg-red-500/10     border-red-500/25" :
      color === "emerald" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" :
      color === "orange"  ? "text-orange-400  bg-orange-500/10  border-orange-500/25" :
      "text-white/50 bg-white/5 border-white/10"
    );
  }, []);

  /* ---- Render ---- */
  const visibleIds = new Set(["c", "u", ...active.current]);
  if (repl.current) visibleIds.add(repl.current);
  if (failed.current) visibleIds.add(failed.current);

  /* All possible connection targets: active + user + any potential replacement */
  const lineTargets = [...active.current, "u"];
  if (repl.current) lineTargets.push(repl.current);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full max-w-[420px] aspect-square mx-auto select-none cursor-crosshair",
        "hidden md:block",
        className
      )}
    >
      {/* Status badge */}
      <div ref={badgeEl} className="absolute top-0 right-0 z-10 opacity-0 transition-opacity duration-300" />

      {/* Lines: render all potential connections, control visibility with GSAP */}
      {lineTargets.filter(Boolean).map(tid => {
        const isReplLine = tid === repl.current;
        return (
          <div
            key={`line-${tid}`}
            ref={el => { lineEls.current[`c-${tid}`] = el; }}
            className="absolute h-[1px] origin-left"
            style={{
              background: isReplLine
                ? "linear-gradient(90deg, rgba(16,185,129,0.5), rgba(16,185,129,0.05))"
                : "linear-gradient(90deg, rgba(249,115,22,0.3), rgba(255,255,255,0.05))",
              opacity: isReplLine ? 0 : 0.7,
            }}
          >
            {/* Ambient packet */}
            <span
              className={cn(
                "absolute top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full",
                isReplLine ? "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]" : "bg-orange-400/80"
              )}
              style={{
                animation: `packetTravel ${2.5 + Math.random() * 2}s linear infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          </div>
        );
      })}

      {/* Nodes */}
      {allNodes.current.map(node => {
        if (!visibleIds.has(node.id)) return null;
        const isCenter = node.type === "center";
        const isUser   = node.type === "user";
        const isFailed = node.id === failed.current;
        const isRepl   = node.id === repl.current;

        const nodeClasses = cn(
          "node-circle relative flex items-center justify-center rounded-full transition-colors duration-300",
          isCenter ? "w-14 h-14 bg-orange-500/15 border-2 border-orange-400/40" :
          isUser   ? "w-11 h-11 bg-white/[0.06] border border-white/15" :
          isFailed ? "w-10 h-10 bg-red-500/20 border-2 border-red-500/50" :
          isRepl   ? "w-10 h-10 bg-emerald-500/20 border-2 border-emerald-400/60" :
                     "w-10 h-10 bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
        );

        const labelClasses = cn("text-[9px] font-medium tracking-widest uppercase text-center leading-tight max-w-[60px]",
          isCenter ? "text-orange-400/80" :
          isUser   ? "text-orange-300/50" :
          isFailed ? "text-red-400/80" :
          isRepl   ? "text-emerald-400/80" :
                     "text-white/25"
        );

        return (
          <div
            key={node.id}
            ref={el => { nodeEls.current[node.id] = el; }}
            className="absolute flex flex-col items-center gap-1 will-change-transform"
            style={{ left: `${node.baseX}%`, top: `${node.baseY}%` }}
          >
            <div className={nodeClasses}>
              {isCenter && <Server className="w-6 h-6 text-orange-400" />}
              {isUser   && <Globe className="w-5 h-5 text-orange-300/70" />}
              {isFailed && <Zap className="w-4 h-4 text-red-400 animate-pulse" />}
              {(!isCenter && !isUser && !isFailed) && (
                <HardDrive className={cn("w-4 h-4", isRepl ? "text-emerald-400" : "text-white/35")} />
              )}

              {isCenter && (
                <>
                  <span className="absolute inset-0 rounded-full border border-orange-400/20 animate-ping-slow" />
                  <span className="absolute -inset-3 rounded-full border border-orange-400/10 animate-ping-slower" style={{ animationDelay: "0.5s" }} />
                </>
              )}
              {isFailed && (
                <span className="absolute -inset-1 rounded-full border border-red-500/30 animate-ping-fast" />
              )}
            </div>
            <span className={labelClasses}>
              {node.label}
            </span>
          </div>
        );
      })}

      {/* Death fragments */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`frag-${i}`}
          ref={el => { if (el) fragEls.current[i] = el; }}
          className="absolute rounded-full bg-red-400/70 pointer-events-none"
          style={{ width: "6px", height: "6px", left: "50%", top: "50%", opacity: 0 }}
        />
      ))}
    </div>
  );
};

export default NetworkVisual;
