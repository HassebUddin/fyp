import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-panel border border-line px-3 py-2 text-xs font-mono shadow-lg">
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function FraudChart({ data }) {
  return (
    <div className="rounded-2xl bg-panel/90 border border-line-soft p-4 h-full flex flex-col min-h-[280px] instrument-panel">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-text-faint mb-0.5">Timeline</p>
          <h3 className="font-display text-sm font-semibold tracking-tight">24h composition</h3>
        </div>
      </div>
      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="legitFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-signal)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--color-signal)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="botFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-danger)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--color-danger)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="suspFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-alert)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--color-alert)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-line-soft)" vertical={false} />
            <XAxis dataKey="hour" tick={{ fill: "var(--color-text-faint)", fontSize: 11 }} axisLine={{ stroke: "var(--color-line)" }} tickLine={false} interval={3} />
            <YAxis tick={{ fill: "var(--color-text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="legit" name="Legit" stroke="var(--color-signal)" fill="url(#legitFill)" strokeWidth={2} />
            <Area type="monotone" dataKey="suspicious" name="Suspicious" stroke="var(--color-alert)" fill="url(#suspFill)" strokeWidth={2} />
            <Area type="monotone" dataKey="bots" name="Bots" stroke="var(--color-danger)" fill="url(#botFill)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
