// src/App.js
import React, { useState, createContext, useEffect, useCallback, useRef, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import CookieConsent, { Cookies } from "react-cookie-consent";

import { supabase } from "./utils/supabaseClient";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ServiceProvider } from "./contexts/ServiceContext";
import AuthModal from "./components/Auth/AuthModal";
import Header from "./components/layout/Header";
import Hero from "./components/home-sections/Hero";
import About from "./components/home-sections/About";
import Services from "./components/home-sections/Services";
import Coaching from "./components/home-sections/Coaching";
import VentureInvestment from "./components/home-sections/VentureInvestment";
import Testimonials from "./components/home-sections/Testimonials";
import Interviews from "./components/home-sections/Interviews";
import IncentivePage from "./components/home-sections/IncentivePage";
import OtherWins from "./components/home-sections/OtherWins";
import MergedServiceForm from "./components/Forms/MergedServiceForm";
import BottomCarouselPages from "./components/carousel/BottomCarouselPages";
import NavigationBar from "./components/layout/NavigationBar";
import ChatbotWindow from "./components/chat/ChatbotWindow";
import CalendarPage from "./pages/profile/CalendarPage";
import ProfilePage from "./pages/profile/ProfilePage";
import EditProfilePage from "./pages/profile/EditProfilePage";
import SettingsPage from "./pages/profile/SettingsPage";
import NotificationsPage from "./components/notifications/NotificationsPage";
import Footer from "./components/layout/Footer";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import UserManagementPage from "./pages/admin/UserManagementPage";
import TestimonialReviewPage from "./pages/admin/TestimonialReviewPage";
import BugReportsPage from "./pages/admin/BugReportsPage";
import BookingSuccess from "./pages/BookingSuccess";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import DirectMessagesPage from './pages/DirectMessages';
import ScrollToTopButton from "./components/common/ScrollToTopButton";
import AppointmentsListPage from "./pages/profile/AppointmentsListPage";
import SubscriptionsListPage from "./pages/profile/SubscriptionsListPage";
import PitchDecksListPage from "./pages/profile/PitchDecksListPage";
import ChatHistoryPage from "./pages/profile/ChatHistoryPage";
import CreateTestimonialPage from './pages/CreateTestimonialPage';
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import {
  requestNotificationPermission,
  getNotificationPermission,
  isNotificationAPISupported,
  showNotification
} from "./utils/notificationUtils";

