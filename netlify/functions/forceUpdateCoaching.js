// netlify/functions/forceUpdateCoaching.js
const stripe    = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  const { id } = event.queryStringParameters;
  if (!id) return { statusCode:400, body:"Missing id" };

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 1) fetch the stripe_session_id
  const { data, error } = await supabase
    .from("coaching_requests")
    .select("stripe_session_id")
    .eq("id", parseInt(id,10))
    .single();
  if (error || !data.stripe_session_id) {
    return { statusCode:400, body:"No session ID" };
  }

  // 2) retrieve the session from Stripe
  const sess = await stripe.checkout.sessions.retrieve(data.stripe_session_id);
  if (sess.payment_status === "paid") {
    // 3) update Supabase
    await supabase
      .from("coaching_requests")
      .update({ payment_status: "paid" })
      .eq("id", parseInt(id,10));
  }

  return { statusCode:200, body:JSON.stringify({ ok: true }) };
};
