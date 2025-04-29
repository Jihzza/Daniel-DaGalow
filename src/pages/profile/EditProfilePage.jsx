import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import OctagonalProfile from "../../components/common/Octagonal Profile";
import { useTranslation } from 'react-i18next';

const EditProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
  const initial = (fullName?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, username, avatar_url, phone_number")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        setFullName("");
        setUsername("");
        setAvatarUrl("");
        setPhoneNumber("");
      } else {
        setFullName(data.full_name || "");
        setUsername(data.username || "");
        setAvatarUrl(data.avatar_url || "");
        setPhoneNumber(data.phone_number || "");
      }
    } catch (err) {
      console.error("Error loading profile:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

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
      setMessage(t('edit_profile.profile_updated'));
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
    <div className="py-6 md:py-8 lg:py-12 px-4 md:px-6 lg:px-8 min-h-screen">
      <div className="max-w-xs sm:max-w-md md:max-w-3xl lg:max-w-4xl mx-auto">
        {/* Header with Title and Back Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            {t('edit_profile.title')}
          </h2>
        </div>

        {/* Notification Messages */}
        {message && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <svg 
                className="w-5 h-5 mr-2" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd"
                />
              </svg>
              <p>{t('edit_profile.profile_updated')}</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <svg 
                className="w-5 h-5 mr-2" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd"
                />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Main Form Container */}
        <div className="rounded-xl p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Left Column - Avatar & Phone */}
              <div className="md:col-span-1 h-full">
                <div className="flex flex-col items-center space-y-4 bg-gentleGray p-4 sm:p-6 rounded-lg shadow-sm h-full">
                  {/* Avatar Upload */}
                  <div className="relative">
                    <div 
                      className="cursor-pointer group"
                      onClick={() => document.getElementById("avatar-upload").click()}
                    >
                      <OctagonalProfile
                        size={120}
                        borderColor="#002147"
                        innerBorderColor="#ECEBE5"
                        imageSrc={
                          avatarUrl
                            ? `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarUrl}`
                            : null
                        }
                        fallbackText={initial}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-full">
                        <svg 
                          className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={uploadAvatar} 
                      id="avatar-upload" 
                      className="sr-only" 
                      disabled={uploading}
                    />
                    
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-white"></div>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-oxfordBlue text-sm text-center">
                    {t('edit_profile.avatar.change')}
                  </p>
                  
                  {/* Phone Number Input */}
                  <div className="w-full mt-4">
                    <label
                      htmlFor="phoneNumber"
                      className="block text-oxfordBlue font-medium mb-2"
                    >
                      {t('edit_profile.form.phone_number.label')}
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-oxfordBlue bg-gentleGray rounded-lg focus:outline-none focus:ring-2 focus:ring-oxfordBlue focus:border-transparent transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Profile Details */}
              <div className="md:col-span-2 h-full">
                <div className="bg-gentleGray p-4 sm:p-6 rounded-lg shadow-sm space-y-5 h-full">
                  {/* Email Field (Read-only) */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      {t('edit_profile.form.email.label')}
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="text"
                        value={user.email}
                        disabled
                        className="w-full px-3 py-3 border border-oxfordBlue rounded-lg bg-gentleGray text-black"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg 
                          className="w-5 h-5 text-gray-400" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {t('edit_profile.form.email.cannot_change')}
                    </p>
                  </div>

                  {/* Full Name Field */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      {t('edit_profile.form.full_name.label')}
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-3 border border-oxfordBlue rounded-lg bg-gentleGray text-black"
                    />
                  </div>

                  {/* Username Field */}
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      {t('edit_profile.form.username.label')}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black">
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
                        placeholder={t('edit_profile.form.username.placeholder')}
                        className={`w-full bg-gentleGray pl-8 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          username && !usernameAvailable
                            ? "border-red-500 focus:ring-red-500"
                            : "border-oxfordBlue focus:ring-oxfordBlue"
                        }`}
                      />
                      {username && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                          {checkingUsername ? (
                            <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : username.length < 3 ? (
                            <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : usernameAvailable ? (
                            <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </span>
                      )}
                    </div>
                    {username && username.length < 3 && (
                      <p className="mt-1 text-sm text-red-500">
                        Username must be at least 3 characters
                      </p>
                    )}
                    {username && !usernameAvailable && (
                      <p className="mt-1 text-sm text-red-500">
                        This username is already taken
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <Link
                to="/profile"
                className="px-6 py-3 border border-oxfordBlue text-white bg-oxfordBlue font-medium rounded-lg hover:bg-opacity-80 transition-colors text-center"
              >
                {t('edit_profile.buttons.cancel')}
              </Link>
              <button
                type="submit"
                disabled={loading || (username && (!usernameAvailable || username.length < 3))}
                className="px-6 py-3 bg-gentleGray text-oxfordBlue border border-oxfordBlue font-medium rounded-lg hover:bg-oxfordBlue hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('edit_profile.buttons.saving')}
                  </span>
                ) : (
                  t('edit_profile.buttons.save_changes')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;