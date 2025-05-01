import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabaseClient";
import { Link } from "react-router-dom";
import OctagonalProfile from "../../components/common/Octagonal Profile";
import { useTranslation } from "react-i18next";

const tierNames = {
  // Example mappings:
  basic: "Basic Membership",
  premium: "Premium Membership",
  gold: "Gold Membership",
  // Add more as needed
};

export default function ProfilePage({ onChatOpen }) {
  const { user } = useAuth();
  const { t } = useTranslation();
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
    // Fetch chat sessions with titles
    supabase
      .from("chat_sessions")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching chat sessions:", error);
          return;
        }
        setSessions(data || []);
      });
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

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [
        { data: p, error: pError },
        { data: a },
        { data: coachingRequests, error: coachingError },
      ] = await Promise.all([
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
          .select(
            "id, service_type, created_at, membership_start_date, membership_end_date"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      // Log any errors to understand what's going wrong
      if (pError) console.error("Profiles Error:", pError);
      if (coachingError)
        console.error("Coaching Requests Error:", coachingError);

      // Fallback if no membership columns exist
      const processSubscriptions = (requests) => {
        return (requests || []).map((r) => {
          // Use created_at as fallback for start date
          const startDate = new Date(r.membership_start_date || r.created_at);
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 1); // Default to 1-month subscription

          return {
            id: r.id,
            name: tierNames[r.service_type] || r.service_type,
            since: startDate.toLocaleDateString(),
            expiresOn: endDate.toLocaleDateString(),
            daysRemaining: Math.max(
              0,
              Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24))
            ),
          };
        });
      };

      setProfile(p);
      setActiveSubscriptions(processSubscriptions(coachingRequests));
      setAppointments(a || []);
    } catch (err) {
      console.error("Full error in fetchProfileData:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        setPendingTestimonials((prev) =>
          prev.filter((testimonial) => testimonial.id !== id)
        );
        return;
      }

      // Now update the status to approved
      const { error } = await supabase
        .from("testimonials")
        .update({ status: "approved" })
        .eq("id", id);

      if (error) throw error;

      // Remove from pending list
      setPendingTestimonials((prev) =>
        prev.filter((testimonial) => testimonial.id !== id)
      );

      alert(t("profile.sections.testimonial_review.approved"));

      // Optional: Refresh the pending testimonials list
      fetchPendingTestimonials();
    } catch (err) {
      console.error("Error approving testimonial:", err);
      alert(t("profile.sections.testimonial_review.approve_error"));
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
      setPendingTestimonials((prev) =>
        prev.filter((testimonial) => testimonial.id !== id)
      );

      alert(t("profile.sections.testimonial_review.rejected"));
    } catch (err) {
      console.error("Error rejecting testimonial:", err);
      alert(t("profile.sections.testimonial_review.reject_error"));
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 border-2 border-t-transparent border-oxfordBlue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 m-4 rounded-lg text-center">
        <h3 className="font-bold text-lg">{t("profile.error.title")}</h3>
        <p>{error}</p>
      </div>
    );
  }

  const isSubscriptionActive = (endDate) => {
    const today = new Date();
    const subscriptionEnd = new Date(endDate);
    return today <= subscriptionEnd;
  };

  // In the render method or before rendering subscriptions
  const activeValidSubscriptions = activeSubscriptions.filter((sub) =>
    isSubscriptionActive(sub.expiresOn)
  );

  return (
    <div className="py-6 md:py-8 lg:py-12 px-4 md:px-6 lg:px-8 min-h-screen bg-gradient-to-b from-oxfordBlue via-oxfordBlue to-gentleGray">
      <div className="max-w-xs sm:max-w-md md:max-w-3xl lg:max-w-6xl mx-auto">
        {/* Profile Header - Enhanced for tablet/desktop */}
        <div className="bg-gentleGray rounded-xl shadow-lg p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row items-center gap-4 mb-6 md:mb-8">
          <div className="">
            <OctagonalProfile
              size={56}
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
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
              {profile.full_name || t("profile.unnamed")}
            </h2>
            <p className="text-sm md:text-base text-gray-500">
              {profile.username
                ? `@${profile.username}`
                : t("profile.no_username")}
            </p>
            <Link
              to="/edit-profile"
              className="mt-3 inline-block px-3 py-1 border border-oxfordBlue text-oxfordBlue hover:bg-oxfordBlue hover:text-white rounded-lg transition-colors duration-200 text-sm md:text-base"
            >
              {t("profile.edit_profile")}
            </Link>
          </div>
        </div>

        {/* Main Content - Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Left column on desktop - Full width on mobile/tablet */}
          <div className="space-y-6 lg:col-span-1">
            {/* Appointments Section */}
            <div className="bg-gentleGray p-4 sm:p-6 md:p-6 rounded-xl shadow-lg h-full">
              <h3 className="text-lg md:text-xl font-bold text-oxfordBlue pb-2">
                {t("profile.sections.appointments.title")}
              </h3>
              
              <div className="space-y-3">
                {appointments.length ? (
                  appointments.map((a) => (
                    <div
                      key={a.id}
                      className="border-2 border-oxfordBlue rounded-lg shadow-sm p-3 transition-all hover:shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <p className="text-sm md:text-base font-medium text-black">
                          {new Date(a.appointment_date).toLocaleString()}
                        </p>
                        <span className="w-auto px-2 py-1 bg-oxfordBlue text-white text-xs md:text-sm rounded-xl">
                          {a.duration_minutes} min
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm md:text-base text-gray-500">
                      {t("profile.sections.appointments.no_appointments")}
                    </p>
                    <button className="mt-4 px-4 py-2 bg-darkGold text-black rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors">
                      {t("calendar.book_appointment")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle column on desktop */}
          <div className="space-y-6 lg:col-span-1">
            {/* Subscriptions Section */}
            <div className="bg-gentleGray p-4 sm:p-6 md:p-8 rounded-xl shadow-lg h-full">
              <h3 className="text-lg md:text-xl font-bold text-oxfordBlue pb-2">
                {t("profile.sections.subscriptions.title")}
              </h3>
              
              <div className="space-y-3">
                {activeSubscriptions.length ? (
                  activeSubscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="border-2 border-oxfordBlue rounded-lg shadow-sm p-4 transition-all hover:shadow-md"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-semibold text-black">
                            {sub.name}
                          </p>
                          
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 mt-2 pt-2 border-t border-gray-200">
                          <p>
                            {t("profile.sections.subscriptions.since")} {sub.since}
                          </p>
                          <p>
                            {t("profile.sections.subscriptions.expires")} {sub.expiresOn}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm md:text-base text-gray-500">
                      {t("profile.sections.subscriptions.no_subscriptions")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column on desktop - Full width on mobile/tablet */}
          <div className="md:col-span-2 lg:col-span-1">
            {/* Conversation History */}
            <div className="bg-gentleGray p-4 sm:p-6 md:p-8 rounded-xl shadow-lg h-full">
              <h3 className="text-lg md:text-xl font-bold text-oxfordBlue pb-2">
                {t("profile.sections.conversations.title")}
              </h3>
              
              <div className="overflow-hidden h-full">
                {sessions.length > 0 ? (
                  <div className="space-y-3 max-h-[30vh] md:max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {sessions.map((s) => (
                      <button
                        key={s.id}
                        className="w-full text-left transition-colors border-2 border-oxfordBlue hover:bg-white/10 rounded-lg overflow-hidden"
                        onClick={() => {
                          setSelectedSession(s.id);
                          onChatOpen(s.id);
                        }}
                      >
                        <div className="p-2 flex justify-between items-center gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm md:text-base text-gray-800">{s.title || "Chat Session"}</p>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(s.updated_at || s.lastActivity).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4 border-2 border-dashed border-gray-300  rounded-lg h-full flex flex-col items-center justify-center">
                    <p className="text-gray-500 mb-4">
                      {t("profile.sections.conversations.no_chats")}
                    </p>
                    <button
                      onClick={() => onChatOpen()}
                      className="px-4 py-2 bg-darkGold text-black rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                    >
                      Start a conversation
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admin: Testimonial Review Section - Full width */}
        {isAdmin && (
          <div className="mt-8 bg-gentleGray p-4 sm:p-6 md:p-8 rounded-xl shadow-lg">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-lg md:text-xl font-bold text-oxfordBlue">
                {t("profile.sections.testimonial_review.title")}
              </h3>
              <button 
                onClick={() => fetchPendingTestimonials()}
                className="px-3 py-1 text-xs bg-oxfordBlue text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Refresh
              </button>
            </div>

            {testimonialLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-oxfordBlue border-t-transparent rounded-full"></div>
              </div>
            ) : pendingTestimonials.length === 0 ? (
              <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">
                  {t("profile.sections.testimonial_review.no_pending")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingTestimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-white rounded-lg p-4 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={testimonial.image_url}
                        alt={testimonial.author}
                        className="w-10 h-10 rounded-full object-cover border-2 border-darkGold"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/40";
                        }}
                      />
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {testimonial.author}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {new Date(testimonial.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="px-3 py-3 bg-gray-50 rounded-lg mb-3">
                      <p className="italic text-gray-700 text-sm">
                        "{testimonial.quote}"
                      </p>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleRejectTestimonial(testimonial.id)}
                        className="px-3 py-1 text-xs border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        {t("profile.sections.testimonial_review.reject")}
                      </button>
                      <button
                        onClick={() => handleApproveTestimonial(testimonial.id)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        {t("profile.sections.testimonial_review.approve")}
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
  );
}