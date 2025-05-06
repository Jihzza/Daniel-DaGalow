// netlify/functions/getCoachingStatus.js
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
      body: JSON.stringify({ error: "Missing request ID" }),
    };
  }


  // IMPORTANT: Parse as integer since your ID column is int8
  const requestId = parseInt(id, 10);
  
  if (isNaN(requestId)) {
    console.error("Invalid request ID (not an integer):", id);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request ID format" }),
    };
  }
  
  try {
    // Query by integer ID - FIXED: Changed column name from stripe_session to stripe_session_id
    const { data, error } = await supabase
      .from("coaching_requests")
      .select("payment_status, stripe_session_id")  // Changed from stripe_session
      .eq("id", requestId)
      .single();

    if (error) {
      console.error("Error fetching payment status:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "Failed to fetch payment status",
          details: error.message
        }),
      };
    }
    
    // Return the current status from the database
    return {
      statusCode: 200,
      body: JSON.stringify({ paymentStatus: data.payment_status }),
    };
  } catch (err) {
    console.error("Unexpected error in getCoachingStatus:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: err.message }),
    };
  }
};