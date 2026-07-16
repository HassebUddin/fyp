# AdShield AI — FYP

Click-fraud detection platform for e-commerce stores.

## Project structure

| Folder | Description |
|--------|-------------|
| `adshield-frontend/` | React + Vite dashboard (signup, OTP, live traffic feed) |
| `adshield-backend-node/` | Node.js + Express + SQLite API and tracking script |
| `demo-store/` | Sample store to test the tracking snippet |

## Quick start

### Backend

```bash
cd adshield-backend-node
npm install
cp .env.example .env
npm start
```

Runs at `http://localhost:5000` by default.

### Frontend

```bash
cd adshield-frontend
npm install
cp .env.example .env
npm run dev
```

Runs at `http://localhost:5173` by default.

### Demo store (optional)

```bash
cd demo-store
node server.js
```

See each subfolder's `README.md` for full setup details (SMTP, tracking snippet, etc.).
