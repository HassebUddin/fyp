import { motion } from "framer-motion";

/** Soft orbiting rings behind the console — unique, not a stock photo. */
export default function ConsoleOrbitBg() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      <div className="absolute -left-24 top-1/4 h-[520px] w-[520px] rounded-full border border-signal/10" />
      <div className="absolute -left-10 top-[28%] h-[420px] w-[420px] rounded-full border border-copper/10" />
      <motion.div
        className="absolute -right-32 -top-20 h-[480px] w-[480px] rounded-full bg-signal/5 blur-3xl"
        animate={{ opacity: [0.25, 0.55, 0.25], scale: [1, 1.06, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[10%] bottom-[-10%] h-[360px] w-[360px] rounded-full bg-copper/10 blur-3xl"
        animate={{ opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute left-[35%] top-[12%] h-2 w-2 rounded-full bg-signal/70"
        animate={{ y: [0, 14, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 4.2, repeat: Infinity }}
      />
      <motion.div
        className="absolute right-[22%] top-[40%] h-1.5 w-1.5 rounded-full bg-danger/80"
        animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 3.4, repeat: Infinity, delay: 0.6 }}
      />
    </div>
  );
}
