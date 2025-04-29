const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { supabase } = require('../../src/utils/supabaseClient');

exports.handler = async (event) => {
  try {
    // Verify the webhook signature
    const signature = event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        event.body,
        signature,
        webhookSecret
      );
    } catch (err) {
      return {
        statusCode: 400,
        body: `Webhook Error: ${err.message}`
      };
    }
    
    // Handle checkout.session.completed event
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      const clientReferenceId = session.client_reference_id;
      
      // Update booking status in Supabase
      if (clientReferenceId) {
        await supabase
          .from('bookings')
          .update({ payment_status: 'paid' })
          .eq('payment_reference', clientReferenceId);
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Webhook Error: ${error.message}`
    };
  }
};