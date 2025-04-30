const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const { id } = event.queryStringParameters;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing booking ID" }),
    };
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("payment_status")
    .eq("id", id)
    .single();

  if (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch booking status" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ paymentStatus: data.payment_status }),
  };
};