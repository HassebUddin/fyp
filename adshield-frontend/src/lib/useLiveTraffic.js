import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE, fetchEvents, fetchSummary, getSession } from "./api";

const EMPTY_SUMMARY = {
  visitorsToday: 0,
  botsCaught: 0,
  suspiciousClicks: 0,
  legitClicks: 0,
  budgetSavedUsd: 0,
  series: [],
};

// Loads the initial 24h snapshot over REST, then keeps it fresh by listening
// for `new_event` pushes over Socket.IO — this is what makes the dashboard
// "live" instead of requiring a page refresh or polling loop.
export function useLiveTraffic() {
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [events, setEvents] = useState([]);
  const [catchSignal, setCatchSignal] = useState(0);
  const [connected, setConnected] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [lastEvent, setLastEvent] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [s, e] = await Promise.all([fetchSummary(), fetchEvents()]);
        if (cancelled) return;
        setSummary(s);
        setEvents(e);
        setLoadError("");
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      }
    }
    load();

    const session = getSession();
    const socket = io(API_BASE, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join", { siteId: session?.siteId, token: session?.accessToken }, (ack) => {
        if (!ack?.ok) console.warn("Could not join live traffic room:", ack?.error);
      });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("new_event", (evt) => {
      setEvents((prev) => [evt, ...prev].slice(0, 30));
      setSummary((prev) => {
        const next = { ...prev };
        if (evt.label === "bot") next.botsCaught = (prev.botsCaught || 0) + 1;
        else if (evt.label === "suspicious") next.suspiciousClicks = (prev.suspiciousClicks || 0) + 1;
        else next.legitClicks = (prev.legitClicks || 0) + 1;
        return next;
      });
      if (evt.label === "bot") setCatchSignal((n) => n + 1);
      setLastEvent({ ...evt, _ping: Date.now() });
    });

    return () => {
      cancelled = true;
      socket.disconnect();
    };
  }, []);

  return { summary, events, catchSignal, connected, loadError, lastEvent };
}
