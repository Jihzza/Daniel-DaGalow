// src/components/notifications/NotificationsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { BellRing, CheckCheck, Info, AlertTriangle, LogIn, ExternalLink, Bell } from 'lucide-react';

const NotificationTypeIcon = ({ type }) => {
  switch (type) {
    case 'reminder':
      return <BellRing className="w-5 h-5 text-amber-400" />;
    case 'new_message':
      return <Info className="w-5 h-5 text-blue-400" />;
    default:
      return <Info className="w-5 h-5 text-gray-400" />;
  }
};

function NotificationsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAndMarkAllAsRead = async () => {
      try {
        setLoading(true);
        // 1. Fetch all notifications
        const { data: fetchedNotifications, error: fetchError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (fetchError) throw fetchError;
        // 2. Find unread
        const unreadNotifications = fetchedNotifications.filter(n => !n.is_read);
        if (unreadNotifications.length === 0) {
          setNotifications(fetchedNotifications);
        } else {
          const unreadIds = unreadNotifications.map(n => n.id);
          // 3. Mark as read in DB
          const { error: updateError } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', unreadIds);
          if (updateError) throw updateError;
          // 4. Update state to all read
          const updatedNotifications = fetchedNotifications.map(n => ({ ...n, is_read: true }));
          setNotifications(updatedNotifications);
          // 5. Notify app to update header
          window.dispatchEvent(new Event('notificationsRead'));
        }
      } catch (err) {
        setError(t('notifications.load_error'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndMarkAllAsRead();
  }, [user, t]);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      // Remove all references to markGivenNotificationsAsRead, as it is no longer defined or needed.
    }
    if (notification.link) {
      if (notification.link.startsWith('http://') || notification.link.startsWith('https://')) {
        window.open(notification.link, '_blank', 'noopener,noreferrer');
      } else {
        navigate(notification.link);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffSeconds < 60) return t('notifications.just_now');
    if (diffMinutes < 60) return t('notifications.minutes_ago', { count: diffMinutes });
    if (diffHours < 24) return t('notifications.hours_ago', { count: diffHours });
    if (diffDays === 1) return t('notifications.yesterday');
    if (diffDays < 7) return t('notifications.days_ago', { count: diffDays });
    return date.toLocaleDateString(t('locale_code', 'en-US'), { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString(t('locale_code', 'en-US'), { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="absolute left-0 right-0 top-14 md:top-[96px] lg:top-20 bottom-[48px] lg:bottom-[60px] overflow-y-auto bg-gradient-to-b from-oxfordBlue to-gentleGray text-white px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <div className="max-w-2xl lg:max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {t('notifications.title')}
          </h1>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-darkGold"></div>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 px-6 py-4 rounded-lg text-center shadow-lg flex items-center justify-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-300" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && !user && (
          <div className="bg-yellow-800/30 border border-yellow-600 text-yellow-200 px-6 py-4 rounded-lg text-center shadow-lg flex flex-col items-center justify-center gap-3">
            <LogIn className="w-8 h-8 text-yellow-300 mb-2" />
            <p>{t('notifications.login_prompt')}</p>
            <Link to="/login" className="mt-2 px-4 py-2 bg-darkGold text-black rounded-md hover:bg-opacity-80 font-semibold transition-colors">
              {t('navigation.login')}
            </Link>
          </div>
        )}

        {!loading && !error && user && notifications.length === 0 && (
          <div className="text-center py-16 bg-oxfordBlue/30 rounded-xl shadow-xl border border-white/10">
            <BellRing className="w-16 h-16 text-gray-500 mx-auto" />
            <p className="mt-6 text-xl text-gray-400">{t('notifications.no_notifications')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('notifications.no_notifications_subtitle')}</p>
          </div>
        )}

        {!loading && !error && user && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map(notification => {
              const isExternalLink = notification.link && (notification.link.startsWith('http://') || notification.link.startsWith('https://'));

              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    p-4 rounded-xl shadow-lg transition-all duration-300 ease-in-out flex items-start space-x-4
                    border-l-4 
                    ${notification.is_read
                      ? 'bg-oxfordBlue/40 hover:bg-oxfordBlue/60 border-darkGold opacity-80'
                      : 'bg-darkGold/10 hover:bg-darkGold/20 border-darkGold animate-fade-in-once'
                    }
                    ${notification.link ? 'cursor-pointer' : 'cursor-default'}
                  `}
                >
                  {!notification.is_read && (
                    <div className="mt-1 flex-shrink-0 w-3 h-3 bg-darkGold rounded-full shadow-sm animate-pulse"></div>
                  )}
                  <div className={`flex-shrink-0 mt-0.5 ${notification.is_read ? 'ml-3' : ''}`}>
                    <NotificationTypeIcon type={notification.type} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className={`text-sm break-words ${notification.is_read ? 'text-gray-300' : 'text-white font-medium'}`}>
                      {notification.message}
                    </p>
                    <div className="text-xs text-gray-400 mt-1.5 flex flex-wrap items-center gap-x-3">
                      <span>{formatDate(notification.created_at)}</span>
                      {notification.type === 'reminder' && notification.notify_at && (
                        <span className="flex items-center text-amber-400">
                          <BellRing className="w-3 h-3 mr-1" />
                          {t('notifications.due_prefix')} {formatTime(notification.notify_at)}
                        </span>
                      )}
                    </div>
                    {notification.link && !isExternalLink && (
                      <Link
                        to={notification.link}
                        className="text-xs text-darkGold hover:text-amber-300 underline mt-2 inline-block font-semibold transition-colors"
                      >
                        {t('notifications.view_details')} &rarr;
                      </Link>
                    )}
                    {notification.link && isExternalLink && (
                       <a
                        href={notification.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-darkGold hover:text-amber-300 underline mt-2 inline-flex items-center font-semibold transition-colors"
                      >
                        {t('notifications.view_details')} <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;