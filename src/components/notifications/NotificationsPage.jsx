// src/components/notifications/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { BellRing, CheckCheck, Info, AlertTriangle, LogIn, ExternalLink } from 'lucide-react';

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

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setNotifications(data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(t('notifications.load_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel(`public:notifications:user_id=eq.${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          fetchNotifications();
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('Notifications subscription error:', err);
        }
      });


    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, t]);

  const markAsRead = async (notificationId) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      if (notification.link.startsWith('http://') || notification.link.startsWith('https://')) {
        window.open(notification.link, '_blank', 'noopener,noreferrer');
      } else {
        navigate(notification.link);
      }
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.filter(n => !n.is_read).length === 0) return;
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length === 0) return;
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds)
        .eq('user_id', user.id);
      if (updateError) throw updateError;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError(t('notifications.mark_all_read_error'));
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
    <div className="min-h-screen bg-gradient-to-b from-oxfordBlue to-gentleGray text-white pt-20 pb-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {t('notifications.title')}
          </h1>
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-darkGold text-black border border-darkGold rounded-lg hover:bg-opacity-80 transition-colors text-sm font-semibold shadow-md"
            >
              <CheckCheck className="inline-block w-4 h-4 mr-2" />
              {t('notifications.mark_all_read')}
            </button>
          )}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!notification.is_read) {
                            markAsRead(notification.id);
                          }
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!notification.is_read) {
                            markAsRead(notification.id);
                          }
                        }}
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