// src/components/Subpages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../../utils/supabaseClient";
import { Link } from "react-router-dom";
import OctagonalProfile from "./Octagonal Profile";

export default function ProfilePage({ onChatOpen }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingTestimonials, setPendingTestimonials] = useState([]);
  const [testimonialLoading, setTestimonialLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchProfileData();
    checkAdminStatus();
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
            .from("bookings")
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

  async function checkAdminStatus() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      
      if (data && data.role === "admin") {
        setIsAdmin(true);
        // If user is admin, fetch pending testimonials
        fetchPendingTestimonials();
      }
    } catch (err) {
      console.error("Error checking admin status:", err);
    }
  }

  async function fetchPendingTestimonials() {
    try {
      setTestimonialLoading(true);
      
      console.log("Fetching pending testimonials...");
      
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      console.log("Pending testimonials fetched:", data?.length || 0);
      setPendingTestimonials(data || []);
    } catch (err) {
      console.error("Error fetching pending testimonials:", err);
    } finally {
      setTestimonialLoading(false);
    }
  }

  async function handleApproveTestimonial(id) {
    try {
      // First check if the testimonial exists and is still pending
      const { data: checkData, error: checkError } = await supabase
        .from("testimonials")
        .select("status")
        .eq("id", id)
        .single();
      
      if (checkError) throw checkError;
      if (!checkData || checkData.status !== "pending") {
        console.log("Testimonial already processed or doesn't exist");
        setPendingTestimonials(prev => 
          prev.filter(testimonial => testimonial.id !== id)
        );
        return;
      }
      
      // Now update the status to approved
      const { error } = await supabase
        .from("testimonials")
        .update({ status: "approved" })
        .eq("id", id);
      
      if (error) throw error;
      
      console.log("Testimonial approved successfully:", id);
      
      // Remove from pending list
      setPendingTestimonials(prev => 
        prev.filter(testimonial => testimonial.id !== id)
      );
      
      alert("Testimonial approved successfully!");
      
      // Optional: Refresh the pending testimonials list
      fetchPendingTestimonials();
    } catch (err) {
      console.error("Error approving testimonial:", err);
      alert("Failed to approve testimonial: " + err.message);
    }
  }

  async function handleRejectTestimonial(id) {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ status: "rejected" })
        .eq("id", id);
      
      if (error) throw error;
      
      // Remove from pending list
      setPendingTestimonials(prev => 
        prev.filter(testimonial => testimonial.id !== id)
      );
      
      alert("Testimonial rejected successfully");
    } catch (err) {
      console.error("Error rejecting testimonial:", err);
      alert("Failed to reject testimonial");
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
      <div className="min-h-screen py-6 px-4">
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
            <h4 className="text-lg font-bold text-black mb-3">Your Conversations</h4>
            <div className="bg-white rounded-xl shadow-sm p-4">
              {sessions.length > 0 ? (
                sessions.map((s) => (
                  <button
                    key={s.session_id}
                    className={`w-full text-left text-sm p-2 ${
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

          {isAdmin && (
            <div className="bg-gentleGray p-4 rounded-xl shadow-md">
              <h3 className="text-lg font-bold text-black mb-3">
                Testimonial Review
              </h3>
              
              {testimonialLoading ? (
                <div className="bg-white p-4 rounded-xl flex justify-center">
                  <div className="animate-spin h-8 w-8 border-2 border-oxfordBlue border-t-transparent rounded-full"></div>
                </div>
              ) : pendingTestimonials.length === 0 ? (
                <div className="bg-white p-4 rounded-xl">
                  <p className="text-gray-500 text-center">No testimonials pending review.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTestimonials.map(testimonial => (
                    <div key={testimonial.id} className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center space-x-3 mb-2">
                        <img 
                          src={testimonial.image_url} 
                          alt={testimonial.author}
                          className="w-12 h-12 rounded-full object-cover border-2 border-darkGold"
                        />
                        <div>
                          <h4 className="font-medium text-gray-800">{testimonial.author}</h4>
                          <p className="text-xs text-gray-500">
                            {new Date(testimonial.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <p className="italic text-gray-700 my-2 text-sm">"{testimonial.quote}"</p>
                      
                      <div className="flex justify-end space-x-2 mt-3">
                        <button
                          onClick={() => handleRejectTestimonial(testimonial.id)}
                          className="px-3 py-1 text-sm border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveTestimonial(testimonial.id)}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
