// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error.message);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Unexpected error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-16 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start mb-12">
        <div>
          <h1 className="text-3xl font-bold text-oxfordBlue mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {profile?.full_name || user?.email || 'User'}!
          </p>
        </div>
        
        <button
          onClick={handleSignOut}
          className="mt-4 md:mt-0 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* User quick info card */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="flex-shrink-0">
          {profile?.avatar_url ? (
            <img
              src={`${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || user?.email || 'User')}&size=128`;
              }}
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-3xl font-bold">
              {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
        </div>
        
        <div className="flex-grow text-center md:text-left">
          <h2 className="text-xl font-semibold mb-1">
            {profile?.full_name || 'Complete your profile'}
          </h2>
          <p className="text-gray-600 mb-4">{user.email}</p>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Link 
              to="/profile" 
              className="bg-oxfordBlue text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors text-center"
            >
              View Profile
            </Link>
            <Link 
              to="/profile/edit" 
              className="bg-white border border-oxfordBlue text-oxfordBlue px-4 py-2 rounded hover:bg-gray-50 transition-colors text-center"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Your Activities */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4 text-oxfordBlue">Your Activities</h3>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700">No recent activities to display.</p>
              <Link 
                to="/activities" 
                className="text-oxfordBlue hover:underline text-sm inline-block"
              >
                View all activities
              </Link>
            </div>
          )}
        </div>
        
        {/* Upcoming Sessions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4 text-oxfordBlue">Upcoming Sessions</h3>
          <div className="space-y-4">
            <p className="text-gray-700">You have no upcoming sessions.</p>
            <Link 
              to="/?service=booking#booking" 
              className="text-oxfordBlue hover:underline text-sm inline-block"
            >
              Book a consultation
            </Link>
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4 text-oxfordBlue">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link 
                to="/?service=coaching#coaching" 
                className="text-oxfordBlue hover:underline block py-1"
              >
                Direct Coaching
              </Link>
            </li>
            <li>
              <Link 
                to="/?service=analysis#analysis-request" 
                className="text-oxfordBlue hover:underline block py-1"
              >
                Request Analysis
              </Link>
            </li>
            <li>
              <Link 
                to="/settings" 
                className="text-oxfordBlue hover:underline block py-1"
              >
                Account Settings
              </Link>
            </li>
            <li>
              <Link 
                to="/components/Subpages/Achievements" 
                className="text-oxfordBlue hover:underline block py-1"
              >
                View Achievements
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;