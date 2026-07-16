# AdShield AI — FYP1 Frontend

React + Vite frontend for the FYP1 milestone: signup → email OTP verification
→ dashboard. This pairs with the `adshield-backend` Flask + MongoDB project —
see that project's README for how to run the server this talks to.

## Connecting to the backend

1. Start `adshield-backend` first (see its README) — it should be running at
   `http://localhost:5000`.
2. In this project, copy the env file and point it at the backend:
   ```bash
   cp .env.example .env
   ```
   The default (`VITE_API_BASE_URL=http://localhost:5000`) already matches
   the backend's default port, so if you haven't changed either side's
   config you can skip this step.
3. `npm install && npm run dev`, then sign up through the UI — the OTP is
   emailed for real now (or logged to the backend's terminal if you haven't
   configured SMTP yet).

Everything under `src/lib/` (`api.js`, `useLiveTraffic.js`) is the connection
layer — swap `VITE_API_BASE_URL` to point at a deployed backend and nothing
else needs to change.

## What's built

- **Signup** (`/signup`) — store name, email, platform, password.
- **Email OTP verification** (`/verify-otp`) — 6-digit code, auto-advancing
  boxes, paste support, resend cooldown. Calls the real
  `/api/auth/verify-otp` endpoint.
- **Login** (`/login`) — for returning stores; redirects to OTP verification
  automatically if the backend reports the account isn't verified yet.
- **Dashboard** (`/dashboard`, protected route) — loads real 24h stats from
  `/api/dashboard/summary` and `/api/dashboard/events`, then stays live via a
  Socket.IO connection: the **Live Trap Radar**, stat cards, chart, and
  traffic feed all update the moment a new event hits the backend — no
  polling, no refresh.

## Getting started

```bash
npm install
cp .env.example .env   # point at your backend
npm run dev             # start local dev server
npm run build            # production build to dist/
```

## Project structure

```
src/
  components/     Sidebar, Topbar, StatCard, TrapRadar, FraudChart, TrafficFeed, AuthLayout
  pages/          Signup, VerifyOtp, Login, Dashboard
  lib/
    api.js               real backend client (auth, dashboard endpoints, session storage)
    useLiveTraffic.js     loads dashboard data + subscribes to live Socket.IO events
  index.css       design tokens (color, type, motion) as Tailwind v4 @theme variables
```

## Design notes

- Palette, type (Space Grotesk / Inter / JetBrains Mono), and the Live Trap
  Radar signature widget are described in `src/index.css` and
  `src/components/TrapRadar.jsx` — the radar is a literal, animated read of
  the honeypot mechanism from the proposal, driven by real `honeypot_hit`
  events rather than a fake timer.
- Animations respect `prefers-reduced-motion`.
- Tech: React 19, React Router 7, Tailwind CSS v4, Framer Motion, Recharts,
  Socket.IO client, lucide-react icons.

## Troubleshooting

- **"Couldn't reach the backend" banner on the dashboard** — the backend
  isn't running, or `VITE_API_BASE_URL` doesn't match its address. Check
  `http://localhost:5000/health` responds in your browser.
- **Traffic feed says "connecting…" forever** — the Socket.IO handshake
  didn't complete. Check the backend terminal for errors, and that no
  firewall/proxy is blocking WebSocket upgrades.
- **CORS errors in the browser console** — make sure `DASHBOARD_ORIGINS` in
  the backend's `.env` includes the exact origin this app is served from
  (e.g. `http://localhost:5173`).

## Next milestones (not in this prototype)

- Settings, Fraud Reports, and Honeypot Log pages (stubbed in the sidebar as "FYP2")
- Digital fingerprinting via FingerprintJS, traffic source risk scoring,
  Google Ads auto-exclusion, real-time email/WhatsApp alerts
