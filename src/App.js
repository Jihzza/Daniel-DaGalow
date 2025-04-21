// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/contexts/AuthContext';
import AuthModal from './components/Auth/AuthModal';
import Header from './components/Header';
import Hero from './components/MainSections/Hero';
import About from './components/MainSections/About';
import Services from './components/MainSections/Services';
import Coaching from './components/MainSections/Coaching';
import Analysis from './components/MainSections/Analysis';
import Projects from './components/MainSections/Projects';
import VentureInvestment from './components/MainSections/VentureInvestment';
import Testimonials from './components/MainSections/Testimonials';
import Interviews from './components/MainSections/Interviews';
import Footer from './components/Footer';
import Music from './components/Subpages/Music';
import Videos from './components/Subpages/Videos';
import MergedServiceForm from './components/MergedServiceForm';
import Achievements from './components/Subpages/Achievements';
import AboutMe from './components/Subpages/AboutMe';
import BottomCarouselPages from './components/BottomCarouselPages';
import NavigationBar from './components/BottomNavBar/NavigationBar';
import ChatbotWindow from './components/BottomNavBar/ChatbotWindow';
import CalendarPage from './components/Subpages/CalendarPage';
import ProfilePage from './components/Subpages/ProfilePage';
import EditProfilePage from './components/Subpages/EditProfilePage';
import SettingsPage from './components/Subpages/SettingsPage';
import HomePage from './components/Subpages/HomePage';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import Dashboard from './components/Dashboard'; 

// Private route component to protect routes that require authentication
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
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
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (user) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleChatbotClick = () => {
    setIsChatOpen(open => !open);
  };

  const handleAuthModalOpen = () => {
    setAuthModalOpen(true);
  };
    
  return (
    <AuthProvider>
      <Router>
        <div className="App font-sans bg-gradient-to-b from-oxfordBlue from-0% via-oxfordBlue via-15% to-gentleGray">
          <Header onAuthModalOpen={handleAuthModalOpen} />
          <Routes>
            <Route path="/" element={
              <main>
                <Hero />
                <About />
                <Services />
                <Coaching />
                <Analysis />
                <Projects />
                <VentureInvestment />
                <Interviews />
                <Testimonials />
                <MergedServiceForm />
                <BottomCarouselPages />
                <NavigationBar 
                  onChatbotClick={handleChatbotClick} 
                  onAuthModalOpen={handleAuthModalOpen}
                />
                {isChatOpen && <ChatbotWindow onClose={() => setIsChatOpen(false)} />}
              </main>
            } />

            {/* Auth Routes - Public Only */}
            <Route path="/login" element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            } />
            <Route path="/signup" element={
              <PublicOnlyRoute>
                <Signup />
              </PublicOnlyRoute>
            } />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />
            <Route path="/edit-profile" element={
              <PrivateRoute>
                <EditProfilePage />
              </PrivateRoute>
            } />
            
            <Route path="/settings" element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            } />
            
            {/* Other Routes */}
            <Route path="/components/Subpages/Music" element={<Music />} />
            <Route path="/components/Subpages/Videos" element={<Videos />} />
            <Route path="/components/Subpages/Achievements" element={<Achievements />} />
            <Route path="/components/Subpages/AboutMe" element={<AboutMe />} />
            <Route path="/components/Subpages/Calendar" element={<CalendarPage />} />
            <Route path="/components/Subpages/Home" element={<HomePage />} />
            
            <Route path="/components/Subpages/Settings" element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            } />
          </Routes> 
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