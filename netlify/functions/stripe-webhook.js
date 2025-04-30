const { buffer } = require("@netlify/functions");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = event.headers["stripe-signature"];
  const buf = Buffer.from(event.body, "utf8");

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Stripe webhook error:", err.message);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;
  
    const clientRef = session.client_reference_id; // You must set this when starting checkout
  
    if (clientRef) {
      await supabase
        .from("bookings")
        .update({ payment_status: "paid" })
        .eq("id", clientRef);
    }
  }
  

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};


