// netlify/functions/forceUpdateCoaching.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  const { id } = event.queryStringParameters; // id is a UUID string
  if (!id) return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // 1) fetch the stripe_session_id
    const { data, error } = await supabase
      .from("coaching_requests")
      .select("stripe_session_id")
      // --- START MODIFIED SECTION ---
      .eq("id", id) // Use id (UUID string) directly
      // --- END MODIFIED SECTION ---
      .single();

    if (error) {
      console.error("Error fetching stripe_session_id for ID:", id, error);
      return { statusCode: 500, body: JSON.stringify({ error: `Error fetching session ID: ${error.message}` }) };
    }
    if (!data || !data.stripe_session_id) {
      console.warn("No stripe_session_id found for ID:", id);
      return { statusCode: 404, body: JSON.stringify({ error: "No session ID found for this request" }) };
    }

    // 2) retrieve the session from Stripe
    const sess = await stripe.checkout.sessions.retrieve(data.stripe_session_id);
    
    if (sess.payment_status === "paid") {
      // 3) update Supabase
      const { error: updateError } = await supabase
        .from("coaching_requests")
        .update({ payment_status: "paid" })
        // --- START MODIFIED SECTION ---
        .eq("id", id); // Use id (UUID string) directly
      // --- END MODIFIED SECTION ---
      
      if (updateError) {
        console.error("Error updating payment_status for ID:", id, updateError);
        return { statusCode: 500, body: JSON.stringify({ error: `Error updating payment status: ${updateError.message}` }) };
      }
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, payment_status: sess.payment_status }) };

  } catch (err) {
    console.error("Force update coaching error for ID:", id, err);
    return { statusCode: 500, body: JSON.stringify({ error: `Internal Server Error: ${err.message}` }) };
  }
};