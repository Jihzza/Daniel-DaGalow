import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../utils/supabaseClient'; // Adjust path as needed
import { useAuth } from '../../contexts/AuthContext'; // Adjust path as needed
import { Link } from 'react-router-dom'; // For linking within notifications

// Placeholder for a notification icon, you can replace it with an actual icon component or SVG
const NotificationIcon = () => (
  <svg className="w-6 h-6 text-darkGold" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
  </svg>
);

function NotificationsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      // Optionally, redirect to login or show a message
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }
        setNotifications(data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(t('notifications.load_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, t]);

  const markAsRead = async (notificationId) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id); // Ensure user can only update their own

      if (updateError) throw updateError;

      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Optionally, show an error message to the user
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    // If notification.link exists, navigate using react-router-dom or window.location.href
    // For now, we just mark as read.
  };
  
  const markAllAsRead = async () => {
    if (!user || notifications.filter(n => !n.is_read).length === 0) return;

    try {
        const unreadNotificationIds = notifications
            .filter(n => !n.is_read)
            .map(n => n.id);

        if (unreadNotificationIds.length === 0) return;

        const { error: updateError } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', unreadNotificationIds)
            .eq('user_id', user.id);

        if (updateError) throw updateError;

        setNotifications(prevNotifications =>
            prevNotifications.map(n => ({ ...n, is_read: true }))
        );
    } catch (err) {
        console.error('Error marking all notifications as read:', err);
        setError(t('notifications.mark_all_read_error'));
    }
  };


  return (
    <div className="min-h-screen bg-oxfordBlue text-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-darkGold">
              {t('notifications.title')}
            </h1>
            {notifications.some(n => !n.is_read) && (
                <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 bg-darkGold/20 text-darkGold border border-darkGold rounded-lg hover:bg-darkGold/30 transition-colors text-sm"
                >
                    {t('notifications.mark_all_read')}
                </button>
            )}
        </div>


        {loading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-darkGold"></div>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-500/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {!loading && !error && !user && (
          <div className="bg-yellow-500/20 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg text-center">
            {t('notifications.login_prompt')} <Link to="/login" className="underline hover:text-darkGold">{t('navigation.login')}</Link>
          </div>
        )}

        {!loading && !error && user && notifications.length === 0 && (
          <div className="text-center py-10">
            <NotificationIcon />
            <p className="mt-4 text-xl text-gray-400">{t('notifications.no_notifications')}</p>
          </div>
        )}

        {!loading && !error && user && notifications.length > 0 && (
          <div className="space-y-4">
            {notifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 rounded-lg shadow-md transition-all duration-300 cursor-pointer flex items-start space-x-3
                  ${notification.is_read ? 'bg-white/5 hover:bg-white/10' : 'bg-darkGold/20 hover:bg-darkGold/30 border border-darkGold/50 animate-pulse-once'}
                `}
              >
                {!notification.is_read && (
                    <div className="mt-1 flex-shrink-0 w-2.5 h-2.5 bg-darkGold rounded-full"></div>
                )}
                <div className={`flex-grow ${notification.is_read ? 'pl-[1.125rem]' : ''}`}> {/* Adjust padding if no dot */}
                  <p className={`text-sm ${notification.is_read ? 'text-gray-300' : 'text-white font-semibold'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                  {notification.link && (
                    <Link to={notification.link} className="text-xs text-darkGold hover:underline mt-1 inline-block">
                      {t('notifications.view_details')}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;