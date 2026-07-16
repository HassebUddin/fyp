import { Activity, Code2, Radio } from "lucide-react";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

export default function Topbar({ storeName, platform, connected, onInstall }) {
  const initials = storeName
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "AS";

  return (
    <header className="h-14 border-b border-line-soft flex items-center justify-between px-4 md:px-6 bg-ink/80 backdrop-blur-xl sticky top-0 z-10 relative">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-signal/40 to-transparent" />

      <div className="min-w-0 flex items-center gap-3">
        <div className="relative hidden sm:block">
          <span className="absolute inset-0 rounded-full bg-copper/20 animate-pulse-ring" />
          <div className="relative w-9 h-9 rounded-full bg-copper/15 border border-copper/35 text-copper flex items-center justify-center text-[10px] font-bold font-mono">
            {initials}
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-display font-semibold tracking-tight truncate">{storeName || "Store"}</p>
          <p className="text-[11px] font-mono text-text-faint capitalize truncate flex items-center gap-1.5">
            <Radio size={10} className={connected ? "text-safe" : ""} />
            {platform || "—"} · command deck
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.span
          animate={connected ? { boxShadow: ["0 0 0 0 transparent", "0 0 16px color-mix(in srgb, var(--color-safe) 35%, transparent)", "0 0 0 0 transparent"] } : {}}
          transition={{ duration: 2.4, repeat: Infinity }}
          className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono rounded-full px-2.5 py-1 border ${
            connected ? "text-safe border-safe/30 bg-safe/10" : "text-text-faint border-line-soft"
          }`}
        >
          <Activity size={11} />
          {connected ? "stream live" : "connecting"}
        </motion.span>
        {onInstall && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onInstall}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-soft px-3 py-1.5 text-xs hover:border-signal/40 hover:text-signal transition-colors"
          >
            <Code2 size={13} />
            Script
          </motion.button>
        )}
        <div className="md:hidden">
          <ThemeToggle />
        </div>
        <div className="sm:hidden w-8 h-8 rounded-full bg-copper/15 border border-copper/30 text-copper flex items-center justify-center text-[10px] font-bold font-mono">
          {initials}
        </div>
      </div>
    </header>
  );
}
