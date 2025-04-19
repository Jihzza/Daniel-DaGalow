// App.js
import React from 'react';
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
import Interviews from './components/MainSections/Interviews';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Music from './components/Subpages/Music';
import Videos from './components/Subpages/Videos';
import MergedServiceForm from './components/MergedServiceForm';
import FAQs from './components/MainSections/FAQs';
import Achievements from './components/Subpages/Achievements';
import AboutMe from './components/Subpages/AboutMe';
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
              <FAQs />
            </main>
          } />
          <Route path="/components/Subpages/Music" element={<Music />} />
          <Route path="/components/Subpages/Videos" element={<Videos />} />
          <Route path="/components/Subpages/Achievements" element={<Achievements />} />
          <Route path="/components/Subpages/AboutMe" element={<AboutMe />} />
        </Routes>
        <Footer />
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;