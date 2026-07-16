import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Signature widget: "Live Trap Radar".
// A literal read of the product's own mechanism — the honeypot sits at the
// centre, visitor traffic orbits at a distance. Orbiting dots are ambient
// (decorative motion only); the trapped count and each catch animation are
// driven by real honeypot_hit events from the backend via `trapped` and
// `catchSignal` — bump `catchSignal` any time a new one arrives.
// ---------------------------------------------------------------------------

const TYPE_WEIGHTS = [
  ["legit", 0.78],
  ["suspicious", 0.14],
  ["bot", 0.08],
];

function rollType() {
  const r = Math.random();
  let acc = 0;
  for (const [type, weight] of TYPE_WEIGHTS) {
    acc += weight;
    if (r <= acc) return type;
  }
  return "legit";
}

function makeDot(id) {
  return {
    id,
    angle: Math.random() * 360,
    dist: 0.42 + Math.random() * 0.52,
    type: rollType(),
    driftDelay: Math.random() * 6,
  };
}

const DOT_COUNT = 11;
const TYPE_COLOR = {
  legit: "var(--color-signal)",
  suspicious: "var(--color-alert)",
  bot: "var(--color-danger)",
};

export default function TrapRadar({ trapped = 0, catchSignal = 0 }) {
  const [dots, setDots] = useState(() =>
    Array.from({ length: DOT_COUNT }, (_, i) => makeDot(`d${i}`))
  );
  const [caughtId, setCaughtId] = useState(null);
  const nextId = useRef(DOT_COUNT);
  const dotsRef = useRef(dots);
  dotsRef.current = dots;
  const lastSignal = useRef(catchSignal);

  // Fires a real catch animation whenever the backend reports a new
  // honeypot hit (catchSignal increments). Falls back to spawning a bot
  // dot on the spot if none are currently orbiting, so the animation
  // always has something to "catch".
  useEffect(() => {
    if (catchSignal === lastSignal.current) return;
    lastSignal.current = catchSignal;

    const current = dotsRef.current;
    let target = current.find((d) => d.type === "bot");
    if (!target) {
      target = { ...makeDot(`d${nextId.current}`), type: "bot" };
      nextId.current += 1;
      setDots((prev) => [...prev, target]);
    }
    const targetId = target.id;
    setCaughtId(targetId);

    const timeout = setTimeout(() => {
      const fresh = makeDot(`d${nextId.current}`);
      nextId.current += 1;
      setDots((prev) => prev.filter((d) => d.id !== targetId).concat(fresh));
      setCaughtId(null);
    }, 650);

    return () => clearTimeout(timeout);
  }, [catchSignal]);

  const positioned = useMemo(
    () =>
      dots.map((d) => {
        const rad = (d.angle * Math.PI) / 180;
        const r = d.dist * 44;
        return {
          ...d,
          left: 50 + r * Math.cos(rad),
          top: 50 + r * Math.sin(rad),
        };
      }),
    [dots]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 relative z-[1]">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-text-faint mb-0.5">Honeypot</p>
          <h3 className="font-display text-sm font-semibold tracking-tight">Live trap radar</h3>
        </div>
        <div className="text-right rounded-xl border border-signal/20 bg-signal/5 px-3 py-1.5">
          <span className="font-mono text-2xl text-signal tabular-nums leading-none">{trapped}</span>
          <p className="text-[10px] text-text-faint font-mono mt-0.5">trapped</p>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] rounded-2xl bg-ink-soft border border-line-soft overflow-hidden instrument-ring">
        <div className="absolute inset-0 flex items-center justify-center">
          {[0.92, 0.66, 0.4].map((size) => (
            <div
              key={size}
              className="absolute rounded-full border border-line"
              style={{ width: `${size * 88}%`, height: `${size * 88}%` }}
            />
          ))}
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center animate-radar-sweep"
          style={{ transformOrigin: "50% 50%" }}
        >
          <div
            className="w-[44%] h-[44%] origin-bottom-right"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(53,232,201,0.28), rgba(53,232,201,0) 34%)",
            }}
          />
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute inset-0 rounded-full bg-signal/30 animate-pulse-ring" />
          <span className="relative flex h-3.5 w-3.5 rounded-full bg-signal shadow-[0_0_14px_2px_rgba(53,232,201,0.6)]" />
        </div>

        <AnimatePresence>
          {positioned.map((d) => {
            const isCaught = d.id === caughtId;
            return (
              <motion.div
                key={d.id}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: TYPE_COLOR[d.type],
                  boxShadow: d.type === "bot" ? "0 0 8px 1px rgba(255,93,108,0.7)" : "none",
                }}
                initial={{ left: `${d.left}%`, top: `${d.top}%`, opacity: 0, scale: 0 }}
                animate={
                  isCaught
                    ? { left: "50%", top: "50%", opacity: 0, scale: 1.8 }
                    : { left: `${d.left}%`, top: `${d.top}%`, opacity: 1, scale: 1 }
                }
                exit={{ opacity: 0, scale: 0 }}
                transition={
                  isCaught
                    ? { duration: 0.6, ease: "easeIn" }
                    : { duration: 0.5, delay: d.driftDelay * 0.05 }
                }
              />
            );
          })}
        </AnimatePresence>

        <div className="absolute bottom-2 left-3 flex gap-3 text-[10px] text-text-muted font-mono">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-signal inline-block" /> legit
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-alert inline-block" /> suspicious
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-danger inline-block" /> bot
          </span>
        </div>
      </div>
    </div>
  );
}
