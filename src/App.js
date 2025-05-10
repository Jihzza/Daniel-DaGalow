import React, { useState, createContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link // Import Link for the Privacy Policy link in the banner
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import CookieConsent, { Cookies } from "react-cookie-consent"; // <- Add this import

import { supabase } from "./utils/supabaseClient";
import { AuthProvider } from "./contexts/AuthContext";
import AuthModal from "./components/Auth/AuthModal";
import Header from "./components/layout/Header";
import Hero from "./components/home-sections/Hero";
import About from "./components/home-sections/About";
import Services from "./components/home-sections/Services";
import Coaching from "./components/home-sections/Coaching";
import Analysis from "./components/home-sections/Analysis";
import Projects from "./components/home-sections/Projects";
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
import TestimonialReview from "./pages/admin/TestimonialReview";
import BookingSuccess from "./pages/BookingSuccess";
import { useAuth } from "./contexts/AuthContext";
// Removed duplicate CookieConsent import here

// Context to expose the AuthModal opener
export const AuthModalContext = createContext({
  openAuthModal: () => {}
});

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
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
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }
  if (user) {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // ---- START: Cookie Consent Changes ----
  const [acceptsFunctionalCookies, setAcceptsFunctionalCookies] = useState(
    () => Cookies.get("siteCookieConsent") === "true" // Check initial state from cookie
  );

  useEffect(() => {
    // Re-check on component mount in case cookie was set/cleared differently
    setAcceptsFunctionalCookies(Cookies.get("siteCookieConsent") === "true");
    console.log("Initial cookie consent check:", Cookies.get("siteCookieConsent") === "true");
  }, []);
  // ---- END: Cookie Consent Changes ----


  // Reset scroll position and clear hash fragments on load
  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.location.hash) {
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, '', cleanUrl);
    }
  }, []);

  // Subscribe to Supabase auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    });
    return () => subscription.unsubscribe();
  }, []);

  const openChat = (sessionId = null) => {
    setChatSessionId(sessionId);
    setIsChatOpen(true);
  };

  const OptionalAuthRoute = ({ children }) => {
    const { loading } = useAuth();
    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          Loading...
        </div>
      );
    }
    // Pass the consent state down if needed
    // return React.cloneElement(children, { acceptsFunctionalCookies });
    return children; // Simpler approach: pass prop directly in Route element
  };

  const openAuthModal = () => setAuthModalOpen(true);

  return (
    <AuthModalContext.Provider value={{ openAuthModal }}>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="App font-sans bg-gradient-to-b from-oxfordBlue via-oxfordBlue to-gentleGray overflow-hidden">
            <Header onAuthModalOpen={openAuthModal} />

            <Routes>
              <Route
                path="/"
                element={
                  <main className="mt-14 md:mt-24 lg:mt-20">
                    {/* Pass consent state if Hero or other components need it */}
                    <Hero />
                    <About />
                    <Services />
                    <Coaching />
                    <Analysis />
                    <Projects />
                    <VentureInvestment />
                    <Interviews />
                    <IncentivePage />
                    <Testimonials onAuthModalOpen={openAuthModal} />
                    <OtherWins />
                    <MergedServiceForm />
                    <BottomCarouselPages />
                  </main>
                }
              />

              {/* Stripe redirects here on successful payment */}
              <Route path="/booking-success" element={<BookingSuccess />} />

              <Route
                path="/admin/testimonials"
                element={
                  <PrivateRoute>
                    <TestimonialReview />
                  </PrivateRoute>
                }
              />

              {/* Auth Routes - Public Only */}
              <Route path="/login" element={ <PublicOnlyRoute><Login /></PublicOnlyRoute> } />
              <Route path="/signup" element={ <PublicOnlyRoute><Signup /></PublicOnlyRoute> } />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route path="/profile" element={ <PrivateRoute><ProfilePage onChatOpen={openChat} /></PrivateRoute> } />
              <Route path="/edit-profile" element={ <PrivateRoute><EditProfilePage /></PrivateRoute> } />

              {/* Settings route - pass consent state */}
              <Route path="/settings" element={ <OptionalAuthRoute><SettingsPage acceptsFunctionalCookies={acceptsFunctionalCookies} /></OptionalAuthRoute>} />

              <Route path="/components/Subpages/Calendar" element={ <PrivateRoute><CalendarPage /></PrivateRoute> } />

              {/* Another Settings Route - ensure it also gets the prop */}
              <Route path="/components/Subpages/Settings" element={<OptionalAuthRoute><SettingsPage acceptsFunctionalCookies={acceptsFunctionalCookies} /></OptionalAuthRoute>} />

            </Routes>

            {/* Always-on Navigation Bar & Chatbot */}
            <NavigationBar
              onChatbotClick={() => openChat()}
              onAuthModalOpen={openAuthModal}
            />
            <AnimatePresence>
              {isChatOpen && (
                <ChatbotWindow
                  sessionId={chatSessionId}
                  onClose={() => setIsChatOpen(false)}
                />
              )}
            </AnimatePresence>

            <AuthModal
              isOpen={authModalOpen}
              onClose={() => setAuthModalOpen(false)}
            />
            <Footer />

            {/* ---- START: Cookie Consent Component ---- */}
            <CookieConsent
              location="bottom"
              buttonText="Accept Cookies"
              cookieName="siteCookieConsent" // This name MUST match the one used in useState/useEffect
              style={{ background: "#001F3F", color: "#FFFFFF", fontSize: "13px", borderTop: "1px solid #BFA200", zIndex: 1000 }} // Ensure high z-index
              buttonStyle={{ color: "#000000", background: "#BFA200", fontSize: "14px", borderRadius: "5px", padding: "8px 15px", fontWeight: "bold" }}
              expires={150}
              onAccept={() => {
                console.log("User accepted cookies via banner");
                setAcceptsFunctionalCookies(true);
                // Optional: Initialize things that depend on consent here
              }}
              enableDeclineButton
              declineButtonText="Decline"
              declineButtonStyle={{ background: "#555", color: "#fff", fontSize: "14px", borderRadius: "5px", padding: "8px 15px", marginLeft: "10px" }}
              onDecline={() => {
                 console.log("User declined cookies via banner");
                 setAcceptsFunctionalCookies(false);
                 // You might want to explicitly delete non-essential cookies here
                 // import { deleteCookie } from './utils/cookieUtils'; // If needed
                 // deleteCookie('userTheme');
              }}
              // debug={true} // Remove this in production
            >
              This website uses cookies to enhance the user experience. See our{" "}
              <Link to="/settings" state={{ section: 'privacy-policy' }} style={{ color: "#BFA200", textDecoration: "underline" }}>
                Privacy Policy
              </Link> for more details. {/* Ensure you have a way to navigate/show this */}
            </CookieConsent>
            {/* ---- END: Cookie Consent Component ---- */}

          </div>
        </Router>
      </AuthProvider>
    </AuthModalContext.Provider>
  );
}

export default App;