// components/Subpages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAppointments();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Add logging to debug user ID
      console.log("Current user ID:", user?.id);
      
      if (!user?.id) {
        console.error("No user ID available - authentication issue");
        setError('Authentication error: No user ID available');
        setLoading(false);
        return;
      }
      
      // First, check if a profile exists
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id);
      
      console.log("Query result:", { data, queryError });
      
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
              avatar_url: '',
              updated_at: new Date()
            }
          ])
          .select();
        
        if (insertError) {
          throw insertError;
        }
        
        setProfile(newProfile[0]);
      } 
      // If multiple profiles exist (shouldn't happen, but let's handle it)
      else if (data.length > 1) {
        console.warn("Multiple profiles found for user - using first one", data);
        setProfile(data[0]);
      }
      // Normal case - one profile found
      else {
        setProfile(data[0]);
      }
    } catch (error) {
      console.error('Profile fetch error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      setError(`Error fetching profile data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-oxfordBlue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-16 p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link to="/" className="text-oxfordBlue hover:underline">
          Go back to home
        </Link>
      </div>
    );
  }

  // Format appointment date and time for display
  const formatAppointmentDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto my-16 p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Avatar and name section */}
        <div className="md:w-1/3 flex flex-col items-center">
          {profile?.avatar_url ? (
            <img
              src={`${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover mb-4"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || user?.email || 'User')}&size=128`;
              }}
            />
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-4xl font-bold mb-4">
              {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          
          <h2 className="text-2xl font-bold text-oxfordBlue">
            {profile?.full_name || 'Add Your Name'}
          </h2>
          
          {profile?.username ? (
            <p className="text-gray-600 mb-2">@{profile.username}</p>
          ) : (
            <p className="text-gray-400 italic mb-2">No username set</p>
          )}
          
          <p className="text-gray-600 mb-4">{user.email}</p>
          
          <Link 
            to="/edit-profile" 
            className="bg-oxfordBlue text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors w-full text-center"
          >
            Edit Profile
          </Link>
        </div>
        
        {/* Profile content */}
        <div className="md:w-2/3">
          {/* Upcoming Appointments Section */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h3 className="text-xl font-semibold text-oxfordBlue mb-4">Upcoming Appointments</h3>
            
            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{appointment.service_type || 'Consultation'}</p>
                        <p className="text-gray-600">{formatAppointmentDateTime(appointment.appointment_date)}</p>
                        {appointment.notes && (
                          <p className="text-gray-500 mt-2 text-sm">{appointment.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button className="text-oxfordBlue hover:underline text-sm">
                          Reschedule
                        </button>
                        <button className="text-red-600 hover:underline text-sm">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg bg-gray-50">
                <p className="text-gray-500 mb-4">You don't have any upcoming appointments</p>
                <Link 
                  to="/?service=booking#booking" 
                  className="bg-darkGold text-black font-bold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Book a Consultation
                </Link>
              </div>
            )}
          </div>
          
          {/* Account Information */}
          <div>
            <h3 className="text-xl font-semibold text-oxfordBlue mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Member Since</p>
                <p className="text-gray-800">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <p className="text-gray-500 text-sm">Last Updated</p>
                <p className="text-gray-800">
                  {profile?.updated_at 
                    ? new Date(profile.updated_at).toLocaleDateString() 
                    : 'Never updated'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;