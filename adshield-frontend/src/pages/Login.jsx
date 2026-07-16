import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, ChevronRight } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { logIn } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!form.password) {
      setError("Enter your password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await logIn(form);
      navigate("/dashboard");
    } catch (err) {
      if (err.needsVerification) {
        navigate("/verify-otp");
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to your dashboard"
      subtitle="Pick up right where the radar left off."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <label className="block">
          <span className="block text-xs text-text-muted mb-1.5">Email</span>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="you@yourstore.com"
              className="input pl-9"
            />
          </div>
        </label>

        <label className="block">
          <span className="block text-xs text-text-muted mb-1.5">Password</span>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              className="input pl-9"
            />
          </div>
        </label>

        {error && <p className="text-xs text-danger">{error}</p>}

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-signal text-ink font-semibold py-3 mt-2 hover:brightness-110 transition disabled:opacity-60"
        >
          {loading ? <Loader2 size={17} className="animate-spin" /> : <>Log in <ChevronRight size={16} /></>}
        </motion.button>
      </form>

      <p className="mt-6 text-sm text-text-muted text-center">
        New to AdShield?{" "}
        <Link to="/signup" className="text-signal hover:underline">
          Create an account
        </Link>
        {" · "}
        <Link to="/" className="text-copper hover:underline">
          Home
        </Link>
      </p>
    </AuthLayout>
  );
}
