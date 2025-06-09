// src/pages/profile/PitchDecksListPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function PitchDecksListPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const [profiles, setProfiles] = useState({});

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

    const fetchRequestsAndProfiles = async () => {
      setLoading(true);
      try {
        let requestsQuery;
        
        if (isAdmin) {
            // If admin, fetch all pitch requests.
            requestsQuery = supabase.from('pitch_requests').select(`*`);
        } else {
            // If not admin, only fetch their own requests.
            requestsQuery = supabase.from('pitch_requests').select('*').eq('user_id', user.id);
        }
        
        const { data: requestsData, error: requestsError } = await requestsQuery.order('created_at', { ascending: false });

        if (requestsError) throw requestsError;
        setRequests(requestsData || []);

        // If admin, fetch all profiles to map names to requests
        if (isAdmin && requestsData && requestsData.length > 0) {
            const userIds = [...new Set(requestsData.map(req => req.user_id).filter(id => id))]; // Filter out null/undefined IDs
            if (userIds.length > 0) {
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
        }

      } catch (error) {
        console.error('Error fetching pitch deck data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequestsAndProfiles();
  }, [user, isAdmin, isAuthCheckComplete]);

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
                    {isAdmin ? 'All Pitch Deck Requests' : 'My Pitch Deck Requests'}
                </h1>
                 <div className="w-8"></div>
            </div>
            {requests.length === 0 ? (
                <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-center text-gray-500">
                        {isAdmin ? 'There are no pitch deck requests.' : 'You have no pitch deck requests.'}
                    </p>
                </div>
            ) : (
                <ul className="space-y-4">
                {requests.map(req => {
                    const isOwnRequest = req.user_id === user.id;
                    const userName = isAdmin ? (profiles[req.user_id] || req.name || 'Unknown User') : req.name;

                    return (
                        <li key={req.id} className={`p-4 bg-white rounded-lg shadow-md border-l-4 ${isOwnRequest && isAdmin ? 'border-darkGold' : 'border-oxfordBlue'}`}>
                            <p className="font-semibold text-lg text-gray-800">
                                Request by: {userName}
                            </p>
                            <p className="text-sm text-gray-600">
                                Date: {new Date(req.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                                Email: {req.email}
                            </p>
                        </li>
                    );
                })}
                </ul>
            )}
        </div>
    </main>
  );
}
