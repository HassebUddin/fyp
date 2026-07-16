import { useEffect, useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { fetchScriptSnippet } from "../lib/api";
import Modal from "./Modal";

const SHORT = {
  shopify: "Shopify → Themes → Edit code → theme.liquid → before </head>",
  woocommerce: "WooCommerce/WP → Header scripts plugin → before </head>",
  wordpress: "WordPress → Header scripts plugin → before </head>",
  other: "Any HTML → paste before </head>",
};

export default function InstallModal({ open, onClose, platform }) {
  const [state, setState] = useState({ loading: true, error: "", snippet: "", siteId: "" });
  const [copied, setCopied] = useState(false);
  const tip = SHORT[(platform || "").toLowerCase()] || SHORT.other;

  async function load() {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const data = await fetchScriptSnippet();
      setState({ loading: false, error: "", snippet: data.snippet, siteId: data.siteId });
    } catch (err) {
      setState({ loading: false, error: err.message || "Failed to load script", snippet: "", siteId: "" });
    }
  }

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleCopy() {
    if (!state.snippet) return;
    try {
      await navigator.clipboard.writeText(state.snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Tracking script" wide>
      {state.loading && <p className="text-sm text-text-muted">Loading…</p>}
      {!state.loading && state.error && (
        <div className="flex items-center justify-between gap-3 text-sm text-danger">
          <span>{state.error}</span>
          <button type="button" onClick={load} className="inline-flex items-center gap-1 text-xs">
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}
      {!state.loading && !state.error && (
        <div className="space-y-4">
          <p className="text-sm text-text-muted font-mono">{tip}</p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-text-faint">site_id · {state.siteId}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-full border border-line-soft px-3 py-1.5 text-xs font-medium hover:border-line"
            >
              {copied ? <Check size={13} className="text-safe" /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="rounded-xl bg-ink-soft border border-line-soft p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
            {state.snippet}
          </pre>
        </div>
      )}
    </Modal>
  );
}
