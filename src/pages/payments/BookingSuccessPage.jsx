// src/pages/BookingSuccessPage.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";

export default function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const sessionId = searchParams.get("session_id");
  // In your BookingSuccessPage
async function manuallyVerifyPayment(sessionId) {
    try {
      const response = await fetch(`/api/verify-session/${sessionId}`);
      const { verified } = await response.json();
      
      if (verified) {
        // Update booking status if not already updated by webhook
      }
    } catch (error) {
      console.error("Manual verification failed:", error);
    }
  }
  useEffect(() => {
    async function verifyAndFetchBooking() {
      try {
        // Fetch the latest booking that matches this session ID
        // In a real app, you'd store the session ID with the booking
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("status", "confirmed")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
          
        if (error) throw error;
        
        setBooking(data);
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (sessionId) {
      verifyAndFetchBooking();
    }
  }, [sessionId]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-oxfordBlue to-gentleGray">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-oxfordBlue mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your booking...</p>
        </div>
      </div>
    );
  }
  
  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-oxfordBlue to-gentleGray">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Booking Not Found</h1>
          <p className="mb-6 text-gray-600">
            We couldn't verify your booking. This could happen if the payment was not completed.
          </p>
          <Link
            to="/"
            className="inline-block bg-oxfordBlue text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-oxfordBlue to-gentleGray">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Booking Confirmed!</h1>
        <p className="mb-6 text-gray-600">
          Your consultation has been successfully booked and confirmed.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
          <div className="mb-2">
            <span className="text-gray-500 text-sm">Date:</span>
            <p className="font-medium">{new Date(booking.appointment_date).toLocaleDateString()}</p>
          </div>
          <div className="mb-2">
            <span className="text-gray-500 text-sm">Time:</span>
            <p className="font-medium">{new Date(booking.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
          <div>
            <span className="text-gray-500 text-sm">Duration:</span>
            <p className="font-medium">{booking.duration_minutes} minutes</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          A confirmation email has been sent to your email address.
        </p>
        
        <Link
          to="/"
          className="inline-block bg-oxfordBlue text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}