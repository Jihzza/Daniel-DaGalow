// src/pages/profile/AppointmentsListPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { Link } from 'react-router-dom';
import { ChevronLeft, CalendarClock, CheckCircle } from 'lucide-react';

export default function AppointmentsListPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const [profiles, setProfiles] = useState({}); // To store user profiles for display

  useEffect(() => {
    // Check if the user is an admin
    const checkAdminStatus = async () => {
        if (!user) {
          setIsAuthCheckComplete(true);
          return;
        };
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            if (error && error.code !== 'PGRST116') throw error;
            if (data && data.role === 'admin') {
                setIsAdmin(true);
            }
        } catch (err) {
            console.error('Error checking admin status:', err);
        } finally {
            setIsAuthCheckComplete(true);
        }
    };
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    // Wait until the admin check is complete before fetching data
    if (!isAuthCheckComplete || !user) {
      setLoading(false);
      return;
    }

    const fetchAppointmentsAndProfiles = async () => {
      setLoading(true);
      try {
        let appointmentsQuery;
        
        if (isAdmin) {
            // If admin, fetch all bookings.
            appointmentsQuery = supabase.from('bookings').select(`*`);
        } else {
            // If not admin, only fetch their own bookings.
            appointmentsQuery = supabase.from('bookings').select('*').eq('user_id', user.id);
        }
        
        // Fetch data without ordering, we will sort it on the client
        const { data: appointmentsData, error: appointmentsError } = await appointmentsQuery;

        if (appointmentsError) throw appointmentsError;

        if (appointmentsData) {
            const now = new Date();
            
            // Separate into upcoming and past
            const upcoming = appointmentsData
                .filter(app => new Date(app.appointment_date) >= now)
                .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date)); // Sort ascending (soonest first)

            const past = appointmentsData
                .filter(app => new Date(app.appointment_date) < now)
                .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date)); // Sort descending (most recent first)
            
            setAppointments([...upcoming, ...past]);
        } else {
            setAppointments([]);
        }

        // If admin, fetch all profiles to map names to appointments
        if (isAdmin && appointmentsData && appointmentsData.length > 0) {
            const userIds = [...new Set(appointmentsData.map(app => app.user_id))];
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', userIds);

            if (profilesError) throw profilesError;

            const profilesMap = profilesData.reduce((acc, profile) => {
                acc[profile.id] = profile.full_name;
                return acc;
            }, {});
            setProfiles(profilesMap);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointmentsAndProfiles();
  }, [user, isAdmin, isAuthCheckComplete]);

  // Separate lists for rendering
  const now = new Date();
  const upcomingAppointments = appointments.filter(app => new Date(app.appointment_date) >= now);
  const pastAppointments = appointments.filter(app => new Date(app.appointment_date) < now);

  if (loading || !isAuthCheckComplete) {
    return (
        <main className="absolute left-0 right-0 top-14 md:top-[96px] lg:top-20 bottom-[48px] lg:bottom-[60px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-oxfordBlue"></div>
        </main>
    );
  }

  return (
    <main className="absolute left-0 right-0 top-14 md:top-[96px] lg:top-20 bottom-[48px] lg:bottom-[60px] overflow-y-auto bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <Link to="/profile" className="p-2 -ml-2 text-gray-700 hover:text-oxfordBlue">
                    <ChevronLeft size={28} />
                </Link>
                <h1 className="text-2xl font-bold text-oxfordBlue text-center flex-grow">
                    {isAdmin ? 'All Appointments' : 'My Appointments'}
                </h1>
                <div className="w-8"></div> {/* Spacer to balance the back button */}
            </div>
            {appointments.length === 0 ? (
                <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">
                        {isAdmin ? 'There are no appointments scheduled.' : 'You have no appointments.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Upcoming Appointments Section */}
                    {upcomingAppointments.length > 0 && (
                        <div>
                            <ul className="space-y-4">
                                {upcomingAppointments.map(app => {
                                    const isOwnAppointment = app.user_id === user.id;
                                    const appointmentName = isAdmin ? (profiles[app.user_id] || app.name || 'Unknown User') : (app.name || 'Consultation');
                                    return (
                                        <li key={app.id} className={`p-4 bg-white rounded-lg shadow-md border-l-4 ${isOwnAppointment ? 'border-darkGold' : 'border-oxfordBlue'}`}>
                                            <p className="font-semibold text-lg text-gray-800">{appointmentName}</p>
                                            <p className="text-sm text-gray-600">{new Date(app.appointment_date).toLocaleString([], { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                            <p className="text-sm text-gray-500">{app.duration_minutes} minutes</p>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                    
                    {/* Past Appointments Section */}
                     {pastAppointments.length > 0 && (
                        <div>
                            <div className="flex items-center text-gray-500 mb-3">
                                <CheckCircle size={20} className="mr-2"/>
                                <h2 className="text-xl font-semibold">Past</h2>
                            </div>
                            <ul className="space-y-4">
                                {pastAppointments.map(app => {
                                    const isOwnAppointment = app.user_id === user.id;
                                    const appointmentName = isAdmin ? (profiles[app.user_id] || app.name || 'Unknown User') : (app.name || 'Consultation');
                                    return (
                                        <li key={app.id} className={`p-4 bg-white rounded-lg shadow-md border-l-4 opacity-70 ${isOwnAppointment ? 'border-darkGold' : 'border-oxfordBlue'}`}>
                                            <p className="font-semibold text-lg text-gray-800">{appointmentName}</p>
                                            <p className="text-sm text-gray-600">{new Date(app.appointment_date).toLocaleString([], { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                            <p className="text-sm text-gray-500">{app.duration_minutes} minutes</p>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            )}
       </div>
    </main>
  );
}
