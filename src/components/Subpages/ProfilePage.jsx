import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../../utils/supabaseClient";
import { Link } from "react-router-dom";
import OctagonalProfile from "./Octagonal Profile";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fallback initial for avatar
  const initial = (
    profile?.full_name?.[0] ??
    user?.email?.[0] ??
    "?"
  ).toUpperCase();

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch profile, appointments, and coaching requests in parallel
      const [
        { data: p, error: pError },
        { data: a, error: aError },
        { data: s, error: sError }
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, username, avatar_url, phone_number")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("appointments")
          .select("*")
          .eq("user_id", user.id)
          .order("appointment_date", { ascending: true }),
        supabase
          .from("coaching_requests")
          .select("id, service_type, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
      ]);

      if (pError) throw pError;
      if (aError) throw aError;
      if (sError) throw sError;

      // Ensure we always have a profile object
      setProfile(p || {
        full_name: "",
        username: "",
        avatar_url: null,
        phone_number: null,
      });

      // Appointments
      setAppointments(a || []);

      // Map coaching_requests → activeSubscriptions
      const tierNames = {
        weekly:   "Basic — 40 € / mo",
        daily:    "Standard — 90 € / mo",
        priority: "Premium — 230 € / mo",
      };
      setActiveSubscriptions(
        (s || []).map((r) => ({
          id:    r.id,
          name:  tierNames[r.service_type] || r.service_type,
          since: new Date(r.created_at).toLocaleDateString(),
        }))
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 m-4 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Profile Header */}
        <div className="bg-gentleGray rounded-xl shadow-md p-4 flex items-center space-x-4">
          <OctagonalProfile
            size={64}
            borderColor="#002147"
            innerBorderColor="#ECEBE5"
            imageSrc={
              profile.avatar_url
                ? `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`
                : null
            }
            fallbackText={initial}
          />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {profile.full_name || "Unnamed"}
            </h2>
            <p className="text-sm text-gray-500">
              {profile.username ? `@${profile.username}` : "No username"}
            </p>
            <Link
              to="/edit-profile"
              className="mt-2 inline-block text-darkGold/50 text-sm hover:underline"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Appointments */}
        <div className="bg-gentleGray p-4 rounded-xl flex flex-col shadow-md">
          <h3 className="text-lg font-bold text-black mb-3">
            Upcoming Appointments
          </h3>
          <div className="space-y-3">
            {appointments.length > 0 ? (
              appointments.map((a) => (
                <div
                  key={a.id}
                  className="bg-white rounded-xl shadow-sm flex justify-between items-center p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {a.service_type || "Appointment"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(a.appointment_date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No upcoming appointments.
              </p>
            )}
          </div>
        </div>

        {/* Subscriptions */}
        <div className="bg-gentleGray p-4 rounded-xl shadow-md">
          <h3 className="text-lg font-bold text-black mb-3">
            Active Subscriptions
          </h3>
          <div className="space-y-3">
            {activeSubscriptions.length > 0 ? (
              activeSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center"
                >
                  <p className="text-sm text-gray-800">{sub.name}</p>
                  <p className="text-xs text-gray-500">
                    Since {sub.since}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No subscriptions found.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
