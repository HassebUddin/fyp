import { useEffect, useState } from "react";

/** Soft spotlight that follows the cursor — signature landing presence. */
export default function CursorGlow({ className = "" }) {
  const [pos, setPos] = useState({ x: 50, y: 30 });
  const [on, setOn] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    function move(e) {
      setOn(true);
      setPos({ x: e.clientX, y: e.clientY });
    }
    function leave() {
      setOn(false);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[1] transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0"} ${className}`}
      style={{
        background: `radial-gradient(420px circle at ${pos.x}px ${pos.y}px, color-mix(in srgb, var(--color-signal) 16%, transparent), transparent 55%)`,
      }}
    />
  );
}
