import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
import MergedServiceForm from "./components/forms/MergedServiceForm";
import BottomCarouselPages from "./components/carousel/BottomCarouselPages";
import NavigationBar from "./components/layout/NavigationBar";
import ChatbotWindow from "./components/chat/ChatbotWindow";
import CalendarPage from "./pages/profile/CalendarPage";
import ProfilePage from "./pages/profile/ProfilePage";
import EditProfilePage from "./pages/profile/EditProfilePage";
import SettingsPage from "./pages/profile/SettingsPage";
import HomePage from "./pages/HomePage";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import { useAuth } from "./contexts/AuthContext";
import Footer from "./components/layout/Footer";
import Music from "./pages/content/Music";
import Videos from "./pages/content/Videos";
import TestimonialReview from "./pages/admin/TestimonialReview";
import IncentivePage from "./components/home-sections/IncentivePage";
import OtherWins from "./components/home-sections/OtherWins";
// Private route component to protect routes that require authentication
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

// Public only route - redirects authenticated users away from login/signup pages
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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(null);

  const openChat = (sessionId = null) => {
    setChatSessionId(sessionId);
    setIsChatOpen(true);
  };

  const handleChatbotClick = () => {
    setIsChatOpen((open) => !open);
  };

  const handleAuthModalOpen = () => {
    setAuthModalOpen(true);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="App font-sans bg-gradient-to-b from-oxfordBlue via-oxfordBlue to-gentleGray overflow-hidden">
          <Header onAuthModalOpen={handleAuthModalOpen} />
          <main className="pt-14">
            <Routes>
              <Route
                path="/"
                element={
                  <main>
                    <Hero />
                    <About />
                    <Services />
                    <Coaching />
                    <Analysis />
                    <Projects />
                    <VentureInvestment />
                    
                    <Interviews />
                    <IncentivePage />
                    <Testimonials onAuthModalOpen={handleAuthModalOpen} />
                    <OtherWins />
                    <MergedServiceForm />
                    <BottomCarouselPages />
                  </main>
                }
              />

              <Route
                path="/admin/testimonials"
                element={
                  <PrivateRoute>
                    <TestimonialReview />
                  </PrivateRoute>
                }
              />

              {/* Auth Routes - Public Only */}
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicOnlyRoute>
                    <Signup />
                  </PublicOnlyRoute>
                }
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage onChatOpen={openChat} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/edit-profile"
                element={
                  <PrivateRoute>
                    <EditProfilePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <SettingsPage />
                  </PrivateRoute>
                }
              />

              {/* Other Routes */}
              <Route path="/components/Subpages/Music" element={<Music />} />
              <Route path="/components/Subpages/Videos" element={<Videos />} />

              <Route
                path="/components/Subpages/Calendar"
                element={
                  <PrivateRoute>
                    <CalendarPage />
                  </PrivateRoute>
                }
              />
              <Route path="/components/Subpages/Home" element={<HomePage />} />
              <Route
                path="/components/Subpages/Settings"
                element={
                  <PrivateRoute>
                    <SettingsPage />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          {/* Always-on Navigation Bar & Chatbot */}
          <NavigationBar
            onChatbotClick={() => openChat()}
            onAuthModalOpen={handleAuthModalOpen}
          />
          <AnimatePresence>
            {isChatOpen && (
              <ChatbotWindow
                sessionId={chatSessionId}
                onClose={() => setIsChatOpen(false)}
              />
            )}
          </AnimatePresence>

          <Footer />
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;