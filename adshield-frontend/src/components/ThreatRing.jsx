import { motion } from "framer-motion";
import { useMemo } from "react";

/** Circular threat mix — unique to AdShield console. */
export default function ThreatRing({ legit = 0, suspicious = 0, bots = 0 }) {
  const total = Math.max(legit + suspicious + bots, 1);
  const parts = useMemo(() => {
    const l = (legit / total) * 100;
    const s = (suspicious / total) * 100;
    const b = (bots / total) * 100;
    return { l, s, b, fraud: Math.round(((suspicious + bots) / total) * 100) };
  }, [legit, suspicious, bots, total]);

  const gradient = `conic-gradient(var(--color-signal) 0% ${parts.l}%, var(--color-alert) ${parts.l}% ${parts.l + parts.s}%, var(--color-danger) ${parts.l + parts.s}% 100%)`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      className="instrument-panel rounded-2xl border border-line-soft bg-panel p-4 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-text-faint mb-0.5">Mix</p>
          <h3 className="font-display text-sm font-semibold tracking-tight">Threat ring</h3>
        </div>
        <span className="font-mono text-xs text-danger/90 rounded-full border border-danger/25 bg-danger/10 px-2 py-0.5">
          {parts.fraud}% risk
        </span>
      </div>
      <div className="flex-1 flex items-center justify-center py-2">
        <div className="relative h-40 w-40">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: gradient }}
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-[14px] rounded-full bg-panel flex flex-col items-center justify-center border border-line-soft">
            <span className="font-mono text-3xl font-semibold tabular-nums text-signal">{total}</span>
            <span className="text-[10px] font-mono text-text-faint uppercase tracking-wider">events</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
        <div><span className="text-signal">●</span> {legit}</div>
        <div><span className="text-alert">●</span> {suspicious}</div>
        <div><span className="text-danger">●</span> {bots}</div>
      </div>
    </motion.div>
  );
}
