# AdShield AI — Backend (FYP1) — Node.js / SQLite port

This is a Node.js (Express) rewrite of the original Flask/MongoDB backend,
storing data in **SQLite** instead of MongoDB. The API, request/response
shapes, routes, and behaviour are unchanged — this is a language + storage
swap only, not a redesign. It's a drop-in replacement: the `adshield-frontend`
app talks to it exactly the way it talked to the Flask version.

## Stack

- **Express** — REST API
- **better-sqlite3** — users, traffic events, labeled training data (single
  file DB, no server to install/run)
- **Socket.IO** — pushes new traffic events to the dashboard live, no polling
- **jsonwebtoken** — session tokens for the dashboard API
- **nodemailer** — sends the OTP verification email (any standard SMTP provider)

## 1. Install

```bash
cd adshield-backend
npm install
cp .env.example .env
```

## 2. Database

Nothing to install or run — SQLite is just a file. The DB file (path set by
`SQLITE_PATH` in `.env`, default `./data/adshield.sqlite`) and all tables /
indexes (equivalent to the old Mongo `users`, `events`,
`labeled_training_data` collections + their indexes) are created
automatically the first time the server starts.

## 3. Set up email sending

Open `.env` and fill in the `SMTP_*` values. Two easy options:

- **Gmail** — turn on 2-Step Verification, then create an App Password at
  https://myaccount.google.com/apppasswords. Use:
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USERNAME=you@gmail.com
  SMTP_PASSWORD=<16-character app password>
  ```
- **Mailtrap** (recommended while developing — catches emails in a test inbox
  instead of sending to real people) — copy the SMTP credentials from your
  Mailtrap inbox's "SMTP Settings" tab into the same fields.

If you leave `SMTP_HOST` blank, the server logs the OTP to the console
instead of emailing it (`EMAIL_DEV_FALLBACK=true`), so you can develop
without setting up email first — just watch the terminal running the server.

## 4. Run it

```bash
npm start
```

Server starts at `http://localhost:5000`. Check `GET /health` to confirm it's up.

(`npm run dev` uses Node's built-in `--watch` flag to restart on file changes.)

## API reference

Identical to the original Flask backend.

### Auth

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/api/auth/signup` | `storeName, email, platform, password` | Creates a pending account, emails a 6-digit OTP |
| POST | `/api/auth/verify-otp` | `email, code` | Verifies, assigns a `siteId`, returns a JWT |
| POST | `/api/auth/resend-otp` | `email` | Resends a fresh code (rate-limited) |
| POST | `/api/auth/login` | `email, password` | Returns a JWT for a verified account |
| GET | `/api/auth/me` | — (JWT required) | Current account + siteId |

### Tracking (public — called from client websites, not the dashboard)

| Method | Path | Notes |
|---|---|---|
| GET | `/tracker.js?site_id=...` | The snippet clients paste into their store. Plain JS, no dependencies. |
| POST | `/api/collect` | Receives `pageview`, `honeypot_hit`, and `session_update` events from the script above. |

### Dashboard (JWT required)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/dashboard/script` | Returns the `<script>` tag to give the client, with their `site_id` baked in |
| GET | `/api/dashboard/summary` | 24h counts (visitors, bots caught, suspicious, legit) + hourly series for the chart |
| GET | `/api/dashboard/events` | Most recent 25 raw events |

### Live updates (Socket.IO)

Unchanged from the Flask version. After login, the dashboard connects a
socket and emits:
```js
socket.emit("join", { siteId, token: accessToken })
```
The server verifies the token belongs to that `siteId`, joins the room, and
from then on emits a `new_event` message to that room every time `/api/collect`
processes a new event for it.

## Project structure

```
src/
  server.js            entry point (http server + Socket.IO + app)
  app.js               Express app factory (routes, CORS, error handlers)
  config.js            all settings, read from .env
  db.js                SQLite connection + schema/index creation
  sockets.js           Socket.IO "join room" handler
  routes/
    auth.js            signup / OTP / login
    tracking.js        tracker.js + /api/collect
    dashboard.js        summary / events / script snippet
  services/
    emailService.js     OTP email sending
    fraudService.js      honeypot confirmation + scoring
  utils/
    security.js          password hashing, OTP generation, IP + fingerprint helpers
    jwt.js                access-token creation/verification + auth middleware
  static/
    tracker_template.js   the JS served at /tracker.js (identical to the Flask version)
package.json
.env.example
```

## What changed vs. the Flask version (and what didn't)

**Changed (as requested):**
- Language: Python/Flask → Node.js/Express
- Storage: MongoDB (PyMongo) → SQLite (`better-sqlite3`), with tables and
  indexes mirroring the old collections/indexes 1:1
- Small internal library swaps this required: `bcrypt` → `bcryptjs`,
  `flask-jwt-extended` → `jsonwebtoken`, `flask-socketio` → `socket.io`,
  `smtplib` → `nodemailer`, Python's `user-agents` (which includes a bot
  classifier) → `ua-parser-js` + a small regex-based bot-UA check, since
  `ua-parser-js` doesn't ship one itself

**Not changed:**
- Every route, its URL, method, request body shape, and response JSON shape
- Auth flow (signup → OTP email → verify → JWT), OTP hashing/expiry/attempt
  rules, password hashing approach (bcrypt-style)
- Fraud scoring logic (honeypot = confirmed bot, same-IP click-frequency
  window/threshold = suspicious)
- The tracking script served at `/tracker.js` (byte-for-byte identical file)
- CORS policy (open for `/tracker.js` + `/api/collect`, restricted to
  `DASHBOARD_ORIGINS` for auth/dashboard)
- Socket.IO event names/payloads (`join`, `new_event`)
- `.env` variable names/semantics, except `MONGO_URI` is replaced by
  `SQLITE_PATH`

## Security notes for a production deploy

- Change `SECRET_KEY` and `JWT_SECRET_KEY` to long random values — never use
  the defaults outside local development.
- Set `EMAIL_DEV_FALLBACK=false` once real SMTP is configured, so a
  misconfiguration fails loudly instead of silently logging OTPs.
- `DASHBOARD_ORIGINS` should list only your real frontend URL(s) in production.
- Consider adding request rate limiting (e.g. `express-rate-limit`) in front
  of `/api/collect`, since it's an open, unauthenticated endpoint by design.
- SQLite is fine for an FYP/single-instance deploy; if you ever need multiple
  app server processes/instances behind a load balancer, you'd want a
  networked DB again (e.g. Postgres) since SQLite is a single local file.

## What's not in this milestone

- The trained ML ensemble (rule-based scoring stands in for now)
- Digital fingerprinting via FingerprintJS (a simpler in-house fingerprint stands in)
- Real-time email/WhatsApp fraud-spike alerts, traffic source risk scoring,
  Google Ads auto-exclusion — all FYP2 milestones per the proposal
