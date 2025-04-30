// netlify/functions/createStripeSession.js
const { buffer } = require("@netlify/functions");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { bookingId, duration, email, isTestBooking } = body;
  if (!bookingId || !duration || !email) {
    return { statusCode: 400, body: "Missing parameters" };
  }

  // Calculate price - free for test bookings in development or 45-min sessions
  let unitAmount = duration * 100;
  if (isTestBooking === true || duration === 45) {
    unitAmount = 0;
  }

  // Create the session
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: unitAmount,
            product_data: {
              name: isTestBooking ? `Test Consultation (${duration}m)` : `Consultation (${duration}m)`,
            },
          },
          quantity: 1,
        },
      ],
      client_reference_id: bookingId,
      customer_email: email,
      success_url: `${process.env.URL || 'http://localhost:8888'}/payment-complete.html`,
      cancel_url: `${process.env.URL || 'http://localhost:8888'}/payment-cancelled.html`,
    });

    // Record Stripe session ID in booking row
    await supabase
      .from("bookings")
      .update({ 
        stripe_session_id: session.id,
        is_test_booking: isTestBooking === true
      })
      .eq("id", bookingId);

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("Error creating Stripe session:", err);
    return {
      statusCode: 500,
      body: `Internal Server Error: ${err.message}`,
    };
  }
};