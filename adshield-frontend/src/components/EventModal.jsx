import Modal from "./Modal";

const LABEL = {
  legit: { text: "Legit", cls: "text-safe" },
  suspicious: { text: "Suspicious", cls: "text-alert" },
  bot: { text: "Bot", cls: "text-danger" },
};

export default function EventModal({ open, onClose, event }) {
  if (!event) return null;
  const label = LABEL[event.label] || LABEL.legit;
  const rows = [
    ["Type", event.type],
    ["Status", label.text],
    ["URL", event.url || "—"],
    ["IP", event.ip || "—"],
    ["Browser", event.device?.browser || "—"],
    ["OS", event.device?.os || "—"],
    ["Time", event.created_at ? new Date(event.created_at).toLocaleString() : "—"],
  ];

  return (
    <Modal open={open} onClose={onClose} title="Event">
      <div className="space-y-3">
        <p className={`font-display text-xl font-bold ${label.cls}`}>{label.text}</p>
        <dl className="space-y-2.5">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[88px_1fr] gap-3 text-sm">
              <dt className="text-text-faint font-mono text-xs pt-0.5">{k}</dt>
              <dd className="text-text break-all">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Modal>
  );
}
