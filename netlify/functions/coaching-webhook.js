// netlify/functions/coaching-webhook.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  

  try {
    // Parse the event data
    const stripeEvent = JSON.parse(event.body);
    
    if (stripeEvent.type === "checkout.session.completed") {
      const session = stripeEvent.data.object;
      const clientRef = session.client_reference_id;
            
      if (clientRef) {
        // Create a fresh connection
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        const parsedId = parseInt(clientRef, 10);
        if (!isNaN(parsedId)) {
          // Simple update with no .select()
          await supabase
            .from("coaching_requests")
            .update({ payment_status: "paid" })
            .eq("id", parsedId);
            
        }
      }
    }
    
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error("Coaching webhook error:", err.message);
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
  }
};