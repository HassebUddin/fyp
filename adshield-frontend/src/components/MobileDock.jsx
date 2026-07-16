import { LayoutDashboard, Radar, ShieldAlert, ListTree, Settings2 } from "lucide-react";
import { motion } from "framer-motion";

const ITEMS = [
  { key: "overview", icon: LayoutDashboard, label: "Home" },
  { key: "traffic", icon: Radar, label: "Live" },
  { key: "fraud", icon: ShieldAlert, label: "Fraud" },
  { key: "honeypot", icon: ListTree, label: "Trap" },
  { key: "settings", icon: Settings2, label: "More" },
];

export default function MobileDock({ section, onNavigate }) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-line-soft bg-ink/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around px-1 pt-1.5 pb-1.5">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = section === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`relative flex flex-col items-center gap-0.5 min-w-[3.5rem] py-1 text-[10px] font-mono ${
                active ? "text-signal" : "text-text-faint"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="dock-glow"
                  className="absolute -top-1.5 h-0.5 w-6 rounded-full bg-signal"
                />
              )}
              <Icon size={18} strokeWidth={active ? 2.2 : 1.7} />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
