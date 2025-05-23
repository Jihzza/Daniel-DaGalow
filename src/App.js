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

// Context to expose the AuthModal opener
export const AuthModalContext = createContext({
  openAuthModal: () => {}
});

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth(); // useAuth hook from your AuthContext
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white"> {/* Added text-white for visibility */}
        Loading...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth(); // useAuth hook from your AuthContext
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white"> {/* Added text-white for visibility */}
        Loading...
      </div>
    );
  }
  if (user) {
    return <Navigate to="/" />;
  }
  return children;
};

// This wrapper component is needed to use useLocation hook
function AppContent() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // Renamed from isChatOpen for clarity
  const [chatSessionId, setChatSessionId] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation(); // useLocation hook

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
      // console.log(event, session); // For debugging auth state changes
    });
    return () => subscription.unsubscribe();
  }, []);

  // Function to toggle chatbot visibility
  const toggleChatbot = (sessionId = null) => {
    console.log("App.js: toggleChatbot called. Current state:", isChatbotOpen); // For debugging
    if (sessionId && !isChatbotOpen) { // If opening with a session ID
        setChatSessionId(sessionId);
    }
    setIsChatbotOpen(prev => !prev);
  };


  const openAuthModal = () => {
    if (isChatbotOpen) { // If chatbot is open when trying to open auth modal, close chatbot
        setIsChatbotOpen(false);
    }
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Close chatbot if navigating to a new page and it's open
  useEffect(() => {
    if (isChatbotOpen) {
      // setIsChatbotOpen(false); // Commenting this out as per previous discussions, behavior might be desired differently
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Only trigger on pathname change


  const OptionalAuthRoute = ({ children }) => {
    const { loading } = useAuth(); // useAuth hook from your AuthContext
    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen text-white"> {/* Added text-white for visibility */}
          Loading...
        </div>
      );
    }
    return children;
  };

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal, isAuthModalOpen }}>
      <div className="App font-sans bg-gradient-to-b from-oxfordBlue via-oxfordBlue to-gentleGray overflow-x-hidden"> {/* Added overflow-x-hidden */}
        <Header onAuthModalOpen={openAuthModal} /> {/* Pass openAuthModal to Header */}
        <ScrollToTop /> {/* Component to scroll to top on route change */}

        <Routes>
          <Route
            path="/"
            element={
              <main className="mt-12 md:mt-24 lg:mt-20"> {/* Adjusted top margin for header */}
                <Hero />
                <About />
                <Services />
                <Coaching />
                <VentureInvestment />
                <Testimonials onAuthModalOpen={openAuthModal} /> {/* Pass openAuthModal */}
                <OtherWins />
                <Interviews />
                {/* THIS IS THE KEY CHANGE: Pass toggleChatbot to IncentivePage */}
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} /> {/* Changed from /auth/reset-password */}
          
          <Route path="/profile" element={<PrivateRoute><ProfilePage onChatOpen={toggleChatbot} /></PrivateRoute>} />
          <Route path="/edit-profile" element={<PrivateRoute><EditProfilePage /></PrivateRoute>} />
          
          <Route path="/settings" element={<OptionalAuthRoute><SettingsPage acceptsFunctionalCookies={acceptsFunctionalCookies} /></OptionalAuthRoute>} />
          <Route path="/components/Subpages/Calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
          <Route path="/components/Subpages/Settings" element={<OptionalAuthRoute><SettingsPage acceptsFunctionalCookies={acceptsFunctionalCookies} /></OptionalAuthRoute>} />
        </Routes>

        <NavigationBar
          isChatbotOpen={isChatbotOpen} // Pass the state
          onChatbotClick={toggleChatbot} // Pass the toggle function
          onAuthModalOpen={openAuthModal} // Pass the function to open auth modal
        />
        <AnimatePresence>
          {isChatbotOpen && ( // Use isChatbotOpen state here
            <ChatbotWindow
              sessionId={chatSessionId}
              onClose={toggleChatbot} // Pass toggleChatbot to close it
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
    <I18nextProvider i18n={i18n}> {/* Ensure i18n is initialized */}
      <AuthProvider>
        <ServiceProvider> {/* Assuming ServiceProvider is correctly set up */}
          <Router>
            <AppContent /> {/* Wrap content that uses useLocation */}
          </Router>
        </ServiceProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;
