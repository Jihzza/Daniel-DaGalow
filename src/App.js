// src/App.js
import React, { useState, createContext, useEffect } from "react";
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
import ScrollToTop from "./components/common/ScrollToTop";
import ScrollToTopButton from "./components/common/ScrollToTopButton";
import TestimonialReview from "./pages/admin/TestimonialReview";
import BookingSuccess from "./pages/BookingSuccess";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import DirectMessagesPage from './pages/DirectMessages';

// NEW: Import notification utility functions
import {
  requestNotificationPermission,
  getNotificationPermission,
  isNotificationAPISupported,
  showNotification
} from "./utils/notificationUtils"; // Adjust path if needed

export const AuthModalContext = createContext({
  openAuthModal: () => {}
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
  const { user } = useAuth(); // Get user from AuthContext
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();

  // NEW: State for notification permission
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission());

  const [acceptsFunctionalCookies, setAcceptsFunctionalCookies] = useState(
    () => Cookies.get("siteCookieConsent") === "true"
  );

  useEffect(() => {
    setAcceptsFunctionalCookies(Cookies.get("siteCookieConsent") === "true");
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.location.hash) {
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, '', cleanUrl);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // console.log('Auth state change:', event, session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const toggleChatbot = (sessionId = null) => {
    if (sessionId && !isChatbotOpen) {
        setChatSessionId(sessionId);
    }
    setIsChatbotOpen(prev => !prev);
  };

  const openAuthModal = () => {
    if (isChatbotOpen) {
        setIsChatbotOpen(false);
    }
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

  useEffect(() => {
    // Optional: Close chatbot on route change
    // if (isChatbotOpen) {
    //   setIsChatbotOpen(false);
    // }
  }, [location.pathname]);

  // NEW: Handler to request notification permission
  const handleRequestNotification = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
  };

  // NEW: useEffect for real-time notifications and initial check
  useEffect(() => {
    if (!user || notificationPermission !== 'granted') {
      return; // Only listen if user is logged in and permission is granted
    }

    const processAndShowNotification = (payload) => {
      const newNotification = payload.new;
      // console.log("Real-time: New notification received from DB:", newNotification);

      if (newNotification.type === 'reminder' && !newNotification.is_read) {
        const notifyAtDate = newNotification.notify_at ? new Date(newNotification.notify_at) : null;
        const now = new Date();
        const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
        const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000); // Only consider recently created

        // Logic to show pop-up:
        // 1. notify_at is in the past or within the next 5 minutes.
        // 2. The notification record itself was created in the last hour (to avoid old pop-ups on login).
        if (notifyAtDate && notifyAtDate <= fiveMinutesFromNow && new Date(newNotification.created_at) >= oneHourAgo) {
          // console.log("Showing browser notification for:", newNotification.message);
          showNotification("Consultation Reminder", {
            body: newNotification.message,
            icon: "/logo192.png", // Replace with your actual logo path (e.g., in public folder)
            tag: `reminder-${newNotification.id}` // Helps prevent duplicate popups if event fires multiple times
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

    // Check for any already existing unread reminders that might be due when app loads/user logs in
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
                 // console.log("Showing initial browser notification for:", n.message);
                 showNotification("Consultation Reminder", {
                    body: n.message,
                    icon: "/logo192.png", // Replace with your actual logo path
                    tag: `reminder-${n.id}`
                 }, n.link);
            });
        }
    };
    checkForInitialDueReminders();

    return () => {
      if (notificationsChannel) {
        supabase.removeChannel(notificationsChannel);
        // console.log('Unsubscribed from notifications channel.');
      }
    };
  }, [user, notificationPermission]); // Re-run if user or notificationPermission changes

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
        <ScrollToTop />

        {/* NEW: UI to request notification permission */}
        {isNotificationAPISupported() && notificationPermission === 'default' && (
          <div style={{
            position: 'fixed',
            bottom: '70px', // Adjusted to be above nav bar + some padding
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 15px',
            background: 'rgba(30,30,30,0.9)', // Darker, slightly transparent
            color: 'white',
            borderRadius: '8px',
            zIndex: 1001, // Ensure it's above most content, below modals
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
                // Hide the banner for this session if user clicks "Later"
                // A more robust solution might use localStorage to remember dismissal
                const banner = document.querySelector('[style*="position: fixed"][style*="bottom: 70px"]');
                if (banner) banner.style.display = 'none';
              }}
              className="ml-3 text-gray-400 px-3 py-1.5 text-sm hover:text-white"
            >
              Later
            </button>
          </div>
        )}
        {/* End NEW UI */}

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
        />
        <AnimatePresence>
          {isChatbotOpen && (
            <ChatbotWindow
              sessionId={chatSessionId}
              onClose={toggleChatbot}
            />
          )}
        </AnimatePresence>
        <ScrollToTopButton />
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
