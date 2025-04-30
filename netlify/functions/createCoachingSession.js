// netlify/functions/createCoachingSession.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Pricing map for coaching tiers (in cents)
const TIER_PRICES = {
  Weekly: 4000,  // €40.00
  Daily: 9000,  // €90.00
  Priority: 23000, // €230.00
};

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

  const { requestId, tier, email, isTestBooking } = body;
  
  if (!requestId || !tier || !email) {
    console.error("Missing required parameters:", { requestId, tier, email });
    return { statusCode: 400, body: "Missing parameters" };
  }

  // Parse ID as integer since coaching_requests uses int8
  const parsedRequestId = parseInt(requestId, 10);
  
  if (isNaN(parsedRequestId)) {
    console.error("Invalid request ID (not an integer):", requestId);
    return { statusCode: 400, body: "Invalid request ID format" };
  }

  // Calculate price - free for test bookings
  const unitAmount = isTestBooking === true ? 0 : TIER_PRICES[tier] || 0;

  console.log(`Creating Stripe session for coaching ID ${parsedRequestId}, tier: ${tier}, amount: ${unitAmount}`);

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
              name: isTestBooking ? `Test Coaching (${tier})` : `Coaching Package: ${tier}`,
            },
          },
          quantity: 1,
        },
      ],
      client_reference_id: parsedRequestId.toString(), // Convert back to string for Stripe
      customer_email: email,
      success_url: `${process.env.URL || 'http://localhost:8888'}/payment-complete.html`,
      cancel_url: `${process.env.URL || 'http://localhost:8888'}/payment-cancelled.html`,
    });

    console.log(`Stripe session created: ${session.id}`);

    // FIXED: Use stripe_session_id instead of stripe_session
    const { data, error } = await supabase
      .from("coaching_requests")
      .update({ 
        stripe_session_id: session.id,  // CHANGED: stripe_session -> stripe_session_id
        is_test_booking: isTestBooking === true
      })
      .eq("id", parsedRequestId)
      .select();

    if (error) {
      console.error("Error updating coaching request with session ID:", error);
    } else {
      console.log("Coaching request updated with session ID:", data);
    }

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