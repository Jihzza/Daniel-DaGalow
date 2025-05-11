// netlify/functions/createCoachingSession.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Pricing map for coaching tiers (in cents)
const TIER_PRICES = {
  Weekly: 4000, // €40.00 // Assuming your comment meant this might be a promotional $0
  Daily: 9000, // €90.00
  Priority: 23000, // €230.00
};

exports.handler = async (event) => {
  console.log("✔️ createCoachingSession invoked");
  console.log("Raw event.body:", event.body);
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { requestId, tier, email, isTestBooking } = body; // requestId is a UUID string

  if (!requestId || !tier || !email) {
    console.error("Missing required parameters:", { requestId, tier, email });
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Missing parameters",
        data: { requestId, tier, email },
      }),
    };
  }

  // REMOVE THIS BLOCK START
  // Parse ID as integer since coaching_requests uses int8  <-- This comment is incorrect for 'id' which is UUID
  // const parsedRequestId = parseInt(requestId, 10);

  // if (isNaN(parsedRequestId)) {
  //   console.error("Invalid request ID (not an integer):", requestId);
  //   return { statusCode: 400, body: "Invalid request ID format" };
  // }
  // REMOVE THIS BLOCK END

  // Calculate price - free for test bookings
  const unitAmount = isTestBooking === true ? 0 : TIER_PRICES[tier] || 0;

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
              name: isTestBooking
                ? `Test Coaching (${tier})`
                : `Coaching Package: ${tier}`,
            },
          },
          quantity: 1,
        },
      ],
      // Use the original UUID string requestId for client_reference_id
      client_reference_id: requestId,
      customer_email: email,
      success_url: `${process.env.URL || "https://www.danieldagalow.com"}/payment-complete.html`,
      cancel_url: `${process.env.URL || "https://www.danieldagalow.com"}/payment-cancelled.html`,
    });

    // --- START MODIFIED SECTION ---
    // Update the existing coaching_requests record with the Stripe session ID
    const { error: updateError } = await supabase
      .from("coaching_requests")
      .update({ stripe_session_id: session.id }) // Store Stripe's session.id
      .eq("id", requestId); // Match by the UUID requestId

    if (updateError) {
      console.error("Error updating Supabase with Stripe session ID:", updateError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Internal Server Error: Failed to update request with Stripe session ID. ${updateError.message}` }),
      };
    }
    // --- END MODIFIED SECTION ---

    // REMOVE THIS MISPLACED BLOCK START (This looks like frontend logic)
    // const { data } = await supabase
    //   .from("coaching_requests")
    //   .insert(payload) // payload is not defined here
    //   .select("id")
    //   .single();
    // setRequestId(data.id); // setRequestId is a frontend function
    // REMOVE THIS MISPLACED BLOCK END

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("Error creating Stripe session or updating Supabase:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Internal Server Error: ${err.message}` }),
    };
  }
};