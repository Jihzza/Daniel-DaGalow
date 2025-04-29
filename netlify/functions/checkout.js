// server/routes/checkout.js

import express from "express";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

router.post("/api/create-checkout-session", express.json(), async (req, res) => {
  const { appointment_date, duration, name, email, user_id } = req.body;

  try {
    // 1. Insert a new booking with status "pending"
    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        appointment_date,
        duration_minutes: duration,
        name,
        email,
        user_id,
        payment_status: "pending",
      })
      .select("id")
      .single();

    if (insertError) throw insertError;

    // 2. Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Consultation (${duration} minutes)`,
            },
            unit_amount: Math.round(duration * 1.5 * 100), // €1.50/min → cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/booking-cancel`,
      metadata: {
        booking_id: booking.id.toString(),
      },
    });

    // 3. Save the Stripe session ID back to Supabase
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    if (updateError) throw updateError;

    // 4. Return the URL for the client to redirect to
    res.json({ sessionUrl: session.url });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
