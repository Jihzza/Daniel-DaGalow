// components/Header.js
import React, { useState } from 'react';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-black bg-opacity-80 text-white z-50 w-full">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
        <div className="text-xl font-bold">
          {/* Replace with your logo or brand name */}
          Daniel DaGalow
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden focus:outline-none"
        >
          {/* Hamburger Icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" 
               viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <nav className={`md:flex md:items-center md:space-x-6 absolute md:static 
                         top-full left-0 w-full bg-black md:bg-transparent transition-all
                         ${menuOpen ? "block" : "hidden"}`}>
          <a href="#hero" className="block px-4 py-2 hover:text-gold">
            Home
          </a>
          <a href="#about" className="block px-4 py-2 hover:text-gold">
            About
          </a>
          <a href="#services" className="block px-4 py-2 hover:text-gold">
            Services
          </a>
          <a href="#projects" className="block px-4 py-2 hover:text-gold">
            Projects
          </a>
          <a href="#booking" className="block px-4 py-2 hover:text-gold">
            Book Now
          </a>
          <a href="#contact" className="block px-4 py-2 hover:text-gold">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
