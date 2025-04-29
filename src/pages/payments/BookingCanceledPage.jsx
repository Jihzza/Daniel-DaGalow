// src/pages/BookingCanceledPage.jsx
import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";

export default function BookingCanceledPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  
  React.useEffect(() => {
    // Mark the booking as canceled
    if (bookingId) {
      supabase
        .from("bookings")
        .update({ status: "canceled" })
        .eq("id", bookingId)
        .then(({ error }) => {
          if (error) {
            console.error("Error updating booking status:", error);
          }
        });
    }
  }, [bookingId]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-oxfordBlue to-gentleGray">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
        <div className="text-gray-500 text-5xl mb-4">✕</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Booking Canceled</h1>
        <p className="mb-6 text-gray-600">
          Your booking has been canceled because the payment was not completed.
        </p>
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors w-full"
          >
            Return to Home
          </Link>
          <Link
            to="/service-selection"
            className="inline-block bg-oxfordBlue text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors w-full"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}