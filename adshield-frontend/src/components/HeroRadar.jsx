import { motion } from "framer-motion";
import { useMemo, useState } from "react";

/** Interactive honeypot radar — drawn geometry, no stock art. */
export default function HeroRadar() {
  const [angle, setAngle] = useState(0);
  const dots = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        r: 28 + (i % 5) * 12,
        a: (i * 47) % 360,
        bot: i % 5 === 0,
      })),
    []
  );

  return (
    <motion.div
      className="relative aspect-square w-full max-w-[420px] mx-auto"
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const deg = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
        setAngle(deg);
      }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-0 rounded-full border border-line-soft bg-panel/40 backdrop-blur-md instrument-ring" />
      {[0.92, 0.68, 0.44, 0.22].map((s) => (
        <div
          key={s}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line/80"
          style={{ width: `${s * 100}%`, height: `${s * 100}%` }}
        />
      ))}

      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from ${angle}deg, color-mix(in srgb, var(--color-signal) 35%, transparent), transparent 42%)`,
          maskImage: "radial-gradient(circle, transparent 12%, black 13%)",
        }}
      />

      {dots.map((d) => {
        const rad = (d.a * Math.PI) / 180;
        const x = 50 + Math.cos(rad) * d.r * 0.85;
        const y = 50 + Math.sin(rad) * d.r * 0.85;
        return (
          <motion.span
            key={d.id}
            className={`absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${
              d.bot ? "bg-danger shadow-[0_0_10px_var(--color-danger)]" : "bg-signal/80"
            }`}
            style={{ left: `${x}%`, top: `${y}%` }}
            animate={{ opacity: [0.35, 1, 0.35], scale: d.bot ? [1, 1.4, 1] : [1, 1.1, 1] }}
            transition={{ duration: 2.4 + (d.id % 3) * 0.4, repeat: Infinity, delay: d.id * 0.12 }}
          />
        );
      })}

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inset-0 rounded-full bg-signal/25 animate-pulse-ring" />
        <span className="relative block h-3 w-3 rounded-full bg-signal shadow-[0_0_18px_var(--color-signal)]" />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-line-soft bg-ink/70 px-3 py-1 font-mono text-[10px] tracking-widest text-text-muted backdrop-blur">
        MOVE · SWEEP
      </div>
    </motion.div>
  );
}
