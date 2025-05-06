// server/index.js

// 1) Load .env as early as possible:
import "dotenv/config";

import express from "express";
import checkoutRoutes from "./routes/checkout.js";
import webhookRoutes from "./routes/webhook.js";
import bodyParser from "body-parser";

const app = express();

// 2) Parse JSON for your session‐creation route
app.use("/api/create-checkout-session", express.json());

// 3) Parse raw for Stripe webhooks
//    (you can keep body-parser or use express.raw here)
app.use(
  "/api/webhooks/stripe",
  bodyParser.raw({ type: "application/json" })
);

// 4) Mount your routers
app.use(checkoutRoutes);
app.use(webhookRoutes);

// 5) Health check
app.get("/api/ping", (_req, res) => res.send("pong"));

// 6) Start listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
});
