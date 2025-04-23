import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../../utils/supabaseClient";
import { Link, useNavigate } from "react-router-dom";

const EditProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, username, avatar_url, phone_number")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      setFullName(data.full_name || "");
      setUsername(data.username || "");
      setAvatarUrl(data.avatar_url || "");
      setPhoneNumber(data.phone_number || "");
    } catch (err) {
      console.error("Error loading profile:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Username availability logic unchanged

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username && (!usernameAvailable || username.length < 3)) return;
    try {
      setLoading(true);
      setMessage("");
      setError("");
      const updates = {
        full_name: fullName,
        username,
        avatar_url: avatarUrl,
        phone_number: phoneNumber,
        updated_at: new Date(),
      };
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      if (error) throw error;
      setMessage("Profile updated successfully!");
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      // just use filename, not a duplicate 'avatars/' folder
      const filePath = fileName;

      // upload into the 'avatars' bucket
      let { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // **immediately** persist to profiles table**
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url: filePath })
        .eq("id", user.id);

      if (dbError) throw dbError;

      setAvatarUrl(filePath);
    } catch (err) {
      console.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-oxfordBlue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-oxfordBlue">Edit Profile</h2>
        <Link to="/profile" className="text-oxfordBlue hover:underline">
          Back to Profile
        </Link>
      </div>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar & Phone */}
          <div className="md:w-1/3 flex flex-col items-center">
            <div className="relative group w-32 h-32 mb-4">
              {avatarUrl ? (
                <img
                  src={`${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarUrl}`}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-4xl font-bold">
                  {fullName?.charAt(0)?.toUpperCase() ||
                    user.email.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <label className="w-full h-full flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer">
                  <span className="text-white text-sm">Change Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>
              </div>

              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <p className="text-gray-500 text-sm text-center mb-4">
              Click avatar to change
            </p>
            <label
              htmlFor="phoneNumber"
              className="block text-gray-700 font-medium mb-1"
            >
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-oxfordBlue"
            />
          </div>

          {/* Profile Details */}
          <div className="md:w-2/3 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="text"
                value={user.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
              <p className="mt-1 text-sm text-gray-500">
                Email cannot be changed
              </p>
            </div>
            <div>
              <label
                htmlFor="fullName"
                className="block text-gray-700 font-medium mb-1"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-oxfordBlue"
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-gray-700 font-medium mb-1"
              >
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  @
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value.toLowerCase().replace(/\s+/g, "")
                    )
                  }
                  placeholder="yourusername"
                  className={`w-full pl-7 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    username && !usernameAvailable
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-oxfordBlue"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder Sections */}
        <div className="mt-6 space-y-6">
          <fieldset>
            <legend className="text-lg font-semibold text-oxfordBlue">
              Active Subscriptions
            </legend>
            <p className="text-gray-500">
              Manage in Subscriptions settings (coming soon)
            </p>
          </fieldset>
          <fieldset>
            <legend className="text-lg font-semibold text-oxfordBlue">
              Call Recordings
            </legend>
            <p className="text-gray-500">
              View your recordings on Profile (coming soon)
            </p>
          </fieldset>
          <fieldset>
            <legend className="text-lg font-semibold text-oxfordBlue">
              Chat History
            </legend>
            <p className="text-gray-500">
              View conversation logs on Profile (coming soon)
            </p>
          </fieldset>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Link
            to="/profile"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={
              loading ||
              (username && (!usernameAvailable || username.length < 3))
            }
            className="bg-oxfordBlue text-white py-2 px-6 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;
