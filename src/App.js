// App.js
import React from 'react';
import Header from './components/Header';
import Hero from './components/Pages/Hero';
import About from './components/Pages/About';
import Services from './components/Pages/Services';
import Projects from './components/Pages/Projects';
import Testimonials from './components/Pages/Testimonials';
import Booking from './components/Pages/Booking';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <div className="App font-sans bg-gradient-to-b from-oxfordBlue from-0% via-oxfordBlue via-40% to-gentleGray">
      {/* Sticky header */}
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Projects />
        <Testimonials />
        <Booking />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}

export default App;
