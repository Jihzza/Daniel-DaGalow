// server.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const app = express();

// For regular routes
app.use(cors());
app.use(express.json());

// For Stripe webhook (needs raw body)
app.post('/webhook', 
  express.raw({type: 'application/json'}), 
  handleStripeWebhook
);

// Route to create a checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { bookingId, duration, name, email } = req.body;
    
    // Map duration to price (in cents)
    const prices = {
      45: 9000,  // 90€ for 45 minutes
      60: 12000, // 120€ for 60 minutes
      75: 15000, // 150€ for 75 minutes
      90: 18000, // 180€ for 90 minutes
      105: 21000, // 210€ for 105 minutes
      120: 24000 // 240€ for 120 minutes
    };
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Consultation (${duration} minutes)`,
              description: `Booking ID: ${bookingId}`,
            },
            unit_amount: prices[duration] || 9000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      client_reference_id: bookingId,
      customer_email: email,
      metadata: {
        booking_id: bookingId,
        name: name,
        duration: duration
      },
      success_url: `${process.env.FRONTEND_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/booking-canceled?booking_id=${bookingId}`,
    });
    
    // Return the session URL to redirect the user
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Webhook handler function
async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle specific event types
  switch (event.type) {
    case 'checkout.session.completed':
      // Payment was successful
      const session = event.data.object;
      await handleSuccessfulPayment(session);
      break;
      
    case 'payment_intent.payment_failed':
      // Payment failed
      const paymentIntent = event.data.object;
      await handleFailedPayment(paymentIntent);
      break;
  }
  
  // Return success response to Stripe
  res.json({ received: true });
}

// Handle successful payment
async function handleSuccessfulPayment(session) {
  try {
    const bookingId = session.metadata.booking_id;
    
    // Update the booking status in Supabase
    const { error } = await supabase
      .from('bookings')
      .update({ 
        status: 'confirmed',
        payment_intent_id: session.payment_intent
      })
      .eq('id', bookingId);
    
    if (error) {
      console.error('Error updating booking status:', error);
    }
    
    // You could add email notification here
    // sendConfirmationEmail(session.customer_email, bookingId);
  } catch (err) {
    console.error('Error handling successful payment:', err);
  }
}

// Handle failed payment
async function handleFailedPayment(paymentIntent) {
  try {
    // Find booking by payment_intent_id
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('payment_intent_id', paymentIntent.id)
      .single();
    
    if (error || !data) {
      console.error('Error finding booking:', error);
      return;
    }
    
    // Update the booking status
    await supabase
      .from('bookings')
      .update({ status: 'canceled' })
      .eq('id', data.id);
      
  } catch (err) {
    console.error('Error handling failed payment:', err);
  }
}

// Start the server
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));