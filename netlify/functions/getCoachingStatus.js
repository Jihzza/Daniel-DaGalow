// netlify/functions/getCoachingStatus.js
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const { id } = event.queryStringParameters;
  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing request ID" }) };
  }

  try {
    const { data, error } = await supabase
      .from("coaching_requests")
      .select("payment_status")
      .eq("id", id)             // UUID string match
      .single();

    if (error) {
      console.error("Error fetching payment status:", error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return { statusCode: 200, body: JSON.stringify({ paymentStatus: data.payment_status }) };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
