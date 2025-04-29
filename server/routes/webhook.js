// server/routes/webhook.js
import express from "express";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Use raw body parsing for Stripe signature verification
router.post(
    "/api/webhooks/stripe",
    express.raw({ type: "application/json" }),
    (req, res) => {
      const sig = req.headers["stripe-signature"];
      let event;
  
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error("⚠️ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
  
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        supabase
          .from("bookings")
          .update({ payment_status: "paid" })
          .eq("stripe_session_id", session.id)
          .then(({ error }) => {
            if (error) console.error("Supabase update error:", error);
          });
      }
  
      // Acknowledge receipt
      res.json({ received: true });
    }
  );
  

export default router;
