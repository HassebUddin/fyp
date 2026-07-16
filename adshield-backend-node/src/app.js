const express = require("express");
const cors = require("cors");

const buildAuthRouter = require("./routes/auth");
const buildTrackingRouter = require("./routes/tracking");
const buildDashboardRouter = require("./routes/dashboard");

function createApp(config, io) {
  const app = express();
  app.use(express.json());

  // Only the tracking endpoints are open to any origin — that's the whole
  // point, since the script is embedded on other people's stores. Auth and
  // dashboard APIs are restricted to our own frontend's origin(s), and are
  // additionally protected by JWT where they return account data.
  const openCors = cors({ origin: "*" });
  const dashboardCors = cors({
    origin: config.DASHBOARD_ORIGINS,
    credentials: true,
  });

  app.use("/api/collect", openCors);
  app.use("/tracker.js", openCors);
  app.use("/api/auth", dashboardCors);
  app.use("/api/dashboard", dashboardCors);
  app.use("/health", openCors);

  // --- routes ---
  app.use("/api/auth", buildAuthRouter(config));
  app.use("/", buildTrackingRouter(config, io)); // exposes /tracker.js and /api/collect
  app.use("/api/dashboard", buildDashboardRouter(config));

  app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "adshield-backend" });
  });

  // --- error handlers ---
  app.use((req, res) => {
    res.status(404).json({ error: "Not found." });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong on our end." });
  });

  return app;
}

module.exports = createApp;
