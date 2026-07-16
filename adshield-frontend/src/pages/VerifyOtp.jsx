import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { getPendingEmail, getPendingDevOtp, verifyOtp, resendOtp } from "../lib/api";

const LENGTH = 6;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [email] = useState(() => getPendingEmail());
  const [devOtp, setDevOtp] = useState(() => getPendingDevOtp());
  const [digits, setDigits] = useState(Array(LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [seconds, setSeconds] = useState(45);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate("/signup");
      return;
    }
    inputsRef.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  function handleChange(i, value) {
    const v = value.replace(/[^0-9]/g, "").slice(-1);
    setDigits((d) => {
      const next = [...d];
      next[i] = v;
      return next;
    });
    setError("");
    if (v && i < LENGTH - 1) inputsRef.current[i + 1]?.focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, LENGTH);
    if (!text) return;
    e.preventDefault();
    setDigits(Array.from({ length: LENGTH }, (_, i) => text[i] || ""));
    inputsRef.current[Math.min(text.length, LENGTH - 1)]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < LENGTH) {
      setError("Enter all 6 digits.");
      return;
    }
    setLoading(true);
    try {
      await verifyOtp({ email, code });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      setDigits(Array(LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await resendOtp({ email });
      setDevOtp(getPendingDevOtp());
      setSeconds(45);
      setResent(true);
      setError("");
      setTimeout(() => setResent(false), 2500);
    } catch (err) {
      setError(err.message);
    }
  }

  function fillDevOtp() {
    if (!devOtp) return;
    setDigits(Array.from({ length: LENGTH }, (_, i) => devOtp[i] || ""));
    setError("");
  }

  if (!email) return null;

  return (
    <AuthLayout
      eyebrow="Step 2 of 2"
      title={devOtp ? "Enter verification code" : "Check your inbox"}
      subtitle={
        devOtp
          ? `Local testing mode — email SMTP is not set, so the code is shown below for ${email}.`
          : `We sent a 6-digit code to ${email}.`
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {devOtp && (
          <div className="rounded-xl border border-signal/30 bg-signal/10 px-4 py-3 text-sm space-y-2">
            <p className="text-text-muted text-xs uppercase tracking-widest font-mono">Dev OTP (no email)</p>
            <p className="font-mono text-2xl tracking-[0.35em] text-signal">{devOtp}</p>
            <button
              type="button"
              onClick={fillDevOtp}
              className="text-xs text-signal hover:underline"
            >
              Auto-fill this code
            </button>
          </div>
        )}
        <div className="flex gap-2 justify-between" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <motion.input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              initial={false}
              animate={d ? { borderColor: "var(--color-signal)" } : {}}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="otp-input w-full aspect-square text-center text-lg font-mono rounded-xl bg-ink-soft border border-line-soft text-text"
            />
          ))}
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-signal text-ink font-medium py-2.5 hover:brightness-110 transition disabled:opacity-60"
        >
          {loading ? <Loader2 size={17} className="animate-spin" /> : <><ShieldCheck size={16} /> Verify and continue</>}
        </motion.button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={seconds > 0}
            className="flex items-center gap-1.5 text-text-muted hover:text-signal transition-colors disabled:opacity-40 disabled:hover:text-text-muted"
          >
            <RefreshCw size={14} />
            {resent ? "Code resent" : seconds > 0 ? `Resend in ${seconds}s` : "Resend code"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
