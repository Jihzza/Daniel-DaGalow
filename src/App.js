// src/App.js
import React, { useState, createContext, useEffect, useCallback, useRef } from "react";
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
import TestimonialReview from "./pages/admin/TestimonialReview";
import BookingSuccess from "./pages/BookingSuccess";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import DirectMessagesPage from './pages/DirectMessages';
import ScrollToTopButton from "./components/common/ScrollToTopButton";

import {
  requestNotificationPermission,
  getNotificationPermission,
  isNotificationAPISupported,
  showNotification
} from "./utils/notificationUtils";

export const AuthModalContext = createContext({
  openAuthModal: () => {},
  closeAuthModal: () => {},
  isAuthModalOpen: false
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission());
  const [acceptsFunctionalCookies, setAcceptsFunctionalCookies] = useState(
    () => Cookies.get("siteCookieConsent") === "true"
  );

  const [showChatbotIconNotification, setShowChatbotIconNotification] = useState(false);
  const [chatOpenedViaNotification, setChatOpenedViaNotification] = useState(false);
  const [hasShownNotificationThisSession, setHasShownNotificationThisSession] = useState(false);
  const notificationTimerRef = useRef(null);

  useEffect(() => {
    setAcceptsFunctionalCookies(Cookies.get("siteCookieConsent") === "true");
  }, []);

  // Scroll to top logic
  useEffect(() => {
    console.log(`[App.js useEffect] Path changed to: ${location.pathname}. Initial window.scrollY: ${window.scrollY}`);

    const attemptScrollToTop = (context = "initial") => {
      console.log(`[App.js ${context} scroll] Forcing scrollTo(0,0) for path: ${location.pathname}. Current scrollY: ${window.scrollY}`);
      window.scrollTo(0, 0);
      console.log(`[App.js ${context} scroll] After scrollTo(0,0). Current scrollY: ${window.scrollY}`);
    };

    // Initial scroll attempt, deferred slightly.
    const initialScrollTimer = setTimeout(() => attemptScrollToTop("initial"), 0);

    // More robust scroll for the homepage, especially on direct navigation to it.
    let delayedHomepageScrollTimer = null;
    let finalHomepageScrollTimer = null;
    if (location.pathname === '/') {
      // This longer delay helps ensure content (like Hero images) has loaded
      // and layout shifts have mostly settled before the final scroll.
      delayedHomepageScrollTimer = setTimeout(() => {
        attemptScrollToTop("delayed homepage");
        // A final, quick check and re-scroll if somehow still not at the top.
        // This can be useful for very stubborn, late layout shifts.
        if (window.scrollY !== 0) {
          finalHomepageScrollTimer = setTimeout(() => attemptScrollToTop("final homepage check"), 50); // Shorter delay for the final check
        }
      }, 250); // Increased delay (e.g., 200-300ms). Adjust based on observed layout shift timing.
    }

    // Hash cleaning logic (remains the same)
    if (
      window.location.hash &&
      !window.location.hash.includes('access_token=') &&
      !window.location.hash.includes('refresh_token=') &&
      !window.location.hash.includes('error_description=')
    ) {
      console.log('[App.js useEffect] Cleaning hash:', window.location.hash);
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, document.title, cleanUrl);
    }

    return () => {
      clearTimeout(initialScrollTimer);
      if (delayedHomepageScrollTimer) {
        clearTimeout(delayedHomepageScrollTimer);
      }
      if (finalHomepageScrollTimer) {
        clearTimeout(finalHomepageScrollTimer);
      }
    };
  }, [location.pathname]); // Effect runs on path change


  useEffect(() => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }

    if (!isChatbotOpen && !showChatbotIconNotification && !hasShownNotificationThisSession) {
      notificationTimerRef.current = setTimeout(() => {
        setShowChatbotIconNotification(true);
        setHasShownNotificationThisSession(true); 
      }, 5000);
    }
  }, [isChatbotOpen, showChatbotIconNotification, hasShownNotificationThisSession]);


  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // console.log('Auth state change:', event, session);
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
        if (showChatbotIconNotification) {
          setChatOpenedViaNotification(true);
          setShowChatbotIconNotification(false); 
        } else {
          setChatOpenedViaNotification(false);
        }
      } else {
        setChatOpenedViaNotification(false);
      }
      return openingChatbot;
    });
  }, [showChatbotIconNotification]); // Removed setChatOpenedViaNotification, setChatSessionId, setShowChatbotIconNotification from deps as they are state setters


  const openAuthModal = () => {
    if (isChatbotOpen) {
        setIsChatbotOpen(false);
    }
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

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
        if (status === 'SUBSCRIBED') {
          // console.log('Subscribed to notifications channel for user:', user.id);
        } else if (err) {
          console.error('Error subscribing to notifications channel:', err);
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
            console.error("Error fetching initial due reminders:", error);
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
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal, isAuthModalOpen }}>
      <div className="App font-sans bg-gradient-to-b from-oxfordBlue via-oxfordBlue to-gentleGray overflow-x-hidden">
        <Header onAuthModalOpen={openAuthModal} />

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
                <Testimonials onAuthModalOpen={openAuthModal} />
                <OtherWins />
                <Interviews />
                <IncentivePage onChatbotOpen={toggleChatbot} onAuthModalOpen={openAuthModal} />
                <MergedServiceForm />
                <BottomCarouselPages />
              </main>
            }
          />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route
            path="/admin/testimonials"
            element={<PrivateRoute><TestimonialReview /></PrivateRoute>}
          />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
          <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
          <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage onChatOpen={toggleChatbot} /></PrivateRoute>} />
          <Route path="/edit-profile" element={<PrivateRoute><EditProfilePage /></PrivateRoute>} />
          <Route
            path="/messages"
            element={<PrivateRoute><DirectMessagesPage /></PrivateRoute>}
          />
          <Route path="/settings" element={<OptionalAuthRoute><SettingsPage acceptsFunctionalCookies={acceptsFunctionalCookies} /></OptionalAuthRoute>} />
          <Route path="/components/Subpages/Calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
          <Route path="/components/Subpages/Settings" element={<OptionalAuthRoute><SettingsPage acceptsFunctionalCookies={acceptsFunctionalCookies} /></OptionalAuthRoute>} />
          <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
        </Routes>

        <NavigationBar
          isChatbotOpen={isChatbotOpen}
          onChatbotClick={toggleChatbot}
          onAuthModalOpen={openAuthModal}
          showChatbotIconNotification={showChatbotIconNotification}
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
          onClose={closeAuthModal}
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
    </AuthModalContext.Provider>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <ServiceProvider>
          <Router>
            <AppContent />
          </Router>
        </ServiceProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;