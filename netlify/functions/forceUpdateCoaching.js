// netlify/functions/forceUpdateCoaching.js
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

  console.log("🔄 Force updating payment status for coaching request ID:", id);
  const requestId = parseInt(id, 10);
  
  if (isNaN(requestId)) {
    console.error("❌ Invalid request ID (not an integer):", id);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request ID format" }),
    };
  }

  // First verify the coaching request exists
  const { data: verifyData, error: verifyError } = await supabase
    .from("coaching_requests")
    .select("id, payment_status, stripe_session_id")
    .eq("id", requestId)
    .single();
    
  if (verifyError) {
    console.error("❌ Error verifying coaching request:", verifyError);
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Coaching request not found", details: verifyError.message }),
    };
  }
  
  console.log("🔍 Found coaching request:", verifyData);
  
  // Try multiple update methods
  
  // Method 1: Standard update
  try {
    console.log("⚙️ Attempting standard update");
    const { data, error } = await supabase
      .from("coaching_requests")
      .update({ payment_status: "paid" })
      .eq("id", requestId)
      .select();

    if (error) {
      console.error("❌ Standard update failed:", error);
    } else {
      console.log("✅ Standard update succeeded:", data);
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, method: "standard", data }),
      };
    }
  } catch (err) {
    console.error("❌ Error in standard update:", err);
  }
  
  // Method 2: Try RPC function
  try {
    console.log("⚙️ Attempting update via RPC function");
    const { data, error } = await supabase.rpc(
      'update_coaching_payment',
      { request_id: requestId }
    );
    
    if (error) {
      console.error("❌ RPC update failed:", error);
    } else {
      console.log("✅ RPC update succeeded:", data);
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, method: "rpc", data }),
      };
    }
  } catch (err) {
    console.error("❌ Error in RPC update:", err);
  }
  
  // Method 3: Raw SQL as last resort
  try {
    console.log("⚙️ Attempting raw SQL update");
    const { data, error } = await supabase.rpc(
      'execute_raw_sql',
      { sql: `UPDATE coaching_requests SET payment_status = 'paid' WHERE id = ${requestId}` }
    );
    
    if (error) {
      console.error("❌ Raw SQL update failed:", error);
    } else {
      console.log("✅ Raw SQL update succeeded");
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, method: "raw_sql" }),
      };
    }
  } catch (err) {
    console.error("❌ Error in raw SQL update:", err);
  }
  
  // If all methods failed, check the current state
  const { data: finalData, error: finalError } = await supabase
    .from("coaching_requests")
    .select("id, payment_status, stripe_session_id")
    .eq("id", requestId)
    .single();
    
  if (finalError) {
    console.error("❌ Final status check failed:", finalError);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "All update methods failed and couldn't verify final state",
        details: finalError.message 
      }),
    };
  }
  
  console.log("📊 Final state after all attempts:", finalData);
  
  return {
    statusCode: 500,
    body: JSON.stringify({ 
      error: "All update methods failed", 
      current_state: finalData
    }),
  };
};