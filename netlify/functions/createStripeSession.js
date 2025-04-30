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

  const { bookingId, duration, email } = body;
  if (!bookingId || !duration || !email) {
    return { statusCode: 400, body: "Missing parameters" };
  }

  // Create the session
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",                 // or your currency
            unit_amount: duration * 100,     // or map duration→price
            product_data: {
              name: `Consultation (${duration}m)`,
            },
          },
          quantity: 1,
        },
      ],
      client_reference_id: bookingId,
      customer_email: email,
      success_url: `${process.env.URL}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/cancel`,
    });

    // Optionally record the Stripe session id in your booking row
    await supabase
      .from("bookings")
      .update({ stripe_session_id: session.id })
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
