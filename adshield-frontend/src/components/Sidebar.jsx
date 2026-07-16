import { LayoutDashboard, Radar, ShieldAlert, ListTree, Settings2, LogOut, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import BrandMark from "./BrandMark";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "traffic", label: "Traffic", icon: Radar },
  { key: "fraud", label: "Fraud", icon: ShieldAlert },
  { key: "honeypot", label: "Honeypot", icon: ListTree },
  { key: "settings", label: "Settings", icon: Settings2 },
];

export default function Sidebar({ onLogout, onNavigate, connected, section = "overview" }) {
  function select(key) {
    onNavigate?.(key);
  }

  return (
    <aside className="hidden md:flex w-[4.75rem] xl:w-64 shrink-0 flex-col border-r border-line-soft bg-ink-soft/80 backdrop-blur-2xl relative z-10">
      <div className="flex items-center justify-between gap-2 px-3 xl:px-4 h-16 border-b border-line-soft">
        <Link to="/" className="flex items-center gap-2.5 min-w-0 mx-auto xl:mx-0">
          <BrandMark size={28} />
          <div className="min-w-0 hidden xl:block">
            <p className="font-display font-bold tracking-tight leading-none truncate">AdShield</p>
            <p className="text-[10px] font-mono text-text-faint mt-1 uppercase tracking-wider flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-safe animate-blink" : "bg-text-faint"}`} />
              console
            </p>
          </div>
        </Link>
        <div className="hidden xl:block">
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 xl:px-3 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = section === item.key;
          return (
            <motion.button
              key={item.key}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => select(item.key)}
              title={item.label}
              className={`relative w-full flex items-center gap-2.5 rounded-xl px-2.5 xl:px-3 py-2.5 text-sm transition-all ${
                isActive
                  ? "bg-panel text-text border border-line-soft shadow-[0_0_24px_color-mix(in_srgb,var(--color-signal)_12%,transparent)]"
                  : "text-text-muted hover:text-text hover:bg-panel/40"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-glow"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-full bg-signal"
                />
              )}
              <Icon size={17} strokeWidth={1.8} className={isActive ? "text-signal mx-auto xl:mx-0" : "mx-auto xl:mx-0"} />
              <span className="hidden xl:inline">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      <div className="p-2 xl:p-3 border-t border-line-soft space-y-1">
        <div className="xl:hidden flex justify-center pb-1">
          <ThemeToggle />
        </div>
        <Link
          to="/"
          title="Home"
          className="w-full flex items-center gap-2.5 rounded-xl px-2.5 xl:px-3 py-2.5 text-sm text-text-muted hover:text-text hover:bg-panel/40 transition-colors"
        >
          <Home size={17} strokeWidth={1.8} className="mx-auto xl:mx-0" />
          <span className="hidden xl:inline">Home</span>
        </Link>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onLogout}
          title="Log out"
          className="w-full flex items-center gap-2.5 rounded-xl px-2.5 xl:px-3 py-2.5 text-sm text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut size={17} strokeWidth={1.8} className="mx-auto xl:mx-0" />
          <span className="hidden xl:inline">Log out</span>
        </motion.button>
      </div>
    </aside>
  );
}
