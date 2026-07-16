import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Store, Mail, Lock, ChevronRight } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { signUp } from "../lib/api";

const PLATFORMS = ["Shopify", "WooCommerce", "WordPress", "Other"];

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ storeName: "", email: "", platform: "Shopify", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.storeName.trim()) next.storeName = "Tell us your store's name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError("");
    try {
      await signUp(form);
      navigate("/verify-otp");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Step 1 of 2"
      title="Create your account"
      subtitle="Connect your store and we'll start watching your ad traffic today."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field label="Store name" error={errors.storeName}>
          <div className="relative">
            <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
            <input
              type="text"
              value={form.storeName}
              onChange={(e) => update("storeName", e.target.value)}
              placeholder="Luna Skincare Co."
              className="input pl-9"
            />
          </div>
        </Field>

        <Field label="Work email" error={errors.email}>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@yourstore.com"
              className="input pl-9"
            />
          </div>
        </Field>

        <Field label="Store platform">
          <div className="grid grid-cols-2 gap-2">
            {PLATFORMS.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => update("platform", p)}
                className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                  form.platform === p
                    ? "border-signal/60 bg-signal/10 text-signal"
                    : "border-line-soft text-text-muted hover:border-line"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Password" error={errors.password}>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="At least 8 characters"
              className="input pl-9"
            />
          </div>
        </Field>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-signal text-ink font-semibold py-3 mt-2 hover:brightness-110 transition disabled:opacity-60"
        >
          {loading ? <Loader2 size={17} className="animate-spin" /> : <>Send verification code <ChevronRight size={16} /></>}
        </motion.button>

        {submitError && <p className="text-xs text-danger text-center">{submitError}</p>}
      </form>

      <p className="mt-6 text-sm text-text-muted text-center">
        Already protecting your store?{" "}
        <Link to="/login" className="text-signal hover:underline">
          Log in
        </Link>
        {" · "}
        <Link to="/" className="text-copper hover:underline">
          Home
        </Link>
      </p>
    </AuthLayout>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="block text-xs text-text-muted mb-1.5">{label}</span>
      {children}
      {error && <span className="block text-xs text-danger mt-1">{error}</span>}
    </label>
  );
}
