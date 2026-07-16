import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Bot, ShieldAlert, Users } from "lucide-react";

const META = {
  bot: { icon: Bot, label: "Bot trapped", cls: "border-danger/40 bg-danger/15 text-danger" },
  suspicious: { icon: ShieldAlert, label: "Suspicious", cls: "border-alert/40 bg-alert/15 text-alert" },
  legit: { icon: Users, label: "Visitor", cls: "border-signal/40 bg-signal/15 text-signal" },
};

export default function LiveCatchToast({ event }) {
  const [visible, setVisible] = useState(null);

  useEffect(() => {
    if (!event) return;
    setVisible(event);
    const t = setTimeout(() => setVisible(null), 3200);
    return () => clearTimeout(t);
  }, [event]);

  const meta = META[visible?.label] || META.legit;
  const Icon = meta.icon;

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[90] w-[min(320px,calc(100vw-2rem))]">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${meta.cls}`}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-ink/30">
                <Icon size={16} />
              </span>
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold tracking-tight">{meta.label}</p>
                <p className="truncate font-mono text-[11px] opacity-80">{visible.ip || "—"}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
