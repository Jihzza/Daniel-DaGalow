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
      const clientRef = session.client_reference_id; // This will be the UUID string
            
      if (clientRef) {
        // Create a fresh connection
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        // REMOVE THIS LINE
        // const parsedId = parseInt(clientRef, 10);

        // REMOVE THIS CHECK or adapt if clientRef could be other things for other flows
        // if (!isNaN(parsedId)) { 
        
        // --- START MODIFIED SECTION ---
        // Update using the UUID string directly
        const { error: updateError } = await supabase
          .from("coaching_requests")
          .update({ payment_status: "paid" })
          .eq("id", clientRef); // Use clientRef (UUID string) directly
        // --- END MODIFIED SECTION ---
            
        if (updateError) {
          console.error("Webhook: Error updating payment status for coaching_requests ID:", clientRef, updateError);
          // Depending on your error handling strategy, you might want to return a 500 here
          // or ensure Stripe knows the webhook failed for this event if critical.
          // For now, we'll let it return 200 to Stripe but log the error.
        }
        // } // End of the removed isNaN check
      }
    }
    
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error("Coaching webhook error:", err.message);
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }; // Return 400 to Stripe if parsing or other top-level errors occur
  }
};