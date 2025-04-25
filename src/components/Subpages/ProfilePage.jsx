// src/components/Subpages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../../utils/supabaseClient";
import { Link } from "react-router-dom";
import OctagonalProfile from "./Octagonal Profile";
import ChatbotWindow from "../BottomNavBar/ChatbotWindow";

export default function ProfilePage({ onChatOpen }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchProfileData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("messages")
      .select("session_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const seen = new Set();
        const list = [];
        for (const row of data) {
          if (!seen.has(row.session_id)) {
            seen.add(row.session_id);
            list.push({
              session_id: row.session_id,
              lastActivity: row.created_at,
            });
          }
        }
        setSessions(list);
      });
  }, [user]);

  async function fetchProfileData() {
    setLoading(true);
    try {
      const [{ data: p, error: pError }, { data: a }, { data: s }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, username, avatar_url, phone_number")
            .eq("id", user.id)
            .single(),
          supabase
            .from("appointments")
            .select("*")
            .eq("user_id", user.id)
            .order("appointment_date", { ascending: true }),
          supabase
            .from("coaching_requests")
            .select("id, service_type, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
        ]);

      if (pError) throw pError;
      setProfile(p);

      const tierNames = {
        weekly: "Basic — 40 € /mo",
        daily: "Standard — 90 € /mo",
        priority: "Premium — 230 € /mo",
      };
      setActiveSubscriptions(
        (s || []).map((r) => ({
          id: r.id,
          name: tierNames[r.service_type] || r.service_type,
          since: new Date(r.created_at).toLocaleDateString(),
        }))
      );

      setAppointments(a || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full"></div>
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
    <>
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Header */}
          <div className="bg-gentleGray rounded-xl shadow-md p-6 flex items-center space-x-4">
            <OctagonalProfile
              size={64}
              borderColor="#002147"
              innerBorderColor="#ECEBE5"
              imageSrc={
                profile?.avatar_url
                  ? `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`
                  : null
              }
              fallbackText={
                profile?.full_name?.[0]?.toUpperCase() ||
                user.email[0].toUpperCase()
              }
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
              {appointments.length ? (
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
          <div className="bg-gentleGray p-4 rounded-xl flex flex-col shadow-md">
            <h3 className="text-lg font-bold text-black mb-3">
              Active Subscriptions
            </h3>
            <div className="space-y-3">
              {activeSubscriptions.length ? (
                activeSubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center"
                  >
                    <p className="text-sm text-gray-800">{sub.name}</p>
                    <p className="text-xs text-gray-500">Since {sub.since}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No subscriptions found.</p>
              )}
            </div>
          </div>

          {/* Conversation History */}
          <div className="bg-gentleGray p-4 rounded-xl shadow-md">
            <h4 className="font-semibold mb-2">Your Conversations</h4>
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
              {sessions.length > 0 ? (
                sessions.map((s) => (
                  <button
                    key={s.session_id}
                    className={`w-full text-left text-sm px-2 py-1 rounded ${
                      s.session_id === selectedSession
                        ? "border-b-2 border-darkGold text-black"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setSelectedSession(s.session_id);
                      onChatOpen(s.session_id); // <-- use the same ChatbotWindow
                    }}
                  >
                    {new Date(s.lastActivity).toLocaleString()}
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500">No chats yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