// Define and export AuthModalContext
export const AuthModalContext = createContext({
  openAuthModal: () => {},
  closeAuthModal: () => {},
  isAuthModalOpen: false,
});

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex justify-center items-center h-screen text-white">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex justify-center items-center h-screen text-white">Loading...</div>;
  }
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function AppContent() {
  const { user } = useAuth();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(null);
  const { isAuthModalOpen, openAuthModal: contextOpenAuthModal, closeAuthModal: contextCloseAuthModal } = useContext(AuthModalContext);
  const [unreadChatbotMessagesCount, setUnreadChatbotMessagesCount] = useState(0);

  const location = useLocation();
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission());
  const [acceptsFunctionalCookies, setAcceptsFunctionalCookies] = useState(
    () => Cookies.get("siteCookieConsent") === "true"
  );

  const [showChatbotIconNotification, setShowChatbotIconNotification] = useState(false);
  const [chatOpenedViaNotification, setChatOpenedViaNotification] = useState(false);
  const [hasShownNotificationThisSession, setHasShownNotificationThisSession] = useState(false);
  const notificationTimerRef = useRef(null);

  const justClosedAuthModalAfterLogin = useRef(false);
  const prevUser = useRef(user);
  const prevIsAuthModalOpen = useRef(isAuthModalOpen);
  const scrollSkipFlagTimeoutRef = useRef(null);

  const [unreadConversationsCount, setUnreadConversationsCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const fetchUnreadConversationCount = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .select('user1_id, user1_unread_count, user2_unread_count')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (error) {
      return;
    }

    if (!data) {
      return;
    }

    const count = data.reduce((acc, convo) => {
      const isUser1 = convo.user1_id === user.id;
      const unreadCount = isUser1 ? convo.user1_unread_count : convo.user2_unread_count;
      if (unreadCount > 0) {
        return acc + 1;
      }
      return acc;
    }, 0);
    
    setUnreadConversationsCount(count);

  }, [user]);

  const fetchUnreadNotificationCount = useCallback(async () => {
    if (!user) return;
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    if (!error && typeof count === "number") {
      setUnreadNotificationsCount(count);
    } else {
    }
  }, [user]);

  // This is the event handler that will be called by the event listener
  const handleMessagesReadEvent = useCallback(() => {
    fetchUnreadConversationCount();
  }, [fetchUnreadConversationCount]);

  // New event handler for notifications
  const handleNotificationsReadEvent = useCallback(() => {
    fetchUnreadNotificationCount();
  }, [fetchUnreadNotificationCount]);

  useEffect(() => {
    if (!user) {
      setUnreadConversationsCount(0);
      return;
    }

    fetchUnreadConversationCount();

    // Listen for the custom client-side event dispatched from DirectMessages.jsx
    window.addEventListener('messagesRead', handleMessagesReadEvent);

    // Listen for any changes on the conversations table
    const conversationsListener = supabase
      .channel(`public:conversations:user_id=eq.${user.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversations', 
          filter: `or(user1_id.eq.${user.id},user2_id.eq.${user.id})`
        },
        (payload) => {
          fetchUnreadConversationCount();
        }
      ).subscribe();
    
    return () => {
      window.removeEventListener('messagesRead', handleMessagesReadEvent);
      supabase.removeChannel(conversationsListener);
    };
  }, [user, fetchUnreadConversationCount, handleMessagesReadEvent]);

  useEffect(() => {
    if (!user) {
      setUnreadNotificationsCount(0);
      return;
    }

    // initial load
    fetchUnreadNotificationCount();

    // Add window event listener
    window.addEventListener('notificationsRead', handleNotificationsReadEvent);

    // real-time updates
    const notifListener = supabase
      .channel(`public:notifications:user_id=eq.${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        fetchUnreadNotificationCount   // just re-count – cheap & reliable
      )
      .subscribe();

    // Cleanup function
    return () => {
      window.removeEventListener('notificationsRead', handleNotificationsReadEvent);
      supabase.removeChannel(notifListener);
    };
  }, [user, fetchUnreadNotificationCount, handleNotificationsReadEvent]);

  useEffect(() => {
    setAcceptsFunctionalCookies(Cookies.get("siteCookieConsent") === "true");
  }, []);

  useEffect(() => {
    if (prevUser.current === null && user !== null && prevIsAuthModalOpen.current && !isAuthModalOpen) {
      justClosedAuthModalAfterLogin.current = true;
      if (scrollSkipFlagTimeoutRef.current) {
        clearTimeout(scrollSkipFlagTimeoutRef.current);
      }
      scrollSkipFlagTimeoutRef.current = setTimeout(() => {
        justClosedAuthModalAfterLogin.current = false;
      }, 150); 
    }
    prevUser.current = user;
    prevIsAuthModalOpen.current = isAuthModalOpen;
  }, [user, isAuthModalOpen]);


  useEffect(() => {
    // Check if we need to restore a scroll position from sessionStorage
    const scrollPosition = sessionStorage.getItem('scrollPosition');
    const scrollPath = sessionStorage.getItem('scrollPath');

    // Restore scroll only if the path matches the one stored before redirect
    if (scrollPosition && scrollPath && scrollPath === location.pathname) {
      setTimeout(() => {
        // Scroll to the saved position
        window.scrollTo(0, parseInt(scrollPosition, 10));
        // Clean up so this doesn't run again on refresh
        sessionStorage.removeItem('scrollPosition');
        sessionStorage.removeItem('scrollPath');
      }, 250); // Delay allows page to render before scrolling
      
      // Exit early and skip the scroll-to-top logic below
      return; 
    }
    
    // --- Existing scroll-to-top logic ---
    const attemptScrollToTop = (context = "initial") => {
      if (justClosedAuthModalAfterLogin.current) {
        return;
      }
      window.scrollTo(0, 0);
    };

    if (justClosedAuthModalAfterLogin.current) {
    } else {
        const initialScrollTimer = setTimeout(() => attemptScrollToTop("initial"), 0);
        let delayedHomepageScrollTimer = null;
        let finalHomepageScrollTimer = null;
        if (location.pathname === '/') {
          delayedHomepageScrollTimer = setTimeout(() => {
            attemptScrollToTop("delayed homepage");
            if (window.scrollY !== 0) {
              finalHomepageScrollTimer = setTimeout(() => attemptScrollToTop("final homepage check"), 50);
            }
          }, 250);
        }
        return () => {
          clearTimeout(initialScrollTimer);
          if (delayedHomepageScrollTimer) clearTimeout(delayedHomepageScrollTimer);
          if (finalHomepageScrollTimer) clearTimeout(finalHomepageScrollTimer);
        };
    }

    if (
      window.location.hash &&
      !window.location.hash.includes('access_token=') &&
      !window.location.hash.includes('refresh_token=') &&
      !window.location.hash.includes('error_description=')
    ) {
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, document.title, cleanUrl);
    }

  }, [location.pathname]);

  useEffect(() => {
    return () => {
      if (scrollSkipFlagTimeoutRef.current) {
        clearTimeout(scrollSkipFlagTimeoutRef.current);
      }
    };
  }, []);


  useEffect(() => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
  
    // If the chatbot is closed and we haven't shown the notification this session
    if (!isChatbotOpen && !hasShownNotificationThisSession) {
      notificationTimerRef.current = setTimeout(() => {
        // Before showing the notification, double-check that the chatbot wasn't opened in the meantime
        if (!isChatbotOpen) {
          setUnreadChatbotMessagesCount(1); // Set unread count for the automatic message
          setShowChatbotIconNotification(true);
          setHasShownNotificationThisSession(true);
        }
      }, 5000);
    }
  }, [isChatbotOpen, hasShownNotificationThisSession]);


  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    });
    return () => subscription.unsubscribe();
  }, []);

  const toggleChatbot = useCallback((sessionId = null) => {
    setIsChatbotOpen(prevIsChatbotOpen => {
      const openingChatbot = !prevIsChatbotOpen;
      if (openingChatbot) {
        if (sessionId) {
          setChatSessionId(sessionId);
        }
        // When opening the chat, reset the unread message count and hide the notification
        setUnreadChatbotMessagesCount(0);
        setShowChatbotIconNotification(false);
  
        if (showChatbotIconNotification || unreadChatbotMessagesCount > 0) {
          setChatOpenedViaNotification(true);
        } else {
          setChatOpenedViaNotification(false);
        }
      } else {
        setChatOpenedViaNotification(false);
      }
      return openingChatbot;
    });
  }, [showChatbotIconNotification, unreadChatbotMessagesCount]); // Add unreadChatbotMessagesCount to the dependency array
  


  const handleRequestNotification = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
  };

  useEffect(() => {
    if (!user || notificationPermission !== 'granted') {
      return;
    }
    const processAndShowNotification = (payload) => {
      const newNotification = payload.new;
      if (newNotification.type === 'reminder' && !newNotification.is_read) {
        const notifyAtDate = newNotification.notify_at ? new Date(newNotification.notify_at) : null;
        const now = new Date();
        const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
        const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
        if (notifyAtDate && notifyAtDate <= fiveMinutesFromNow && new Date(newNotification.created_at) >= oneHourAgo) {
          showNotification("Consultation Reminder", {
            body: newNotification.message,
            icon: "/logo192.png",
            tag: `reminder-${newNotification.id}`
          }, newNotification.link);
        }
      }
    };
    const notificationsChannel = supabase
      .channel(`public:notifications:user_id=eq.${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          processAndShowNotification(payload);
        }
      )
      .subscribe((status, err) => {
        if (err) {
        }
      });
    const checkForInitialDueReminders = async () => {
        if (notificationPermission !== 'granted') return;
        const now = new Date();
        const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
        const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
        const { data: dueNotifications, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'reminder')
            .eq('is_read', false)
            .lte('notify_at', fiveMinutesFromNow.toISOString())
            .gte('created_at', oneHourAgo.toISOString());
        if (error) {
            return;
        }
        if (dueNotifications) {
            dueNotifications.forEach(n => {
                 showNotification("Consultation Reminder", {
                    body: n.message,
                    icon: "/logo192.png",
                    tag: `reminder-${n.id}`
                 }, n.link);
            });
        }
    };
    checkForInitialDueReminders();
    return () => {
      if (notificationsChannel) {
        supabase.removeChannel(notificationsChannel);
      }
    };
  }, [user, notificationPermission]);

  const OptionalAuthRoute = ({ children }) => {
    const { loading } = useAuth();
    if (loading) {
      return <div className="flex justify-center items-center h-screen text-white">Loading...</div>;
    }
    return children;
  };

  return (
    <div className="App font-sans bg-gradient-to-b from-oxfordBlue via-oxfordBlue to-gentleGray overflow-x-hidden">
      <Header
        onAuthModalOpen={contextOpenAuthModal}
        unreadNotificationsCount={unreadNotificationsCount}
      />

      {isNotificationAPISupported() && notificationPermission === 'default' && (
        <div style={{
          position: 'fixed',
          bottom: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 15px',
          background: 'rgba(30,30,30,0.9)',
          color: 'white',
          borderRadius: '8px',
          zIndex: 1001,
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
          <p className="text-sm mb-2">Enable notifications for consultation reminders?</p>
          <button
            onClick={handleRequestNotification}
            className="bg-darkGold text-black px-4 py-1.5 rounded text-sm font-medium hover:bg-opacity-90"
          >
            Enable
          </button>
          <button
            onClick={() => {
              const banner = document.querySelector('[style*="position: fixed"][style*="bottom: 70px"]');
              if (banner) banner.style.display = 'none';
            }}
            className="ml-3 text-gray-400 px-3 py-1.5 text-sm hover:text-white"
          >
            Later
          </button>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <main className="mt-14 md:mt-24 lg:mt-20">
              <Hero />
              <About />
              <Services />
              <Coaching />
              <VentureInvestment />
              <Testimonials onAuthModalOpen={contextOpenAuthModal} />
              <OtherWins />
              <Interviews />
              <IncentivePage onChatbotOpen={toggleChatbot} onAuthModalOpen={contextOpenAuthModal} />
              <MergedServiceForm />
              <BottomCarouselPages />
            </main>
          }
        />
        <Route path="/booking-success" element={<BookingSuccess />} />
        
        {/* Admin Routes */}
        <Route path="/admin/users" element={<PrivateRoute><UserManagementPage /></PrivateRoute>} />
        <Route path="/admin/testimonials" element={<PrivateRoute><TestimonialReviewPage /></PrivateRoute>} />
        <Route path="/admin/bugs" element={<PrivateRoute><BugReportsPage /></PrivateRoute>} />

        {/* Auth Routes */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
        <Route path="/reset-password" element={<PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>} />
        
        {/* Profile Routes */}
        <Route path="/profile" element={<PrivateRoute><ProfilePage onChatOpen={toggleChatbot} /></PrivateRoute>} />
        <Route path="/edit-profile" element={<PrivateRoute><EditProfilePage /></PrivateRoute>} />
        <Route path="/profile/appointments" element={<PrivateRoute><AppointmentsListPage /></PrivateRoute>} />
        <Route path="/profile/subscriptions" element={<PrivateRoute><SubscriptionsListPage /></PrivateRoute>} />
        <Route path="/profile/pitch-decks" element={<PrivateRoute><PitchDecksListPage /></PrivateRoute>} />
        <Route path="/profile/chat-history" element={<PrivateRoute><ChatHistoryPage onChatOpen={toggleChatbot} /></PrivateRoute>} />
        
        {/* Other Routes */}
        <Route path="/messages" element={<PrivateRoute><DirectMessagesPage /></PrivateRoute>} />
        <Route path="/settings" element={<OptionalAuthRoute><SettingsPage acceptsFunctionalCookies={acceptsFunctionalCookies} /></OptionalAuthRoute>} />
        <Route path="/components/Subpages/Calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
        <Route path="/components/Subpages/Settings" element={<OptionalAuthRoute><SettingsPage acceptsFunctionalCookies={acceptsFunctionalCookies} /></OptionalAuthRoute>} />
        <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
        <Route path="/create-testimonial" element={<PrivateRoute><CreateTestimonialPage /></PrivateRoute>} />
        {/* Legal Pages */}
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      </Routes>

      <NavigationBar
        isChatbotOpen={isChatbotOpen}
        onChatbotClick={toggleChatbot}
        onAuthModalOpen={contextOpenAuthModal}
        showChatbotIconNotification={showChatbotIconNotification}
        unreadMessagesCount={unreadConversationsCount} // Prop name updated for clarity
        unreadChatbotMessagesCount={unreadChatbotMessagesCount} // Add this new prop

      />
      <AnimatePresence>
        {isChatbotOpen && (
          <ChatbotWindow
            sessionId={chatSessionId}
            onClose={toggleChatbot}
            chatOpenedViaNotification={chatOpenedViaNotification}
          />
        )}
      </AnimatePresence>

      <ScrollToTopButton isChatbotOpen={isChatbotOpen} />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={contextCloseAuthModal} // Use context provided close
      />
      <Footer />

      <CookieConsent
        location="bottom"
        buttonText="Accept Cookies"
        cookieName="siteCookieConsent"
        style={{ background: "#001F3F", color: "#FFFFFF", fontSize: "13px", borderTop: "1px solid #BFA200", zIndex: 1000 }}
        buttonStyle={{ color: "#000000", background: "#BFA200", fontSize: "14px", borderRadius: "5px", padding: "8px 15px", fontWeight: "bold" }}
        expires={150}
        onAccept={() => {
          setAcceptsFunctionalCookies(true);
        }}
        enableDeclineButton
        declineButtonText="Decline"
        declineButtonStyle={{ background: "#555", color: "#fff", fontSize: "14px", borderRadius: "5px", padding: "8px 15px", marginLeft: "10px" }}
        onDecline={() => {
           setAcceptsFunctionalCookies(false);
        }}
      >
        This website uses cookies to enhance the user experience. See our{" "}
        <Link to="/settings" state={{ section: 'privacy-policy' }} style={{ color: "#BFA200", textDecoration: "underline" }}>
          Privacy Policy
        </Link> for more details.
      </CookieConsent>
    </div>
  );
}

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const openAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal, isAuthModalOpen }}>
          <Router>
            <AppContent />
          </Router>
        </AuthModalContext.Provider>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;