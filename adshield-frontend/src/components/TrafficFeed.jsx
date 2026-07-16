import { motion, AnimatePresence } from "framer-motion";

const TYPE_LABEL = {
  legit: { text: "Legit", cls: "text-safe bg-safe/10 border-safe/30" },
  suspicious: { text: "Suspicious", cls: "text-alert bg-alert/10 border-alert/30" },
  bot: { text: "Bot", cls: "text-danger bg-danger/10 border-danger/30" },
};

function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 5) return "now";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h`;
}

function pathFrom(url) {
  if (!url) return "/";
  try {
    const u = new URL(url);
    return u.pathname || "/";
  } catch {
    return url;
  }
}

export default function TrafficFeed({
  events = [],
  connected = false,
  onSelect,
  compact = false,
  emptyText = "No events yet",
}) {
  const list = compact ? events.slice(0, 6) : events;

  return (
    <div className="rounded-2xl bg-panel/90 border border-line-soft overflow-hidden instrument-panel">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line-soft">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-text-faint mb-0.5">Stream</p>
          <h3 className="font-display text-sm font-semibold tracking-tight">Traffic</h3>
        </div>
        <span className={`flex items-center gap-1.5 text-[11px] font-mono rounded-full px-2 py-0.5 border ${
          connected ? "text-safe border-safe/30 bg-safe/10" : "text-text-faint border-line-soft"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-safe animate-blink" : "bg-text-faint"}`} />
          {connected ? "live" : "…"}
        </span>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-text-faint px-4 py-10 text-center">{emptyText}</p>
      ) : (
        <div className={`divide-y divide-line-soft ${compact ? "" : "max-h-[520px] overflow-y-auto"}`}>
          <AnimatePresence initial={false}>
            {list.map((e, i) => {
              const label = TYPE_LABEL[e.label] || TYPE_LABEL.legit;
              const key = e.id || `${e.created_at}-${i}`;
              return (
                <motion.button
                  type="button"
                  key={key}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full grid grid-cols-[1fr_auto_auto] gap-3 items-center px-4 py-3 text-left text-sm hover:bg-ink-soft/70 transition-colors"
                  onClick={() => onSelect?.(e)}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{pathFrom(e.url)}</span>
                    <span className="block truncate text-xs text-text-faint font-mono">
                      {(e.device?.browser || "—")} · {e.ip}
                    </span>
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${label.cls}`}>{label.text}</span>
                  <span className="text-xs text-text-faint font-mono w-8 text-right">{timeAgo(e.created_at)}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
