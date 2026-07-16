import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Code2, Copy, Check, RefreshCw, ExternalLink } from "lucide-react";
import { fetchScriptSnippet } from "../lib/api";

const PLATFORM_STEPS = {
  shopify: [
    "Go to Online Store → Themes → Edit code.",
    "Open theme.liquid and paste the snippet right before </head>.",
    "Save. Visit your storefront once to confirm traffic shows up below.",
  ],
  woocommerce: [
    "Go to Appearance → Theme File Editor → header.php (or use a header/footer plugin).",
    "Paste the snippet right before </head>.",
    "Update the file, then visit your site to confirm traffic shows up below.",
  ],
  wordpress: [
    "Install a \"header/footer scripts\" plugin (e.g. Insert Headers and Footers), or edit header.php directly.",
    "Paste the snippet into the <head> section.",
    "Save, then visit your site to confirm traffic shows up below.",
  ],
  other: [
    "Open your site's HTML template (the one shared by every page).",
    "Paste the snippet right before the closing </head> tag.",
    "Publish, then visit your site to confirm traffic shows up below.",
  ],
};

function stepsFor(platform) {
  const key = (platform || "").trim().toLowerCase();
  return PLATFORM_STEPS[key] || PLATFORM_STEPS.other;
}

export default function InstallSnippet({ platform, hasTraffic }) {
  const [state, setState] = useState({ loading: true, error: "", snippet: "", siteId: "" });
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(!hasTraffic);

  async function load() {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const data = await fetchScriptSnippet();
      setState({ loading: false, error: "", snippet: data.snippet, siteId: data.siteId });
    } catch (err) {
      setState({ loading: false, error: err.message || "Couldn't load your tracking code.", snippet: "", siteId: "" });
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCopy() {
    if (!state.snippet) return;
    try {
      await navigator.clipboard.writeText(state.snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API blocked — user can still select the text manually.
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl bg-panel/90 border border-line-soft overflow-hidden relative"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper/40 to-transparent" />
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-copper bg-copper/10 border border-copper/20">
            <Code2 size={18} strokeWidth={1.8} />
          </span>
          <div>
            <h3 className="font-display text-sm font-semibold tracking-tight">Link your website</h3>
            <p className="text-xs text-text-muted mt-0.5">
              {hasTraffic
                ? "Installed — traffic is reaching AdShield."
                : "Copy this script into your store <head>, then visit the site once."}
            </p>
          </div>
        </div>
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full border whitespace-nowrap font-mono ${
            hasTraffic
              ? "text-safe bg-safe/10 border-safe/30"
              : "text-alert bg-alert/10 border-alert/30"
          }`}
        >
          {hasTraffic ? "connected" : "not connected"}
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-line-soft pt-4">
          {state.loading && (
            <p className="text-sm text-text-muted">Loading your tracking code…</p>
          )}

          {!state.loading && state.error && (
            <div className="rounded-xl border border-danger/30 bg-danger/10 text-danger text-sm px-4 py-3 flex items-center justify-between gap-3">
              <span>{state.error}</span>
              <button
                onClick={load}
                className="inline-flex items-center gap-1.5 text-xs font-mono shrink-0 hover:underline"
              >
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          )}

          {!state.loading && !state.error && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] uppercase tracking-wide text-text-faint">
                    Your tracking snippet
                  </span>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg border border-line-soft text-text-muted hover:text-text hover:border-line transition-colors"
                  >
                    {copied ? <Check size={13} className="text-safe" /> : <Copy size={13} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="rounded-xl bg-ink-soft border border-line-soft p-3 text-xs font-mono text-text overflow-x-auto whitespace-pre-wrap break-all">
                  {state.snippet}
                </pre>
                <p className="text-xs text-text-faint mt-1.5">
                  Site ID: <span className="font-mono">{state.siteId}</span> — this identifies your
                  dashboard, it's not a secret.
                </p>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wide text-text-faint">
                  Install on {(platform || "your site")}
                </span>
                <ol className="mt-2 space-y-1.5">
                  {stepsFor(platform).map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm text-text-muted">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-ink-soft border border-line-soft text-[11px] font-mono flex items-center justify-center text-text-faint">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {!hasTraffic && (
                <div className="flex items-center gap-1.5 text-xs text-text-faint">
                  <ExternalLink size={12} />
                  After pasting the snippet, visit your live site once — the first pageview will
                  show up in the live traffic feed below within a few seconds.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
