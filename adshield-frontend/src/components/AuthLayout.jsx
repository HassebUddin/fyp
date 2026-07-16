import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import BrandMark from "./BrandMark";
import ThemeToggle from "./ThemeToggle";

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 atmosphere">
      <div className="relative hidden md:flex flex-col justify-between overflow-hidden border-r border-line-soft p-10 noise-grid">
        <motion.div
          aria-hidden
          animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.05, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-15%] top-[-8%] h-80 w-80 rounded-full bg-copper/20 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          className="absolute left-[-10%] bottom-[-10%] h-72 w-72 rounded-full bg-signal/15 blur-3xl"
        />

        <div className="relative flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-lg tracking-tight">
            <BrandMark size={30} />
            AdShield
          </Link>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="relative max-w-md"
        >
          <p className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight">
            Your ad budget
            <span className="block text-copper">deserves real humans.</span>
          </p>
          <p className="mt-5 text-text-muted text-sm leading-relaxed">
            Paste one script. Watch bots walk into the honeypot. Keep the spend for customers who can actually buy.
          </p>
        </motion.div>

        <p className="relative text-xs text-text-faint font-mono">adshield · live traffic defense</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10 relative">
        <div className="absolute top-5 right-5 md:hidden">
          <ThemeToggle />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="mb-8 md:hidden flex items-center gap-2 font-display font-bold tracking-tight">
            <BrandMark size={26} />
            AdShield
          </Link>
          {eyebrow && (
            <p className="text-xs uppercase tracking-[0.18em] text-copper font-mono mb-2">{eyebrow}</p>
          )}
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-text-muted leading-relaxed">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
