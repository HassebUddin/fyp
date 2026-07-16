import { useEffect, useState } from "react";

export default function MissionClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 250);
    return () => clearInterval(id);
  }, []);
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const ms = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, "0");
  return (
    <time className="font-mono text-[11px] tabular-nums tracking-wider text-text-faint">
      {h}:{m}:{s}
      <span className="text-signal/80">.{ms}</span>
    </time>
  );
}
