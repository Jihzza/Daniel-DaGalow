import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../../utils/supabaseClient";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [recordings, setRecordings] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeSubscription, setActiveSubscription] = useState(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAppointments();
      fetchSubscriptions();
      // TODO: fetchUserInfo();
      // TODO: fetchRecordings();
      // TODO: fetchChatHistory();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      if (!user?.id) throw new Error("No user ID available");
      const { data, error: queryError } = await supabase
        .from("profiles")
        .select("full_name, username, avatar_url, phone_number")
        .eq("id", user.id)
        .single();
      if (queryError) throw queryError;
      setProfile(data);
      setPhoneNumber(data.phone_number || "");
    } catch (err) {
      setError(`Error fetching profile data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("appointment_date", { ascending: true });
      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      console.error("Error fetching appointments:", err.message);
    }
  };

  async function fetchSubscriptions() {
    try {
      const { data, error } = await supabase
        .from("coaching_requests")
        .select("id, service_type, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      // map tier codes to human labels + prices
      const tierNames = {
        weekly: "Basic — 40 € / mo",
        daily: "Standard — 90 € / mo",
        priority: "Premium — 230 € / mo",
      };
      setActiveSubscriptions(
        (data || []).map((r) => ({
          id: r.id,
          name: tierNames[r.service_type] || r.service_type,
          since: new Date(r.created_at).toLocaleDateString(),
        }))
      );
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-oxfordBlue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <section id="profile" className="py-8 px-4">
        <div className="max-w-4xl mx-auto my-8 p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="profile" className="py-12 px-4 h-auto">
      <div className="max-w-4xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-oxfordBlue">Profile</h1>
          <Link to="/edit-profile" className="text-oxfordBlue hover:underline">
            Edit Profile
          </Link>
        </div>

        {/* Avatar & Basic Info */}
        <div className="flex items-center gap-6 mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
            {profile?.avatar_url ? (
              <img
              src={`${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`}

                alt="Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    profile.full_name || user.email
                  )}&size=128`;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl font-bold">
                {profile?.full_name?.charAt(0)?.toUpperCase() ||
                  user.email.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p>
              <strong>Name:</strong> {profile.full_name || "Not set"}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Username:</strong>{" "}
              {profile.username ? `@${profile.username}` : "Not set"}
            </p>
            <p>
              <strong>Phone:</strong> {phoneNumber || "Not set"}
            </p>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-oxfordBlue mb-3">
            Upcoming Appointments
          </h2>
          {appointments.length ? (
            appointments.map((a) => (
              <div key={a.id} className="border p-4 rounded mb-2">
                <p>
                  {a.service_type || "Appointment"} on{" "}
                  {new Date(a.appointment_date).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p>No upcoming appointments.</p>
          )}
        </div>

        {/* Active Subscriptions */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-oxfordBlue mb-3">
            Active Subscriptions
          </h2>
          {activeSubscriptions.length > 0 ? (
            <ul className="space-y-2">
              {activeSubscriptions.map((sub) => (
                <li
                  key={sub.id}
                  className="border p-3 rounded flex justify-between"
                >
                  <span>{sub.name}</span>
                  <span className="text-sm text-gray-500">
                    Since {sub.since}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No active subscriptions.</p>
          )}
        </div>

        {/* Additional User Info */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-oxfordBlue mb-3">
            More About You
          </h2>
          <pre className="bg-gray-100 p-3 rounded h-32 overflow-auto">
            {JSON.stringify(userInfo, null, 2)}
          </pre>
        </div>

        {/* Call Recordings */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-oxfordBlue mb-3">
            Call Recordings
          </h2>
          {recordings.length ? (
            recordings.map((r) => (
              <div key={r.id} className="mb-2">
                <a
                  href={r.url}
                  className="text-oxfordBlue hover:underline"
                  download
                >
                  Download recording #{r.id}
                </a>
              </div>
            ))
          ) : (
            <p>No recordings available.</p>
          )}
        </div>

        {/* Chat History */}
        <div>
          <h2 className="text-xl font-semibold text-oxfordBlue mb-3">
            Chat History
          </h2>
          <div className="bg-gray-50 p-3 rounded h-40 overflow-auto">
            {chatHistory.length ? (
              chatHistory.map((msg, idx) => (
                <div key={idx} className="mb-1">
                  <span className="font-bold">{msg.sender}:</span> {msg.text}
                </div>
              ))
            ) : (
              <p>No chat history.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
