// src/App.js
import React, { useState, createContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link, // Import Link for the Privacy Policy link in the banner
  useLocation // Import useLocation
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import CookieConsent, { Cookies } from "react-cookie-consent"; // <- Add this import

import { supabase } from "./utils/supabaseClient";
import { AuthProvider, useAuth } from "./contexts/AuthContext"; // Ensure useAuth is imported if used in this file
import { ServiceProvider } from "./contexts/ServiceContext"; // Assuming you have this
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
import ScrollToTopButton from "./components/common/ScrollToTopButton"; // Import the button
import TestimonialReview from "./pages/admin/TestimonialReview";
import BookingSuccess from "./pages/BookingSuccess";
import { I18nextProvider } from 'react-i18next'; // For internationalization
import i18n from './i18n'; // Your i18n configuration file

// NEW: Import the DirectMessagesPage component
import DirectMessagesPage from './pages/DirectMessages'; // Adjust path if necessary

// Context to expose the AuthModal opener
export const AuthModalContext = createContext({
  openAuthModal: () => {}
});

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />; // Added replace for better history management
  }
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading...
      </div>
    );
  }
  if (user) {
    return <Navigate to="/" replace />; // Added replace
  }
  return children;
};

// This wrapper component is needed to use useLocation hook
function AppContent() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();

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
    // Optional: Close chatbot on route change if desired, but often better to let user manage it.
    // if (isChatbotOpen) {
    //   setIsChatbotOpen(false);
    // }
  }, [location.pathname]);


  const OptionalAuthRoute = ({ children }) => {
    const { loading } = useAuth();
    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen text-white">
          Loading...
        </div>
      );
    }
    return children;
  };

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal, isAuthModalOpen }}>
      <div className="App font-sans bg-gradient-to-b from-oxfordBlue via-oxfordBlue to-gentleGray overflow-x-hidden">
        <Header onAuthModalOpen={openAuthModal} /> {/* This prop is correctly passed */}
        <ScrollToTop />

        <Routes>
          <Route
            path="/"
            element={
              <main className="mt-14 md:mt-24 lg:mt-20"> {/* Adjusted based on Header's height */}
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
          
          {/* NEW: Route for Direct Messages Page */}
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <DirectMessagesPage />
              </PrivateRoute>
            }
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