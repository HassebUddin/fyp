import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Users, Bot, ShieldAlert, PiggyBank, Code2, Sparkles } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import TrapRadar from "../components/TrapRadar";
import FraudChart from "../components/FraudChart";
import TrafficFeed from "../components/TrafficFeed";
import InstallModal from "../components/InstallModal";
import EventModal from "../components/EventModal";
import LiveCatchToast from "../components/LiveCatchToast";
import MissionClock from "../components/MissionClock";
import ThemeToggle from "../components/ThemeToggle";
import ConsoleOrbitBg from "../components/ConsoleOrbitBg";
import ThreatRing from "../components/ThreatRing";
import MobileDock from "../components/MobileDock";
import { logOut } from "../lib/api";
import { useLiveTraffic } from "../lib/useLiveTraffic";
import { useTheme } from "../lib/theme";

const TITLES = {
  overview: "Overview",
  traffic: "Traffic",
  fraud: "Fraud",
  honeypot: "Honeypot",
  settings: "Settings",
};

export default function Dashboard({ session }) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { summary, events, catchSignal, connected, loadError, lastEvent } = useLiveTraffic();
  const [section, setSection] = useState("overview");
  const [installOpen, setInstallOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!catchSignal) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 700);
    return () => clearTimeout(t);
  }, [catchSignal]);

  const fraudEvents = useMemo(
    () => events.filter((e) => e.label === "bot" || e.label === "suspicious"),
    [events]
  );
  const honeypotEvents = useMemo(() => events.filter((e) => e.label === "bot"), [events]);

  function handleLogout() {
    logOut();
    navigate("/");
  }

  return (
    <div className={`min-h-screen flex bg-ink relative overflow-hidden ${flash ? "catch-flash" : ""}`}>
      <ConsoleOrbitBg />
      <div className="pointer-events-none absolute inset-0 scanlines opacity-[0.035] z-[1]" />

      <Sidebar onLogout={handleLogout} onNavigate={setSection} connected={connected} section={section} />

      <div className="flex-1 min-w-0 flex flex-col relative z-[2]">
        <Topbar
          storeName={session?.storeName}
          platform={session?.platform}
          connected={connected}
          onInstall={() => setInstallOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 space-y-4 pb-24 md:pb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <motion.h1
                key={section}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl md:text-3xl font-extrabold tracking-tight"
              >
                {TITLES[section]}
              </motion.h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-line-soft bg-panel/60 px-2.5 py-1">
                <MissionClock />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setInstallOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-3.5 py-2 text-xs font-semibold text-signal shadow-[0_0_24px_color-mix(in_srgb,var(--color-signal)_18%,transparent)]"
              >
                <Code2 size={14} />
                Script
              </motion.button>
            </div>
          </div>

          {loadError && (
            <div className="rounded-xl border border-danger/30 bg-danger/10 text-danger text-sm px-3 py-2">
              Backend offline · {loadError}
            </div>
          )}

          <AnimatePresence mode="wait">
            {section === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, filter: "blur(8px)", y: 12 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                exit={{ opacity: 0, filter: "blur(6px)", y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                  <StatCard icon={Users} label="Visitors" value={summary.visitorsToday} tone="signal" />
                  <StatCard
                    icon={Bot}
                    label="Bots"
                    value={summary.botsCaught}
                    tone="danger"
                    delay={0.05}
                    onClick={() => setSection("honeypot")}
                  />
                  <StatCard
                    icon={ShieldAlert}
                    label="Suspicious"
                    value={summary.suspiciousClicks}
                    tone="alert"
                    delay={0.1}
                    onClick={() => setSection("fraud")}
                  />
                  <StatCard
                    icon={PiggyBank}
                    label="Saved"
                    value={summary.budgetSavedUsd}
                    suffix="$"
                    tone="safe"
                    delay={0.15}
                  />
                </div>

                {/* Command deck — asymmetric unique layout */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                  <motion.div
                    layout
                    className="xl:col-span-5 instrument-panel rounded-2xl bg-panel/90 border border-line-soft p-4 relative overflow-hidden min-h-[320px]"
                  >
                    <div className="absolute inset-0 noise-grid opacity-20 pointer-events-none" />
                    <div className="relative h-full">
                      <TrapRadar trapped={summary.botsCaught} catchSignal={catchSignal} />
                    </div>
                  </motion.div>

                  <div className="xl:col-span-4 instrument-panel">
                    <FraudChart data={summary.series} />
                  </div>

                  <div className="xl:col-span-3">
                    <ThreatRing
                      legit={summary.legitClicks || 0}
                      suspicious={summary.suspiciousClicks || 0}
                      bots={summary.botsCaught || 0}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-faint inline-flex items-center gap-1.5">
                    <Sparkles size={11} className="text-copper" /> Live stream
                  </p>
                  <button type="button" onClick={() => setSection("traffic")} className="text-xs text-signal hover:underline">
                    Open traffic →
                  </button>
                </div>
                <TrafficFeed
                  events={events}
                  connected={connected}
                  compact
                  onSelect={setSelected}
                  emptyText="Waiting for first ping"
                />
              </motion.div>
            )}

            {section === "traffic" && (
              <motion.div
                key="traffic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="instrument-panel"
              >
                <TrafficFeed events={events} connected={connected} onSelect={setSelected} />
              </motion.div>
            )}

            {section === "fraud" && (
              <motion.div
                key="fraud"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  <StatCard icon={Bot} label="Bots" value={summary.botsCaught} tone="danger" />
                  <StatCard icon={ShieldAlert} label="Suspicious" value={summary.suspiciousClicks} tone="alert" delay={0.05} />
                  <div className="hidden lg:block">
                    <ThreatRing
                      legit={summary.legitClicks || 0}
                      suspicious={summary.suspiciousClicks || 0}
                      bots={summary.botsCaught || 0}
                    />
                  </div>
                </div>
                <TrafficFeed events={fraudEvents} connected={connected} onSelect={setSelected} emptyText="Clear skies" />
              </motion.div>
            )}

            {section === "honeypot" && (
              <motion.div
                key="honeypot"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 xl:grid-cols-5 gap-4"
              >
                <div className="xl:col-span-2 instrument-panel rounded-2xl bg-panel border border-line-soft p-4 min-h-[300px]">
                  <TrapRadar trapped={summary.botsCaught} catchSignal={catchSignal} />
                </div>
                <div className="xl:col-span-3">
                  <TrafficFeed events={honeypotEvents} connected={connected} onSelect={setSelected} emptyText="No traps sprung" />
                </div>
              </motion.div>
            )}

            {section === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-lg space-y-3"
              >
                <div className="instrument-panel rounded-2xl border border-line-soft bg-panel p-4 space-y-3">
                  <Row k="Store" v={session?.storeName || "—"} />
                  <Row k="Email" v={session?.email || "—"} />
                  <Row k="Platform" v={session?.platform || "—"} />
                  <Row k="Site ID" v={session?.siteId || "—"} mono />
                </div>
                <div className="instrument-panel rounded-2xl border border-line-soft bg-panel p-4 flex items-center justify-between">
                  <span className="text-sm">Theme</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`px-3 py-1.5 rounded-full text-xs border ${theme === "dark" ? "border-signal text-signal" : "border-line-soft"}`}
                    >
                      Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`px-3 py-1.5 rounded-full text-xs border ${theme === "light" ? "border-signal text-signal" : "border-line-soft"}`}
                    >
                      Light
                    </button>
                    <ThemeToggle />
                  </div>
                </div>
                <button type="button" onClick={() => setInstallOpen(true)} className="btn-primary text-sm w-full">
                  <Code2 size={15} /> Tracking script
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <MobileDock section={section} onNavigate={setSection} />
      <InstallModal open={installOpen} onClose={() => setInstallOpen(false)} platform={session?.platform} />
      <EventModal open={!!selected} onClose={() => setSelected(null)} event={selected} />
      <LiveCatchToast event={lastEvent} />
    </div>
  );
}

function Row({ k, v, mono }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-text-faint">{k}</span>
      <span className={`text-right break-all ${mono ? "font-mono text-xs" : ""}`}>{v}</span>
    </div>
  );
}
