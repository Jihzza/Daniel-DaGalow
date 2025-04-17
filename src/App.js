// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Pages/Hero';
import About from './components/Pages/About';
import Services from './components/Pages/Services';
import Projects from './components/Pages/Projects';
import VentureInvestment from './components/Pages/VentureInvestment';
import Testimonials from './components/Pages/Testimonials';
import Booking from './components/Pages/Booking';
import Interviews from './components/Pages/Interviews';
import AnalysisRequest from './components/Pages/AnalysisRequest';
import CoachingRequest from './components/Pages/CoachingRequest';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Music from './components/Subpages/Music';
import Videos from './components/Subpages/Videos';
import FAQs from './components/Pages/FAQs';

function App() {
  return (
    <Router>
      <div className="App font-sans bg-gradient-to-b from-oxfordBlue from-0% via-oxfordBlue via-15% to-gentleGray">
        <Header />
        <Routes>
          <Route path="/" element={
            <main>
              <Hero />
              <About />
              <Services />
              <Projects />
              <VentureInvestment />
              <Interviews />
              <Testimonials />
              <AnalysisRequest />
              <CoachingRequest />
              <Booking />
              <FAQs />
            </main>
          } />
          <Route path="/components/Subpages/Music" element={<Music />} />
          <Route path="/components/Subpages/Videos" element={<Videos />} />
        </Routes>
        <Footer />
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
