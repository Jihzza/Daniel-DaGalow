// components/Subpages/EditProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

const EditProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Check if username is available
  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username.length < 3) {
        setUsernameAvailable(true);
        return;
      }

      setCheckingUsername(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .neq('id', user.id)
          .single();
        
        setUsernameAvailable(!data);
      } catch (error) {
        // If error is 'No rows found', username is available
        if (error.message && error.message.includes('No rows found')) {
          setUsernameAvailable(true);
        } else {
          console.error('Error checking username:', error);
        }
      } finally {
        setCheckingUsername(false);
      }
    };

    // Debounce username check to avoid too many requests
    const timeoutId = setTimeout(() => {
      if (username) {
        checkUsername();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, user?.id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // First, check if a profile exists
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select(`full_name, username, bio, avatar_url`) // Fixed the double comma
        .eq('id', user.id);
      
      if (queryError) {
        throw queryError;
      }
      
      // If no profile exists, create one
      if (!data || data.length === 0) {
        console.log("No profile found, creating a new one");
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: user.id,
              full_name: '',
              username: null,
              bio: '',
              avatar_url: '',
              updated_at: new Date()
            }
          ])
          .select(`full_name, username, bio, avatar_url`);
        
        if (insertError) {
          throw insertError;
        }
        
        if (newProfile && newProfile[0]) {
          setFullName(newProfile[0].full_name || '');
          setUsername(newProfile[0].username || '');
          setBio(newProfile[0].bio || '');
          setAvatarUrl(newProfile[0].avatar_url || '');
        }
      } 
      // If multiple profiles exist (shouldn't happen, but let's handle it)
      else if (data.length > 1) {
        console.warn("Multiple profiles found for user - using first one", data);
        setFullName(data[0].full_name || '');
        setUsername(data[0].username || '');
        setBio(data[0].bio || '');
        setAvatarUrl(data[0].avatar_url || '');
      }
      // Normal case - one profile found
      else {
        setFullName(data[0].full_name || '');
        setUsername(data[0].username || '');
        setBio(data[0].bio || '');
        setAvatarUrl(data[0].avatar_url || '');
      }
    } catch (error) {
      console.error('Error loading user profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (username && !usernameAvailable) {
      setError('Username is already taken');
      return;
    }

    if (username && username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    try {
      setLoading(true);
      setMessage('');
      setError('');
      
      const updates = {
        full_name: fullName,
        username,
        bio,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      setMessage('Profile updated successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      setError(error.message || 'Error updating the profile');
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      setAvatarUrl(filePath);
    } catch (error) {
      alert(error.message);
      console.error('Error uploading avatar:', error);
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
    <div className="max-w-4xl mx-auto my-16 p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
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
          {/* Avatar section */}
          <div className="md:w-1/3 flex flex-col items-center">
            <div className="relative group w-32 h-32 mb-4">
              {avatarUrl ? (
                <img
                  src={`${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarUrl}`}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || user?.email || 'User')}&size=128`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-4xl font-bold">
                  {fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              
              {/* Upload overlay */}
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
              
              {/* Upload spinner */}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            
            <p className="text-gray-500 text-sm text-center mt-2">
              Click on the avatar to upload a new profile picture
            </p>
          </div>
          
          {/* Profile details section */}
          <div className="md:w-2/3">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="text"
                  value={user?.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Email cannot be changed
                </p>
              </div>
              
              <div>
                <label htmlFor="fullName" className="block text-gray-700 font-medium mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName || ''}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-oxfordBlue"
                />
              </div>
              
              <div>
                <label htmlFor="username" className="block text-gray-700 font-medium mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    @
                  </span>
                  <input
                    id="username"
                    type="text"
                    value={username || ''}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    className={`w-full pl-7 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      username && !usernameAvailable 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-oxfordBlue'
                    }`}
                    placeholder="yourusername"
                  />
                  {username && checkingUsername && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-oxfordBlue rounded-full"></div>
                    </div>
                  )}
                  {username && !checkingUsername && username.length >= 3 && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {usernameAvailable ? (
                        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                {username && !usernameAvailable && (
                  <p className="mt-1 text-sm text-red-500">
                    This username is already taken
                  </p>
                )}
                {username && username.length < 3 && (
                  <p className="mt-1 text-sm text-red-500">
                    Username must be at least 3 characters
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-gray-700 font-medium mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio || ''}
                  onChange={(e) => setBio(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-oxfordBlue"
                  placeholder="Tell us a little about yourself"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-4 pt-4">
          <Link
            to="/profile"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || (username && !usernameAvailable) || (username && username.length < 3)}
            className="bg-oxfordBlue text-white py-2 px-6 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;