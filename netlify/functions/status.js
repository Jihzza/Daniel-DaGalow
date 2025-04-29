// server/routes/status.js
import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

router.get("/api/booking-status", async (req, res) => {
  const { session_id } = req.query;
  const { data, error } = await supabase
    .from("bookings")
    .select("payment_status")
    .eq("stripe_session_id", session_id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ payment_status: data.payment_status });
});

export default router;
