import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Crosshair, EyeOff, LineChart, Code2 } from "lucide-react";
import { getSession } from "../lib/api";
import BrandMark from "../components/BrandMark";
import ThemeToggle from "../components/ThemeToggle";
import CursorGlow from "../components/CursorGlow";
import HeroRadar from "../components/HeroRadar";

const letters = "AdShield".split("");

export default function Landing() {
  const session = getSession();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  return (
    <div className="min-h-screen atmosphere text-text overflow-x-hidden relative">
      <CursorGlow />
      <div className="pointer-events-none absolute inset-0 scanlines opacity-[0.07] z-[2]" />

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-20 flex items-center justify-between px-5 sm:px-8 lg:px-12 py-5"
      >
        <Link to="/" className="font-display text-xl font-extrabold tracking-tight flex items-center gap-2.5">
          <BrandMark size={30} />
          AdShield
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {session ? (
            <Link to="/dashboard" className="btn-primary text-sm">
              Open dashboard <ArrowRight size={15} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm hidden sm:inline-flex">
                Log in
              </Link>
              <Link to="/signup" className="btn-primary text-sm">
                Start free <ArrowRight size={15} />
              </Link>
            </>
          )}
        </nav>
      </motion.header>

      <section
        ref={heroRef}
        className="relative z-10 min-h-[92vh] grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center px-5 sm:px-8 lg:px-12 pb-16"
      >
        <div className="pointer-events-none absolute inset-0 noise-grid opacity-30" />
        <motion.div style={{ y, opacity }} className="relative max-w-3xl">
          <div className="flex flex-wrap overflow-hidden" aria-label="AdShield">
            {letters.map((ch, i) => (
              <motion.span
                key={`${ch}-${i}`}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-[clamp(3.6rem,14vw,9rem)] font-extrabold leading-[0.86] tracking-[-0.05em] inline-block"
              >
                {ch}
              </motion.span>
            ))}
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.55 }}
            className="mt-6 max-w-xl font-display text-[clamp(1.35rem,3vw,2.2rem)] font-semibold leading-tight"
          >
            Stop paying for clicks that were never customers.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="mt-4 max-w-lg text-text-muted leading-relaxed"
          >
            One script. Invisible honeypot. Live scoring — bots, farms, and real shoppers.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link to={session ? "/dashboard" : "/signup"} className="btn-primary">
              {session ? "Enter console" : "Create account"} <ArrowRight size={16} />
            </Link>
            <a href="#demo-video" className="btn-ghost">
              Watch demo
            </a>
          </motion.div>
        </motion.div>

        <motion.div style={{ y }} className="relative z-10 hidden lg:block">
          <HeroRadar />
        </motion.div>
      </section>

      <div className="relative z-10 border-y border-line-soft bg-panel/30 overflow-hidden">
        <motion.div
          className="flex gap-10 whitespace-nowrap py-3 font-mono text-[11px] uppercase tracking-[0.25em] text-text-faint"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex gap-10 px-4">
              {["honeypot", "click-farm", "bot-ua", "budget-leak", "legit-buyer", "ad-fraud", "live-score"].map(
                (t) => (
                  <span key={`${k}-${t}`}>
                    <span className="text-signal/70">◆</span> {t}
                  </span>
                )
              )}
            </span>
          ))}
        </motion.div>
      </div>

      <section id="demo-video" className="relative z-10 px-5 sm:px-8 lg:px-12 py-20 border-t border-line-soft">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl"
        >
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-copper">18s demo</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight leading-[1.05]">
            What it detects — in real time.
          </h2>
          <p className="mt-3 text-text-muted text-sm max-w-xl">
            Short walkthrough: honeypot trap → live score → wasted-spend stop. Then try the live demo store.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 instrument-panel rounded-2xl border border-line-soft bg-panel/80 overflow-hidden max-w-3xl"
        >
          <video
            className="w-full aspect-video bg-ink"
            controls
            playsInline
            preload="metadata"
            poster="/demo/s1.png"
            src="/demo/adshield-demo.mp4"
          >
            Your browser does not support video.
          </video>
        </motion.div>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="http://127.0.0.1:5500/"
            target="_blank"
            rel="noreferrer"
            className="btn-primary text-sm"
          >
            Open live demo store <ArrowRight size={14} />
          </a>
          <Link to="/login" className="btn-ghost text-sm">
            Login → watch console
          </Link>
        </div>
      </section>

      <section id="how" className="relative z-10 px-5 sm:px-8 lg:px-12 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-copper">Protocol</p>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold tracking-tight max-w-xl leading-[1.05]">
            Install. Trap. Watch.
          </h2>
        </motion.div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            { n: "01", icon: Code2, title: "Paste script", body: "Shopify / WordPress / HTML head." },
            { n: "02", icon: EyeOff, title: "Trap arms", body: "Bots click what humans never see." },
            { n: "03", icon: LineChart, title: "Console updates", body: "Scores stream in live." },
          ].map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, rotate: i === 1 ? 0.4 : -0.4 }}
              className="instrument-panel rounded-2xl border border-line-soft bg-panel/70 p-6 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-copper text-sm">{step.n}</span>
                <step.icon size={18} className="text-signal" strokeWidth={1.7} />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-5 sm:px-8 lg:px-12 py-20 border-t border-line-soft">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Visitors", icon: Crosshair, tone: "text-signal" },
            { label: "Bots", icon: EyeOff, tone: "text-danger" },
            { label: "Suspicious", icon: LineChart, tone: "text-alert" },
            { label: "Saved $", icon: Code2, tone: "text-copper" },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.03 }}
              className="instrument-panel rounded-2xl border border-line-soft bg-panel/80 p-5"
            >
              <m.icon size={16} className={m.tone} />
              <p className={`mt-3 font-display text-xl font-bold ${m.tone}`}>{m.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-5 sm:px-8 lg:px-12 py-28 border-t border-line-soft">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl sm:text-6xl font-extrabold tracking-tight leading-[0.95] max-w-3xl"
        >
          Enter the console.
        </motion.h2>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/signup" className="btn-primary">
            Create account <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-ghost">
            Log in
          </Link>
        </div>
      </section>

      <footer className="relative z-10 px-5 sm:px-8 lg:px-12 py-8 border-t border-line-soft flex items-center justify-between text-sm text-text-faint">
        <span className="inline-flex items-center gap-2 font-display font-semibold text-text-muted">
          <BrandMark size={20} /> AdShield
        </span>
        <span className="font-mono text-[10px] tracking-widest uppercase">FYP · fraud ops</span>
      </footer>
    </div>
  );
}
