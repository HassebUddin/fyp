import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";

function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    let raf;
    function step(ts) {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * (Number(target) || 0)));
      if (progress < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export default function StatCard({ icon: Icon, label, value, suffix = "", tone = "signal", delay = 0, onClick }) {
  const animated = useCountUp(value);
  const controls = useAnimationControls();
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;
    controls.start({
      scale: [1, 1.04, 1],
      boxShadow: [
        "0 0 0 0 transparent",
        "0 0 0 1px color-mix(in srgb, var(--color-signal) 35%, transparent)",
        "0 0 0 0 transparent",
      ],
      transition: { duration: 0.55 },
    });
  }, [value, controls]);

  const toneClasses = {
    signal: "text-signal bg-signal/10 border-signal/25",
    alert: "text-alert bg-alert/10 border-alert/25",
    danger: "text-danger bg-danger/10 border-danger/25",
    safe: "text-copper bg-copper/10 border-copper/25",
  }[tone];

  const glow = {
    signal: "from-signal/25",
    alert: "from-alert/25",
    danger: "from-danger/30",
    safe: "from-copper/30",
  }[tone];

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative text-left rounded-2xl bg-panel/90 border border-line-soft p-4 w-full overflow-hidden"
    >
      <motion.div animate={controls} className="relative z-[1]">
        <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${glow} to-transparent blur-2xl opacity-70 group-hover:opacity-100 transition-opacity`} />
        <span className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl border ${toneClasses}`}>
          <Icon size={16} strokeWidth={1.8} />
        </span>
        <p className="relative mt-4 font-mono text-3xl tracking-tight tabular-nums font-semibold">
          {animated.toLocaleString()}
          {suffix && <span className="text-sm text-text-muted font-medium ml-0.5">{suffix}</span>}
        </p>
        <p className="relative mt-0.5 text-[11px] font-mono uppercase tracking-wider text-text-faint">{label}</p>
      </motion.div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-signal/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}
