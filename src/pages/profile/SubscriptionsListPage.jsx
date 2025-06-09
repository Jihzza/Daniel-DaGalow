// src/pages/profile/SubscriptionsListPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function SubscriptionsListPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
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

    const fetchSubscriptionsAndProfiles = async () => {
      setLoading(true);
      try {
        let subscriptionsQuery;
        
        if (isAdmin) {
            // If admin, fetch all paid coaching requests.
            subscriptionsQuery = supabase.from('coaching_requests').select(`*`).eq('payment_status', 'paid');
        } else {
            // If not admin, only fetch their own paid requests.
            subscriptionsQuery = supabase.from('coaching_requests').select('*').eq('user_id', user.id).eq('payment_status', 'paid');
        }
        
        const { data: subscriptionsData, error: subscriptionsError } = await subscriptionsQuery.order('created_at', { ascending: false });

        if (subscriptionsError) throw subscriptionsError;
        setSubscriptions(subscriptionsData || []);

        // If admin, fetch all profiles to map names to subscriptions
        if (isAdmin && subscriptionsData && subscriptionsData.length > 0) {
            const userIds = [...new Set(subscriptionsData.map(sub => sub.user_id))];
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
        console.error('Error fetching subscription data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptionsAndProfiles();
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
                    {isAdmin ? 'All Subscriptions' : 'My Subscriptions'}
                </h1>
                <div className="w-8"></div>
            </div>
            {subscriptions.length === 0 ? (
                <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-center text-gray-500">
                        {isAdmin ? 'There are no active subscriptions.' : 'You have no subscriptions.'}
                    </p>
                </div>
            ) : (
                <ul className="space-y-4">
                {subscriptions.map(sub => {
                    const isOwnSubscription = sub.user_id === user.id;
                    const userName = isAdmin ? (profiles[sub.user_id] || 'Unknown User') : '';
                    
                    return (
                        <li key={sub.id} className={`p-4 bg-white rounded-lg shadow-md border-l-4 ${isOwnSubscription ? 'border-darkGold' : 'border-oxfordBlue'}`}>
                            <div className="flex justify-between items-start">
                                <p className="font-semibold text-lg text-gray-800">
                                    Coaching: {sub.service_type}
                                    {isAdmin && <span className="block text-sm font-normal text-gray-500">for {userName}</span>}
                                </p>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${sub.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {sub.payment_status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                Active Since: {new Date(sub.membership_start_date).toLocaleDateString()}
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
