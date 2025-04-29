// src/pages/BookingSuccess.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("pending"); // pending | paid | error

  useEffect(() => {
    let timer;
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/booking-status?session_id=${sessionId}`);
        const { payment_status } = await res.json();
        if (payment_status === "paid") {
          setStatus("paid");
          clearInterval(timer);
        }
      } catch {
        setStatus("error");
        clearInterval(timer);
      }
    };

    // Poll every 2 seconds until paid (or error)
    checkStatus();
    timer = setInterval(checkStatus, 2000);
    return () => clearInterval(timer);
  }, [sessionId]);

  if (!sessionId) return <Navigate to="/" />;

  if (status === "paid") {
    // Redirect into your booking flow’s “Confirmation” step
    return <Navigate to={`/confirmed?session_id=${sessionId}`} />;
  }

  if (status === "error") {
    return <p>There was an error verifying your payment. Please contact support.</p>;
  }

  return <p>Waiting for payment confirmation…</p>;
}
