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
      if (!user?.id) {
        setError('Authentication error: No user ID available');
        setLoading(false);
        return;
      }
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id);
      if (queryError) throw queryError;
      if (!data || data.length === 0) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: user.id, full_name: '', avatar_url: '', updated_at: new Date() }])
          .select();
        if (insertError) throw insertError;
        setProfile(newProfile[0]);
      } else {
        setProfile(data[0]);
      }
    } catch (err) {
      setError(`Error fetching profile data: ${err.message}`);
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
      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err.message);
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
      <section id="profile" className="py-8 px-4">
        <div className="max-w-4xl mx-auto my-8 p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-oxfordBlue">Profile</h1>
            <Link to="/" className="text-oxfordBlue hover:underline">Go back to Home</Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const formatAppointmentDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section id="profile" className="py-12 px-4 h-screen">
      <div className="max-w-4xl flex flex-col justify-center items-center mx-auto my-8">
        <div className="border-2 border-darkGold p-6 rounded-lg flex flex-col  justify-center items-center shadow-md">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar and name section */}
            <div className="flex flex-col items-center">
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
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <h2 className="text-2xl font-bold text-white">
                {profile?.full_name || 'Add Your Name'}
              </h2>
              {profile?.username ? (
                <p className="text-white mb-2">@{profile.username}</p>
              ) : (
                <p className="text-white italic mb-2">No username set</p>
              )}
              <p className="text-white mb-4">{user.email}</p>
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
              <div className="pb-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Upcoming Appointments</h3>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4 border-darkGold">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{appointment.service_type || 'Consultation'}</p>
                            <p className="text-white">{formatAppointmentDateTime(appointment.appointment_date)}</p>
                            {appointment.notes && (
                              <p className="text-gray-500 mt-2 text-sm">{appointment.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button className="text-oxfordBlue hover:underline text-sm">Reschedule</button>
                            <button className="text-red-600 hover:underline text-sm">Cancel</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 border-2 rounded-lg border-darkGold ">
                    <p className="text-white mb-4">You don't have any upcoming appointments</p>
                    <Link
                      to="/?service=booking#booking"
                      className="bg-darkGold text-black font-bold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                      Book a Consultation
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
