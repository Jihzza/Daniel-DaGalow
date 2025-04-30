// netlify/functions/stripe-webhook.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
  console.log("🔄 Booking webhook received");
  
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let stripeEvent;
  try {
    // Parse the event
    if (process.env.NODE_ENV === 'development') {
      stripeEvent = JSON.parse(event.body);
      console.log("💻 Development mode: Using raw event data");
    } else {
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      const sig = event.headers["stripe-signature"];
      const buf = Buffer.from(event.body, "utf8");
      stripeEvent = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
      console.log("✅ Production mode: Verified Stripe signature");
    }
    
    console.log(`📣 Received Stripe event type: ${stripeEvent.type}`);
  } catch (err) {
    console.error(`❌ Error parsing webhook: ${err.message}`);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // Handle checkout.session.completed event for BOOKINGS ONLY
  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;
    const clientRef = session.client_reference_id;
    
    if (clientRef) {
      // IMPORTANT: Only process booking IDs (UUIDs, not integers)
      // Simple way to check: bookingIds are UUIDs with hyphens
      if (clientRef.includes('-')) {
        try {
          // Handle booking payments
          await supabase
            .from("bookings")
            .update({ payment_status: "paid" })
            .eq("id", clientRef);
            
          console.log(`Updated booking payment status for ID: ${clientRef}`);
        } catch (error) {
          console.error(`Error updating booking: ${error.message}`);
        }
      }
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true, type: stripeEvent.type }),
  };
};