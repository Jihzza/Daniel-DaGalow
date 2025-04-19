// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/MainSections/Hero';
import About from './components/MainSections/About';
import Services from './components/MainSections/Services';
import Coaching from './components/MainSections/Coaching';
import Analysis from './components/MainSections/Analysis';
import Projects from './components/MainSections/Projects';
import VentureInvestment from './components/MainSections/VentureInvestment';
import Testimonials from './components/MainSections/Testimonials';
import Chatbot from './components/Subpages/Chatbot';
import Interviews from './components/MainSections/Interviews';
import Footer from './components/Footer';
import Music from './components/Subpages/Music';
import Videos from './components/Subpages/Videos';
import MergedServiceForm from './components/MergedServiceForm';
import Achievements from './components/Subpages/Achievements';
import AboutMe from './components/Subpages/AboutMe';
import BottomCarouselPages from './components/BottomCarouselPages';
import NavigationBar from './components/NavigationBar';
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
              <Coaching />
              <Analysis />
              <Projects />
              <VentureInvestment />
              <Interviews />
              <Testimonials />
              <MergedServiceForm />
              <BottomCarouselPages />
              <NavigationBar />
            </main>
          } />
          <Route path="/components/Subpages/Music" element={<Music />} />
          <Route path="/components/Subpages/Videos" element={<Videos />} />
          <Route path="/components/Subpages/Achievements" element={<Achievements />} />
          <Route path="/components/Subpages/AboutMe" element={<AboutMe />} />
          <Route path="/components/Subpages/Chatbot" element={<Chatbot />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;